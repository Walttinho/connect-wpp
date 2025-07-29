// src/services/amazonConnectChatService.ts
import { AMAZON_CONNECT_CONFIG } from '../config/amazonConnect';

export interface ChatSession {
  connectionToken: string;
  websocketUrl: string;
  chatId: string;
  participantToken: string;
  participantId: string;
}

export interface ChatMessage {
  id: string;
  type: 'MESSAGE' | 'EVENT' | 'ATTACHMENT';
  content: string;
  contentType: string;
  participantId: string;
  participantRole: 'AGENT' | 'CUSTOMER' | 'SYSTEM';
  displayName?: string;
  timestamp: Date;
}

export interface ChatParticipant {
  id: string;
  role: 'AGENT' | 'CUSTOMER';
  displayName: string;
}

export class AmazonConnectChatService {
  private static instance: AmazonConnectChatService;
  private websocket: WebSocket | null = null;
  private chatSession: ChatSession | null = null;
  private messageHandlers: ((message: ChatMessage) => void)[] = [];
  private eventHandlers: ((event: any) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private constructor() {}

  static getInstance(): AmazonConnectChatService {
    if (!AmazonConnectChatService.instance) {
      AmazonConnectChatService.instance = new AmazonConnectChatService();
    }
    return AmazonConnectChatService.instance;
  }

  /**
   * Inicia uma nova sessão de chat
   */
  async startChatSession(contactAttributes?: Record<string, string>): Promise<ChatSession> {
    try {
      const response = await fetch(`${AMAZON_CONNECT_CONFIG.INSTANCE_URL}api/chat/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceId: this.extractInstanceId(AMAZON_CONNECT_CONFIG.INSTANCE_URL),
          contactFlowId: AMAZON_CONNECT_CONFIG.CONTACT_FLOW_ID,
          attributes: {
            ...AMAZON_CONNECT_CONFIG.DEFAULT_CALL_ATTRIBUTES,
            ...contactAttributes,
          },
          participantDetails: {
            displayName: 'Agente WhatsApp'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao iniciar chat: ${response.statusText}`);
      }

      const data = await response.json();
      
      this.chatSession = {
        connectionToken: data.ConnectionToken,
        websocketUrl: data.WebsocketUrl,
        chatId: data.ChatId,
        participantToken: data.ParticipantToken,
        participantId: data.ParticipantId
      };

      // Conecta ao WebSocket
      await this.connectWebSocket();

      return this.chatSession;

    } catch (error) {
      console.error('Erro ao iniciar sessão de chat:', error);
      throw error;
    }
  }

  /**
   * Conecta ao WebSocket do Amazon Connect
   */
  private async connectWebSocket(): Promise<void> {
    if (!this.chatSession) {
      throw new Error('Sessão de chat não inicializada');
    }

    try {
      this.websocket = new WebSocket(this.chatSession.websocketUrl, 'chat');
      
      this.websocket.onopen = () => {
        console.log('WebSocket conectado ao Amazon Connect Chat');
        this.reconnectAttempts = 0;
        
        // Envia token de autenticação
        this.sendWebSocketMessage({
          topic: 'aws/subscribe',
          content: {
            connectionToken: this.chatSession!.connectionToken
          }
        });
      };

      this.websocket.onmessage = (event) => {
        this.handleWebSocketMessage(JSON.parse(event.data));
      };

      this.websocket.onclose = (event) => {
        console.log('WebSocket desconectado:', event.code, event.reason);
        this.handleWebSocketClose();
      };

      this.websocket.onerror = (error) => {
        console.error('Erro no WebSocket:', error);
      };

    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
      throw error;
    }
  }

