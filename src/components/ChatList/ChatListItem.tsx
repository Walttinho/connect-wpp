import { useEffect, useState } from "react";
import { Chat } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import { getStatusColor, getStatusIcon } from "@/utils/statusUtils";
import { User, Phone, Clock } from "lucide-react";

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  onSelect: () => void;
  onSalesforceOpen: () => void;
  showChannelIndicator?: boolean;
  isConnectChat?: boolean;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  isSelected,
  onSelect,
  onSalesforceOpen,
}) => {
  const [formattedTime, setFormattedTime] = useState("");

  useEffect(() => {    
    const formatted = formatDate(chat.timestamp);
    setFormattedTime(formatted);
  }, [chat.timestamp]);

  return (
    <div
      onClick={onSelect}
      className={`p-3 md:p-4 border-b border-blue-50 cursor-pointer transition-colors hover:bg-blue-50 ${
        isSelected 
          ? "bg-blue-100 border-l-4 border-l-blue-500"
          : ""
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar com indicador de canal */}
        <div className="relative">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-sm">
            {chat.contact.avatar}
          </div>
          
          {/* Indicador do canal */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            <Phone className="w-3 h-3 text-blue-500" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 truncate text-sm">
                {chat.contact.name}
              </h3>
              
              {/* Status do lead */}
              <span
                className={`px-1 md:px-2 py-1 text-xs rounded-full border ${getStatusColor(
                  chat.contact.status
                )}`}
              >
                {chat.contact.status}
              </span>

              {/* Indicador de chat ativo do Connect */}
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-600 font-medium">
                  Connect
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">
                {formattedTime || "--:--"}
              </span>
              {chat.unread > 0 && (
                <span className="text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center bg-blue-500">
                  {chat.unread}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              {/* Ícone do tipo de mensagem */}
              <div className="flex-shrink-0">
                <Phone className="w-3 h-3 text-blue-400" />
              </div>
              
              <p className="text-sm text-gray-600 truncate flex-1">
                {chat.lastMessage}
              </p>
            </div>

            <div className="flex items-center space-x-1 ml-2">
              {getStatusIcon(chat.status)}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSalesforceOpen();
                }}
                className="text-blue-500 hover:text-blue-700 p-1 rounded"
                title="Ver no Salesforce"
              >
                <User className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">
              • ID: {chat.contact.leadId}
            </p>

            {/* Informações específicas do Connect */}
            {chat.connectContactId && (
              <div className="flex items-center space-x-1 text-xs text-blue-600">
                <Clock className="w-3 h-3" />
                <span>Connect: {chat.connectContactId.substring(0, 8)}...</span>
              </div>
            )}
          </div>

          {/* Indicador de canal por extenso */}
          <div className="mt-1">
            <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              Amazon Connect
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
