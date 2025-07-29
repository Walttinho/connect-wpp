// src/hooks/useConnectChat.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { AmazonConnectChatService, ChatMessage, ChatSession } from '../services/amazonConnectChatService';

interface UseConnectChatReturn {
  isConnected: boolean;
  isConnecting: boolean;
  chatSession: ChatSession | null;
  messages: ChatMessage[];
  error: string | null;
  startChat: (contactAttributes?: Record<string, string>) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  sendAttachment: (file: File) => Promise<void>;
  endChat: () => Promise<void>;
  clearError: () => void;
  loadHistory: () => Promise<void>;
}

export const useConnectChat = (): UseConnectChatReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const chatService = useRef(AmazonConnectChatService.getInstance());
  const messageHandlerRef = useRef<((message: ChatMessage) => void) | null>(null);
  const eventHandlerRef = useRef<((event: any) => void) | null>(null);

  // Handler para mensagens recebidas
  const handleMessage = useCallback((message: ChatMessage) => {
    console.log('Nova mensagem recebida:', message);
    
    setMessages(prev => {
      // Evita duplicatas
      const exists = prev.some(msg => msg.id === message.id);
      if (exists) return prev;
      
      // Adiciona nova mensagem ordenada por timestamp
      const newMessages = [...prev, message];
      return newMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    });
  }, []);

  // Handler para eventos do chat
  const handleEvent = useCallback((event: any) => {
    console.log('Evento do chat recebido:', event);
    
    switch (event.Type) {
      case 'PARTICIPANT_JOINED':
        console.log('Participante entrou no chat:', event.DisplayName);
        break;
      case 'PARTICIPANT_LEFT':
        console.log('Participante saiu do chat:', event.DisplayName);
        break;
      case 'CHAT_ENDED':
        console.log('Chat finalizado');
        setIsConnected(false);
        setChatSession(null);
        break;
      case 'CONNECTION_ACK':
        console.log('Conexão confirmada');
        setIsConnected(true);
        setError(null);
        break;
      default:
        console.log('Evento não tratado:', event.Type);
    }
  }, []);

  // Configura os handlers quando o componente monta
  useEffect(() => {
    messageHandlerRef.current = handleMessage;
    eventHandlerRef.current = handleEvent;

    chatService.current.onMessage(handleMessage);
    chatService.current.onEvent(handleEvent);

    return () => {
      chatService.current.removeMessageHandler(handleMessage);
      chatService.current.removeEventHandler(handleEvent);
    };
  }, [handleMessage, handleEvent]);

  // Inicia uma nova sessão de chat
  const startChat = useCallback(async (contactAttributes?: Record<string, string>) => {
    try {
      setIsConnecting(true);
      setError(null);
      setMessages([]);

      console.log('Iniciando sessão de chat do Amazon Connect...');
      
      const session = await chatService.current.startChatSession(contactAttributes);
      setChatSession(session);
      
      console.log('Sessão de chat iniciada:', session.chatId);

      // Aguarda um tempo para a conexão se estabelecer
      setTimeout(() => {
        setIsConnecting(false);
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Erro ao iniciar chat:', err);
      setError(`Erro ao iniciar chat: ${errorMessage}`);
      setIsConnecting(false);
    }
  }, []);

  // Envia mensagem de texto
  const sendMessage = useCallback(async (content: string) => {
    if (!isConnected || !content.trim()) {
      console.warn('Chat não conectado ou mensagem vazia');
      return;
    }

    try {
      setError(null);
      await chatService.current.sendMessage(content);
      
      console.log('Mensagem enviada via Connect Chat:', content);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
      console.error('Erro ao enviar mensagem:', err);
      setError(errorMessage);
    }
  }, [isConnected]);

  // Envia anexo
  const sendAttachment = useCallback(async (file: File) => {
    if (!isConnected) {
      console.warn('Chat não conectado');
      return;
    }

    try {
      setError(null);
      await chatService.current.sendAttachment(file);
      
      console.log('Anexo enviado via Connect Chat:', file.name);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar anexo';
      console.error('Erro ao enviar anexo:', err);
      setError(errorMessage);
    }
  }, [isConnected]);

  // Carrega histórico de mensagens
  const loadHistory = useCallback(async () => {
    if (!chatSession) {
      console.warn('Sessão de chat não ativa');
      return;
    }

    try {
      setError(null);
      const history = await chatService.current.getChatHistory(100);
      
      setMessages(history.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
      console.log('Histórico carregado:', history.length, 'mensagens');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar histórico';
      console.error('Erro ao carregar histórico:', err);
      setError(errorMessage);
    }
  }, [chatSession]);

  // Finaliza o chat
  const endChat = useCallback(async () => {
    try {
      setError(null);
      await chatService.current.endChatSession();
      
      setIsConnected(false);
      setChatSession(null);
      setMessages([]);
      
      console.log('Chat finalizado');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao finalizar chat';
      console.error('Erro ao finalizar chat:', err);
      setError(errorMessage);
    }
  }, []);

  // Limpa erros
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (isConnected) {
        chatService.current.endChatSession().catch(console.error);
      }
    };
  }, [isConnected]);

  // Monitora o status da conexão
  useEffect(() => {
    const checkConnection = () => {
      const sessionActive = chatService.current.isSessionActive();
      if (isConnected !== sessionActive) {
        setIsConnected(sessionActive);
      }
    };

    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, [isConnected]);

  return {
    isConnected,
    isConnecting,
    chatSession,
    messages,
    error,
    startChat,
    sendMessage,
    sendAttachment,
    endChat,
    clearError,
    loadHistory
  };
};