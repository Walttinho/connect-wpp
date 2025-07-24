import { Chat } from "@/types";
import { getStatusColor } from "@/utils/statusUtils";
import { ArrowLeft, Phone, User } from "lucide-react";

interface ChatHeaderProps {
  chat: Chat;
  onChatClose: () => void;
  onSalesforceOpen: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  onChatClose,
  onSalesforceOpen,
}) => {
  return (
    <div className="bg-white border-b border-blue-100 p-3 md:p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onChatClose}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-gray-500 rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-sm">
            {chat.contact.avatar}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-sm md:text-base">
              {chat.contact.name}
            </h2>
            <p className="text-xs md:text-sm text-gray-500">
              {chat.contact.leadId}
            </p>
          </div>
          <span
            className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(
              chat.contact.status
            )}`}
          >
            {chat.contact.status}
          </span>
        </div>
        <div className="flex items-center space-x-1 md:space-x-2">
          <button
            onClick={onSalesforceOpen}
            className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs md:text-sm"
          >
            <User className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Ver Lead</span>
          </button>
          <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
            <Phone className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};