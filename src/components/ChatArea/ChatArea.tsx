import React, { useRef, useEffect, useState } from "react";
import {
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Loader
} from "lucide-react";
import { Chat, MessageTemplate } from "../../types";
import { TemplatePanel } from "./TemplatePanel";
import { ConnectChatQueue } from "./ConnectChatQueue";
import { AmazonConnectService, ConnectAgent } from "@/services/amazonConnectService";
import { useConnectChat } from "../../hooks/useConnectChat";
import { useAmazonConnect } from "../../hooks/useAmazonConnect";
import { MessageInput } from "./MessageInput";

interface ChatAreaProps {
  selectedChat?: Chat | null;
  onSendMessage: (messageText: string) => Promise<void>;
  isLoading: boolean;
  showTemplates: boolean;
  onTemplateToggle: () => void;
  onTemplateApply: (template: MessageTemplate) => string;
  messageTemplates: MessageTemplate[];
  onChatClose: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  isLoading,
  showTemplates,
  onTemplateToggle,
  onTemplateApply,
  messageTemplates
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [templateMessage, setTemplateMessage] = useState<string>("");
  const ccpContainerRef = useRef<HTMLDivElement>(null);
  const connectService = AmazonConnectService.getInstance();
  const [isInitialized, setIsInitialized] = useState(false);
  const [agentStatus, setAgentStatus] = useState<ConnectAgent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeConnectChat, setActiveConnectChat] = useState<string | null>(null);

  const {
    isConnected: chatConnected,
    isConnecting: chatConnecting,
    messages: connectMessages,
    chatSession,
    sendMessage: sendConnectMessage,
    endChat: endConnectChat,
    loadHistory: loadConnectHistory,
    error: connectChatError,
    clearError: clearConnectError
  } = useConnectChat();

  const {
    agentStatus: connectAgentStatus,
    isInitialized: connectInitialized,
    error: connectError,
    clearError: clearAmazonConnectError
  } = useAmazonConnect();

  useEffect(() => {
    initializeConnect();
  }, []);

  useEffect(() => {
    if (connectAgentStatus) {
      setAgentStatus(connectAgentStatus);
    }
  }, [connectAgentStatus]);

  useEffect(() => {
    if (chatConnected && chatSession) {
      loadConnectHistory();
    }
  }, [chatConnected, chatSession, loadConnectHistory]);

  const handleTemplateApply = (template: MessageTemplate): string => {
    const personalized = onTemplateApply(template);
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

        setTimeout(async () => {
          try {
            const status = await connectService.getAgentStatus();
            setAgentStatus(status);
          } catch {
            console.log("Aguardando login do agente...");
          }
        }, 3000);
      }

      window.connect.agent((agent) => {
        console.log("Agente conectado:", agent.getName());
      });
    } catch (error) {
      console.error("Erro ao inicializar Connect:", error);
      setError("Erro ao conectar com Amazon Connect. Verifique a configuração.");
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (activeConnectChat && chatConnected) {
      try {
        await sendConnectMessage(messageText);
      } catch (error) {
        console.error("Erro ao enviar via Connect Chat:", error);
      }
    }
  };

  const handleChatAccepted = (chatId: string) => {
    console.log("Chat do Amazon Connect aceito:", chatId);
    setActiveConnectChat(chatId);
    clearConnectError();
  };

  const handleEndConnectChat = async () => {
    if (activeConnectChat) {
      try {
        await endConnectChat();
        setActiveConnectChat(null);
      } catch (error) {
        console.error("Erro ao finalizar chat do Connect:", error);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-blue-25 to-gray-25">
      {!activeConnectChat ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-4">
            <MessageSquare className="w-12 h-12 text-blue-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aguardando conversa do Amazon Connect
            </h3>
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-center space-x-2">
                {isInitialized ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                )}
                <span className="text-sm text-gray-600">
                  Amazon Connect: {isInitialized ? "Conectado" : "Conectando..."}
                </span>
              </div>

              {agentStatus && (
                <div className="flex items-center justify-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    agentStatus.status === "available"
                      ? "bg-green-500"
                      : agentStatus.status === "busy"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`} />
                  <span className="text-sm text-gray-600">
                    Agente: {agentStatus.name} (
                    {agentStatus.status === "available"
                      ? "Disponível"
                      : agentStatus.status === "busy"
                      ? "Ocupado"
                      : "Offline"}
                    )
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white border-b border-blue-100 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  AC
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 text-sm">
                    Chat Amazon Connect
                  </h2>
                  <p className="text-xs text-gray-500">
                    {chatSession?.chatId || "Conectando..."}
                  </p>
                </div>
                {chatConnected && (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-200">
                    Conectado
                  </span>
                )}
              </div>
              <button
                onClick={handleEndConnectChat}
                className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600"
              >
                Finalizar Chat
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {connectMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.participantRole === "AGENT" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-lg px-4 py-2 rounded-lg ${
                    message.participantRole === "AGENT"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-900 border border-blue-100"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex justify-end text-xs mt-1 text-gray-400">
                    {message.timestamp.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {showTemplates && (
            <TemplatePanel
              templates={messageTemplates}
              onTemplateApply={handleTemplateApply}
              onClose={onTemplateToggle}
            />
          )}

          <MessageInput
            onSendMessage={handleSendMessage}
            onTemplateToggle={onTemplateToggle}
            isLoading={isLoading || chatConnecting}
            defaultMessage={templateMessage}
          />
        </>
      )}

      {connectChatError && (
        <div className="mx-4 my-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{connectChatError}</span>
            </div>
            <button
              onClick={clearConnectError}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <ConnectChatQueue
        onChatAccepted={handleChatAccepted}
        onChatRejected={() => {}}
      />

      <div ref={ccpContainerRef} style={{ display: "none" }} />
    </div>
  );
};
