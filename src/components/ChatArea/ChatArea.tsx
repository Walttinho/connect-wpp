//src/components/ChatArea/ChatArea.tsx
import React, { useRef, useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Chat, MessageTemplate } from "../../types";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TemplatePanel } from "./TemplatePanel";
import { ChatHeader } from "./ChatHeader";
import { AmazonConnectService, ConnectAgent } from "@/services/amazonConnectService";

interface ChatAreaProps {
  selectedChat: Chat | null;
  onChatClose: () => void;
  onSalesforceOpen: (leadId: string) => void;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  showTemplates: boolean;
  onTemplateToggle: () => void;
  onTemplateApply: (template: MessageTemplate, chat?: Chat) => string;
  messageTemplates: MessageTemplate[];
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  selectedChat,
  onChatClose,
  onSalesforceOpen,
  onSendMessage,
  isLoading,
  showTemplates,
  onTemplateToggle,
  onTemplateApply,
  messageTemplates,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [templateMessage, setTemplateMessage] = useState<string>("");
  const ccpContainerRef = useRef<HTMLDivElement>(null);
  const connectService = AmazonConnectService.getInstance();
  const [isInitialized, setIsInitialized] = useState(false);
  const [agentStatus, setAgentStatus] = useState<ConnectAgent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  initializeConnect();
}, []);


  useEffect(() => {
    setTemplateMessage("");
  }, [selectedChat?.id]);

  const handleTemplateApply = (template: MessageTemplate): string => {
    if (!selectedChat) {
      console.warn("Nenhum chat selecionado");
      return template.content;
    }

    const personalized = onTemplateApply(template, selectedChat);

    setTemplateMessage(personalized);
    return personalized;
  };

  const initializeConnect = async () => {
    console.log("Inicializando Amazon Connect...");
    
    try {
      if (ccpContainerRef.current && !isInitialized) {
        setError(null);
        await connectService.initializeCCP(ccpContainerRef.current);
        setIsInitialized(true);

        // Obter status inicial do agente
        setTimeout(async () => {
          try {
            const status = await connectService.getAgentStatus();
            setAgentStatus(status);
          } catch (err) {
            console.log("Aguardando login do agente...");
          }
        }, 3000);
      }
      window.connect.agent((agent) => {
  console.log("Agente conectado:", agent.getName());
});
    } catch (error) {
      console.error("Erro ao inicializar Connect:", error);
      setError(
        "Erro ao conectar com Amazon Connect. Verifique a configuração."
      );
    }
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-blue-25 to-gray-25">
        <div className="text-center p-4">
          <MessageSquare className="w-12 h-12 md:w-16 md:h-16 text-blue-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Selecione uma conversa
          </h3>
          <p className="text-gray-600 text-sm md:text-base">
            Escolha uma conversa para começar a responder mensagens
          </p>
        </div>
      </div>
    );
  }

  //TODO adicionar chat do connect no topo da da fila com as action de aceitar ou rejeitar

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-blue-25 to-gray-25">
      <ChatHeader
        chat={selectedChat}
        onChatClose={onChatClose}
        onSalesforceOpen={() => onSalesforceOpen(selectedChat.contact.leadId)}
      />

      <MessageList
        //TODO: Implementar historico de chats atendidos pelo amazon connect
        messages={selectedChat.messages}
        messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
      />

      {showTemplates && (
        <TemplatePanel
          templates={messageTemplates}
          onTemplateApply={handleTemplateApply}
          onClose={onTemplateToggle}
        />
      )}

      <MessageInput
        onSendMessage={onSendMessage}
        onTemplateToggle={onTemplateToggle}
        isLoading={isLoading}
        defaultMessage={templateMessage}
      />
      <div ref={ccpContainerRef} style={{ display: "none" }} />
    </div>
  );
};
