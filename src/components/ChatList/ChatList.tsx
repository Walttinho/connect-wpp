import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Chat } from '../../types';
import { ChatService } from '../../services/mockData';
import { ChatListItem } from './ChatListItem';

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
  onSalesforceOpen: (leadId: string) => void;
  showSidebar: boolean;
  onSidebarClose: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChat,
  onChatSelect,
  onSalesforceOpen,
  showSidebar,
  onSidebarClose,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredChats = ChatService.filterChats(chats, searchTerm);

  const handleChatSelect = (chat: Chat) => {
    onChatSelect(chat);
    onSidebarClose();
  };

  return (
    <div
      className={`
        ${showSidebar ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 transition-transform duration-300 ease-in-out
        fixed md:relative z-50 md:z-0
        w-80 md:w-80 lg:w-96 bg-white border-r border-blue-100 flex flex-col
        h-full
      `}
    >
      {/* Header da Sidebar Mobile */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-blue-100">
        <h2 className="font-semibold text-gray-900">Conversas</h2>
        <button
          onClick={onSidebarClose}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-blue-100">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            isSelected={selectedChat?.id === chat.id}
            onSelect={() => handleChatSelect(chat)}
            onSalesforceOpen={() => onSalesforceOpen(chat.contact.leadId)}
          />
        ))}
      </div>
    </div>
  );
};