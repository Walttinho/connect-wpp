// src/components/ChatArea/ConnectChatQueue.tsx
import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone, UserCheck, UserX, Clock, Users } from 'lucide-react';
import { useConnectChat } from '../../hooks/useConnectChat';
import { useAmazonConnect } from '../../hooks/useAmazonConnect';

interface IncomingChatRequest {
  id: string;
  customerName?: string;
  customerPhone?: string;
  estimatedWaitTime?: number;
  queueName: string;
  attributes?: Record<string, string>;
  timestamp: Date;
}

interface ConnectChatQueueProps {
  onChatAccepted: (chatId: string) => void;
  onChatRejected: (chatId: string) => void;
}

export const ConnectChatQueue: React.FC<ConnectChatQueueProps> = ({
  onChatAccepted,
  onChatRejected
}) => {
  const [incomingRequests, setIncomingRequests] = useState<IncomingChatRequest[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  
  const { 
    isConnected: chatConnected, 
    isConnecting: chatConnecting,
    startChat,
    error: chatError 
  } = useConnectChat();
  
  const { 
    agentStatus, 
    isInitialized: connectInitialized 
  } = useAmazonConnect();

  // Simula chegada de novas solicitações de chat
  useEffect(() => {
    if (!connectInitialized || agentStatus?.status !== 'available') {
      return;
    }

    // Mock de chegada de chats - em produção isso viria do Amazon Connect
    const mockNewChat = () => {
      const mockRequest: IncomingChatRequest = {
        id: `chat_${Date.now()}`,
        customerName: `Cliente ${Math.floor(Math.random() * 1000)}`,
        customerPhone: `+55 11 9999-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        estimatedWaitTime: Math.floor(Math.random() * 5) + 1,
        queueName: 'Atendimento WhatsApp',
        attributes: {
          'Source': 'WhatsApp',
          'LeadId': `SF${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          'ContactName': `Cliente ${Math.floor(Math.random() * 1000)}`
        },
        timestamp: new Date()
      };

      setIncomingRequests(prev => [...prev, mockRequest]);
      setIsVisible(true);
    };

    // Simula chegada de chat a cada 30-60 segundos quando agente está disponível
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% de chance
        mockNewChat();
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [connectInitialized, agentStatus?.status]);

  // Remove solicitações antigas automaticamente (timeout)
  useEffect(() => {
    const timeout = setInterval(() => {
      setIncomingRequests(prev => {
        const now = new Date().getTime();
        const filtered = prev.filter(request => {
          const age = now - request.timestamp.getTime();
          return age < 120000; // Remove após 2 minutos
        });
        
        if (filtered.length === 0) {
          setIsVisible(false);
        }
        
        return filtered;
      });
    }, 30000);

    return () => clearInterval(timeout);
  }, []);

  const handleAcceptChat = async (request: IncomingChatRequest) => {
    try {
      // Remove da fila
      setIncomingRequests(prev => prev.filter(r => r.id !== request.id));
      
      // Inicia sessão de chat do Amazon Connect
      await startChat({
        'CustomerName': request.customerName || 'Cliente',
        'CustomerPhone': request.customerPhone || '',
        'LeadId': request.attributes?.LeadId || '',
        'Source': 'WhatsApp-Amazon-Connect',
        'QueueName': request.queueName
      });

      onChatAccepted(request.id);
      
      // Esconde a fila se não há mais requests
      if (incomingRequests.length === 1) {
        setIsVisible(false);
      }

    } catch (error) {
      console.error('Erro ao aceitar chat:', error);
    }
  };

  const handleRejectChat = (request: IncomingChatRequest) => {
    setIncomingRequests(prev => prev.filter(r => r.id !== request.id));
    onChatRejected(request.id);
    
    if (incomingRequests.length === 1) {
      setIsVisible(false);
    }
  };

  const formatWaitTime = (minutes: number) => {
    return minutes === 1 ? '1 minuto' : `${minutes} minutos`;
  };

  if (!isVisible || incomingRequests.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-16 right-4 z-50 w-80 max-w-sm">
      <div className="bg-white border border-blue-200 rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-blue-500 text-white px-4 py-3 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold text-sm">
                Novos Chats ({incomingRequests.length})
              </span>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-blue-200 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Status do Agente */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${
              agentStatus?.status === 'available' ? 'bg-green-500' : 
              agentStatus?.status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-gray-600">
              Status: {agentStatus?.status === 'available' ? 'Disponível' : 
                      agentStatus?.status === 'busy' ? 'Ocupado' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Lista de Solicitações */}
        <div className="max-h-80 overflow-y-auto">
          {incomingRequests.map((request, index) => (
            <div key={request.id} className={`p-4 ${index > 0 ? 'border-t border-gray-100' : ''}`}>
              <div className="space-y-3">
                {/* Info do Cliente */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-gray-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {request.customerName?.charAt(0) || 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {request.customerName || 'Cliente'}
                      </h4>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatWaitTime(request.estimatedWaitTime || 1)}</span>
                      </div>
                    </div>
                    
                    {request.customerPhone && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{request.customerPhone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1 mt-1">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{request.queueName}</span>
                    </div>

                    {/* Atributos Adicionais */}
                    {request.attributes?.LeadId && (
                      <div className="mt-1">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Lead: {request.attributes.LeadId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAcceptChat(request)}
                    disabled={chatConnecting || chatConnected}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{chatConnecting ? 'Conectando...' : 'Aceitar'}</span>
                  </button>
                  
                  <button
                    onClick={() => handleRejectChat(request)}
                    disabled={chatConnecting}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <UserX className="w-4 h-4" />
                    <span>Rejeitar</span>
                  </button>
                </div>

                {/* Status de Erro */}
                {chatError && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    {chatError}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer com Informações */}
        <div className="px-4 py-2 bg-gray-50 rounded-b-lg border-t border-gray-200">
          <div className="text-xs text-gray-600 text-center">
            {chatConnected ? (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Chat Ativo via Amazon Connect</span>
              </div>
            ) : (
              <span>Aguardando ação do agente</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};