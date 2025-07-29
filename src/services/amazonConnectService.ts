// src/services/amazonConnectService.ts
export interface ConnectConfig {
  instanceUrl: string;
  contactFlowId: string;
  region: string;
}

export interface CallSession {
  id: string;
  contactId: string;
  phoneNumber: string;
  status: 'connecting' | 'connected' | 'ended' | 'failed';
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export interface ConnectAgent {
  agentId: string;
  name: string;
  status: 'available' | 'busy' | 'offline';
}

export class AmazonConnectService {
  private static instance: AmazonConnectService;
  private config: ConnectConfig;
  private ccpInitialized: boolean = false;
  private activeSessions: Map<string, CallSession> = new Map();

  constructor() {
    this.config = {
      instanceUrl: 'https://12162024walter.my.connect.aws/',
      contactFlowId: '0b6d1298-e73a-422b-9db6-f62c8c5a74c0',
      region: 'us-east-1'
    };
  }

  static getInstance(): AmazonConnectService {
    if (!AmazonConnectService.instance) {
      AmazonConnectService.instance = new AmazonConnectService();
    }
    return AmazonConnectService.instance;
  }

  /**
   * Inicializa o Amazon Connect CCP (Contact Control Panel)
   */
  async initializeCCP(containerDiv: HTMLDivElement): Promise<void> {
    if (this.ccpInitialized) {
      console.log('CCP já inicializado');
      return;
    }

    try {
      // Carrega o Amazon Connect Streams API
      await this.loadConnectStreams();

      // Configura o CCP
      const ccpUrl = `${this.config.instanceUrl}ccp-v2/`;
      
      // Inicializa o CCP
      (window as any).connect.core.initCCP(containerDiv, {
        ccpUrl: ccpUrl,
        loginPopup: false,
        loginPopupAutoClose: false,
        loginOptions: {
          autoClose: true,
          height: 600,
          width: 400,
          top: 0,
          left: 0
        },
        softphone: {
          allowFramedSoftphone: true,
          disableRingtone: false,
          ringtoneUrl: null
        },
        pageOptions: {
          enableAudioDeviceSettings: true,
          enablePhoneTypeSettings: true
        }
      });

      // Configura os event listeners
      this.setupEventListeners();
      
      this.ccpInitialized = true;
      console.log('Amazon Connect CCP inicializado com sucesso');
      
    } catch (error) {
      console.error('Erro ao inicializar Amazon Connect CCP:', error);
      throw error;
    }
  }

