import { Chat } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import { getStatusColor, getStatusIcon } from "@/utils/statusUtils";
import { User } from "lucide-react";

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  onSelect: () => void;
  onSalesforceOpen: () => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  isSelected,
  onSelect,
  onSalesforceOpen,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-3 md:p-4 border-b border-blue-50 cursor-pointer transition-colors hover:bg-blue-50 ${
        isSelected ? "bg-blue-100 border-l-4 border-l-blue-500" : ""
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-gray-500 rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-sm">
          {chat.contact.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 truncate text-sm">
                {chat.contact.name}
              </h3>
              <span
                className={`px-1 md:px-2 py-1 text-xs rounded-full border ${getStatusColor(
                  chat.contact.status
                )}`}
              >
                {chat.contact.status}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">
                {formatDate(chat.timestamp)}
              </span>
              {chat.unread > 0 && (
                <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {chat.unread}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-gray-600 truncate">
              {chat.lastMessage}
            </p>
            <div className="flex items-center space-x-1">
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
          <p className="text-xs text-gray-500 mt-1">
            • ID: {chat.contact.leadId}
          </p>
        </div>
      </div>
    </div>
  );
};