  /**
   * Reconecta ao WebSocket em caso de desconexão
   */
  private handleWebSocketClose(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connectWebSocket().catch(console.error);
      }, 2000 * this.reconnectAttempts);
    } else {
      console.error('Máximo de tentativas de reconexão atingido');
    }
  }

  /**
   * Processa mensagens recebidas via WebSocket
   */
  private handleWebSocketMessage(data: any): void {
    console.log('Mensagem recebida via WebSocket:', data);

    switch (data.topic) {
      case 'aws/chat':
        if (data.content && data.content.Type === 'MESSAGE') {
          const message: ChatMessage = {
            id: data.content.Id,
            type: data.content.Type,
            content: data.content.Content,
            contentType: data.content.ContentType,
            participantId: data.content.ParticipantId,
            participantRole: data.content.ParticipantRole,
            displayName: data.content.DisplayName,
            timestamp: new Date(data.content.AbsoluteTime)
          };
          
          this.notifyMessageHandlers(message);
        }
        break;
        
      case 'aws/event':
        this.notifyEventHandlers(data.content);
        break;
        
      default:
        console.log('Tópico não reconhecido:', data.topic);
    }
  }

  /**
   * Envia mensagem via WebSocket
   */
  private sendWebSocketMessage(message: any): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket não está conectado');
    }
  }

  /**
   * Envia mensagem de texto no chat
   */
  async sendMessage(content: string, contentType: string = 'text/plain'): Promise<void> {
    if (!this.chatSession) {
      throw new Error('Sessão de chat não inicializada');
    }

    try {
      const response = await fetch(`${AMAZON_CONNECT_CONFIG.INSTANCE_URL}api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.chatSession.participantToken}`
        },
        body: JSON.stringify({
          connectionToken: this.chatSession.connectionToken,
          content: content,
          contentType: contentType
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar mensagem: ${response.statusText}`);
      }

      console.log('Mensagem enviada com sucesso');

    } catch (error) {
      console.error('Erro ao enviar mensagem via chat:', error);
      throw error;
    }
  }

  /**
   * Envia anexo no chat
   */
  async sendAttachment(file: File): Promise<void> {
    if (!this.chatSession) {
      throw new Error('Sessão de chat não inicializada');
    }

    try {
      // 1. Solicita URL para upload
      const uploadResponse = await fetch(`${AMAZON_CONNECT_CONFIG.INSTANCE_URL}api/chat/attachment/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.chatSession.participantToken}`
        },
        body: JSON.stringify({
          connectionToken: this.chatSession.connectionToken,
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type
        })
      });

      if (!uploadResponse.ok) {
        throw new Error(`Erro ao solicitar upload: ${uploadResponse.statusText}`);
      }

      const uploadData = await uploadResponse.json();

      // 2. Faz upload do arquivo
      const formData = new FormData();
      formData.append('file', file);
      
      const fileUploadResponse = await fetch(uploadData.uploadUrl, {
        method: 'POST',
        body: formData
      });

      if (!fileUploadResponse.ok) {
        throw new Error(`Erro no upload do arquivo: ${fileUploadResponse.statusText}`);
      }

      // 3. Envia mensagem de anexo
      await this.sendMessage(uploadData.attachmentId, 'application/vnd.amazonaws.connect.message.interactive');

      console.log('Anexo enviado com sucesso');

    } catch (error) {
      console.error('Erro ao enviar anexo:', error);
      throw error;
    }
  }

  /**
   * Obtém histórico de mensagens do chat
   */
  async getChatHistory(maxResults: number = 50): Promise<ChatMessage[]> {
    if (!this.chatSession) {
      throw new Error('Sessão de chat não inicializada');
    }

    try {
      const response = await fetch(`${AMAZON_CONNECT_CONFIG.INSTANCE_URL}api/chat/transcript`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.chatSession.participantToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao obter histórico: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.Transcript?.map((item: any) => ({
        id: item.Id,
        type: item.Type,
        content: item.Content,
        contentType: item.ContentType,
        participantId: item.ParticipantId,
        participantRole: item.ParticipantRole,
        displayName: item.DisplayName,
        timestamp: new Date(item.AbsoluteTime)
      })) || [];

    } catch (error) {
      console.error('Erro ao obter histórico do chat:', error);
      throw error;
    }
  }

  /**
   * Finaliza a sessão de chat
   */
  async endChatSession(): Promise<void> {
    try {
      if (this.chatSession) {
        await fetch(`${AMAZON_CONNECT_CONFIG.INSTANCE_URL}api/chat/disconnect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.chatSession.participantToken}`
          },
          body: JSON.stringify({
            connectionToken: this.chatSession.connectionToken
          })
        });
      }

      if (this.websocket) {
        this.websocket.close();
        this.websocket = null;
      }

      this.chatSession = null;
      console.log('Sessão de chat finalizada');

    } catch (error) {
      console.error('Erro ao finalizar sessão de chat:', error);
    }
  }

  /**
   * Registra handler para mensagens recebidas
   */
  onMessage(handler: (message: ChatMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  /**
   * Remove handler de mensagens
   */
  removeMessageHandler(handler: (message: ChatMessage) => void): void {
    const index = this.messageHandlers.indexOf(handler);
    if (index > -1) {
      this.messageHandlers.splice(index, 1);
    }
  }

  /**
   * Registra handler para eventos
   */
  onEvent(handler: (event: any) => void): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove handler de eventos
   */
  removeEventHandler(handler: (event: any) => void): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Notifica todos os handlers de mensagem
   */
  private notifyMessageHandlers(message: ChatMessage): void {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Erro ao processar handler de mensagem:', error);
      }
    });
  }

  /**
   * Notifica todos os handlers de evento
   */
  private notifyEventHandlers(event: any): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('Erro ao processar handler de evento:', error);
      }
    });
  }

  /**
   * Extrai o ID da instância da URL
   */
  private extractInstanceId(instanceUrl: string): string {
    const match = instanceUrl.match(/https:\/\/([^.]+)\.my\.connect\.aws\//);
    return match ? match[1] : '';
  }

  /**
   * Verifica se há uma sessão ativa
   */
  isSessionActive(): boolean {
    return this.chatSession !== null && 
           this.websocket !== null && 
           this.websocket.readyState === WebSocket.OPEN;
  }

  /**
   * Obtém informações da sessão atual
   */
  getCurrentSession(): ChatSession | null {
    return this.chatSession;
  }

  /**
   * Limpa recursos e desconecta
   */
  destroy(): void {
    this.endChatSession();
    this.messageHandlers = [];
    this.eventHandlers = [];
  }
}