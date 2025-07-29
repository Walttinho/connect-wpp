// src/hooks/useAmazonConnect.ts
import { useState, useEffect, useCallback } from 'react';
import { AmazonConnectService, CallSession, ConnectAgent } from '../services/amazonConnectService';

interface UseAmazonConnectReturn {
  isInitialized: boolean;
  isConnecting: boolean;
  activeSessions: CallSession[];
  agentStatus: ConnectAgent | null;
  error: string | null;
  makeCall: (phoneNumber: string, contactName?: string, leadId?: string) => Promise<string | null>;
  endCall: (contactId: string) => Promise<void>;
  initializeConnect: (container: HTMLDivElement) => Promise<void>;
  clearError: () => void;
}

export const useAmazonConnect = (): UseAmazonConnectReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeSessions, setActiveSessions] = useState<CallSession[]>([]);
  const [agentStatus, setAgentStatus] = useState<ConnectAgent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connectService = AmazonConnectService.getInstance();

  // Atualiza as sessões ativas periodicamente
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(() => {
      const sessions = connectService.getActiveSessions();
      setActiveSessions(sessions);
    }, 1000);

    return () => clearInterval(interval);
  }, [isInitialized]);

  // Atualiza o status do agente periodicamente
  useEffect(() => {
    if (!isInitialized) return;

    const updateAgentStatus = async () => {
      try {
        const status = await connectService.getAgentStatus();
        setAgentStatus(status);
        setError(null);
      } catch (err) {
        console.log('Aguardando login do agente...');
      }
    };

    const interval = setInterval(updateAgentStatus, 5000);
    updateAgentStatus(); // Chamada inicial

    return () => clearInterval(interval);
  }, [isInitialized]);

  const initializeConnect = useCallback(async (container: HTMLDivElement) => {
    try {
      setError(null);
      await connectService.initializeCCP(container);
      setIsInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro ao inicializar Amazon Connect: ${errorMessage}`);
      console.error('Erro ao inicializar Connect:', err);
    }
  }, []);

  const makeCall = useCallback(async (
    phoneNumber: string, 
    contactName?: string, 
    leadId?: string
  ): Promise<string | null> => {
    if (!isInitialized) {
      setError('Amazon Connect não está inicializado');
      return null;
    }

    if (!phoneNumber) {
      setError('Número de telefone é obrigatório');
      return null;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const attributes = {
        ...(contactName && { 'ContactName': contactName }),
        ...(leadId && { 'LeadId': leadId }),
        'Source': 'WhatsApp-Salesforce-Integration',
        'InitiatedBy': 'Agent'
      };

      const contactId = await connectService.makeOutboundCall(phoneNumber, attributes);
      
      console.log('Chamada iniciada com sucesso:', {
        contactId,
        phoneNumber,
        contactName,
        leadId
      });

      return contactId;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer chamada';
      setError(errorMessage);
      console.error('Erro ao fazer chamada:', err);
      return null;
      
    } finally {
      setIsConnecting(false);
    }
  }, [isInitialized]);

  const endCall = useCallback(async (contactId: string) => {
    try {
      setError(null);
      await connectService.endCall(contactId);
      
      console.log('Chamada finalizada:', contactId);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao finalizar chamada';
      setError(errorMessage);
      console.error('Erro ao finalizar chamada:', err);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isInitialized,
    isConnecting,
    activeSessions,
    agentStatus,
    error,
    makeCall,
    endCall,
    initializeConnect,
    clearError
  };
};