  /**
   * Carrega a biblioteca Amazon Connect Streams
   */
  private async loadConnectStreams(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).connect) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/amazon-connect-streams@2.18.4/release/connect-streams.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Falha ao carregar Amazon Connect Streams'));
      document.head.appendChild(script);
    });
  }

  /**
   * Configura os event listeners do Amazon Connect
   */
  private setupEventListeners(): void {
    const connect = (window as any).connect;

    // Listener para mudanças de status do agente
    connect.agent((agent: any) => {
      console.log('Agente conectado:', agent.getName());
      
      agent.onStateChange((agentStateChange: any) => {
        console.log('Status do agente mudou:', agentStateChange.newState);
        this.onAgentStateChange(agentStateChange);
      });
    });

    // Listener para contatos (chamadas)
    connect.contact((contact: any) => {
      console.log('Novo contato:', contact.getContactId());
      
      const session: CallSession = {
        id: contact.getContactId(),
        contactId: contact.getContactId(),
        phoneNumber: this.extractPhoneNumber(contact),
        status: 'connecting',
        startTime: new Date()
      };

      this.activeSessions.set(session.id, session);

      // Listeners para mudanças de estado do contato
      contact.onConnecting(() => {
        console.log('Contato conectando...');
        this.updateSessionStatus(session.id, 'connecting');
      });

      contact.onConnected(() => {
        console.log('Contato conectado');
        this.updateSessionStatus(session.id, 'connected');
      });

      contact.onEnded(() => {
        console.log('Contato finalizado');
        this.updateSessionStatus(session.id, 'ended');
        this.endSession(session.id);
      });

      contact.onError(() => {
        console.log('Erro no contato');
        this.updateSessionStatus(session.id, 'failed');
      });
    });
  }

  /**
   * Inicia uma chamada outbound
   */
  async makeOutboundCall(phoneNumber: string, attributes?: Record<string, string>): Promise<string> {
    try {
      if (!this.ccpInitialized) {
        throw new Error('CCP não inicializado');
      }

      const connect = (window as any).connect;
      const endpoint = connect.Endpoint.byPhoneNumber(phoneNumber);
      
      const contactAttributes = {
        'CustomerPhoneNumber': phoneNumber,
        'Source': 'WhatsApp-Salesforce-Integration',
        ...attributes
      };

      return new Promise((resolve, reject) => {
        connect.agent((agent: any) => {
          if (agent.getState().name !== 'Available') {
            reject(new Error('Agente não está disponível para fazer chamadas'));
            return;
          }

          agent.connect(endpoint, {
            queueId: null,
            attributes: contactAttributes,
            success: (data: any) => {
              console.log('Chamada iniciada com sucesso:', data.contactId);
              resolve(data.contactId);
            },
            failure: (err: any) => {
              console.error('Erro ao iniciar chamada:', err);
              reject(new Error('Falha ao iniciar chamada: ' + err.message));
            }
          });
        });
      });
      
    } catch (error) {
      console.error('Erro ao fazer chamada:', error);
      throw error;
    }
  }

  /**
   * Finaliza uma chamada ativa
   */
  async endCall(contactId: string): Promise<void> {
    try {
      const connect = (window as any).connect;
      const contact = connect.core.getContactById(contactId);
      
      if (contact) {
        contact.getAgentConnection().destroy();
        console.log('Chamada finalizada:', contactId);
      }
    } catch (error) {
      console.error('Erro ao finalizar chamada:', error);
      throw error;
    }
  }

  /**
   * Obter status do agente
   */
  getAgentStatus(): Promise<ConnectAgent> {
    return new Promise((resolve, reject) => {
      if (!this.ccpInitialized) {
        reject(new Error('CCP não inicializado'));
        return;
      }

      const connect = (window as any).connect;
      connect.agent((agent: any) => {
        const agentState = agent.getState();
        resolve({
          agentId: agent.getAgentId(),
          name: agent.getName(),
          status: this.mapAgentStatus(agentState.name)
        });
      });
    });
  }

  /**
   * Obter sessões ativas
   */
  getActiveSessions(): CallSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Atualizar status da sessão
   */
  private updateSessionStatus(sessionId: string, status: CallSession['status']): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = status;
      if (status === 'ended') {
        session.endTime = new Date();
        session.duration = session.endTime.getTime() - session.startTime.getTime();
      }
    }
  }

  /**
   * Finalizar sessão
   */
  private endSession(sessionId: string): void {
    setTimeout(() => {
      this.activeSessions.delete(sessionId);
    }, 5000); // Mantém por 5 segundos para logs
  }

  /**
   * Extrair número de telefone do contato
   */
  private extractPhoneNumber(contact: any): string {
    try {
      const connections = contact.getConnections();
      for (const connection of connections) {
        if (connection.getType() === 'inbound') {
          return connection.getEndpoint().phoneNumber || 'Desconhecido';
        }
      }
      return 'Desconhecido';
    } catch {
      return 'Desconhecido';
    }
  }

  /**
   * Mapear status do agente para nosso formato
   */
  private mapAgentStatus(connectStatus: string): ConnectAgent['status'] {
    switch (connectStatus.toLowerCase()) {
      case 'available':
        return 'available';
      case 'oncall':
      case 'busy':
        return 'busy';
      default:
        return 'offline';
    }
  }

  /**
   * Callback para mudança de status do agente
   */
  private onAgentStateChange(stateChange: any): void {
    console.log('Status do agente alterado:', stateChange);
    // Aqui você pode implementar callbacks personalizados
    // Por exemplo, atualizar a UI ou notificar outros componentes
  }

  /**
   * Destruir a instância e limpar recursos
   */
  destroy(): void {
    this.activeSessions.clear();
    this.ccpInitialized = false;
  }
}