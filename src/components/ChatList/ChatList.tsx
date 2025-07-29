import React, { useState } from 'react';
import { Search, X, Phone, Users, ChevronDown, ChevronRight, MessageCircle } from 'lucide-react';
import { Chat } from '../../types';
import { ChatListItem } from './ChatListItem';
import { ChatService } from '@/services/chatService';

interface ChatListProps {
  connectChats: Chat[];
  selectedChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
  onSalesforceOpen: (leadId: string) => void;
  showSidebar: boolean;
  onSidebarClose: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  connectChats,
  selectedChat,
  onChatSelect,
  onSalesforceOpen,
  showSidebar,
  onSidebarClose,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showConnectSection, setShowConnectSection] = useState<boolean>(true);

  const filteredConnectChats = ChatService.filterChats(connectChats, searchTerm);

  const handleChatSelect = (chat: Chat) => {
    onChatSelect(chat);
    onSidebarClose();
  };

  const getTotalUnread = (chatList?: Chat[]) => {
    if (!Array.isArray(chatList)) return 0;
    return chatList.reduce((total, chat) => total + chat.unread, 0);
  };

  const connectUnread = getTotalUnread(filteredConnectChats);

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

      {/* Estatísticas Rápidas */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-3 h-3" />
            <span>Connect: {filteredConnectChats.length}</span>
          </div>
          
        </div>
      </div>

      {/* Lista de Conversas */}
      <div className="flex-1 overflow-y-auto">
        {connectChats?.length > 0 ? (
          <>
            <button
              onClick={() => setShowConnectSection(!showConnectSection)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                {showConnectSection ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <Phone className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-gray-700">Amazon Connect</span>
                <span className="text-xs text-gray-500">
                  ({filteredConnectChats.length})
                </span>
              </div>
              {connectUnread > 0 && (
                <div className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {connectUnread}
                </div>
              )}
            </button>

            {showConnectSection && (
              <div className="bg-blue-50/30">
                {filteredConnectChats.length > 0 ? (
                  filteredConnectChats.map((chat) => (
                    <ChatListItem
                      key={chat.id}
                      chat={chat}
                      isSelected={selectedChat?.id === chat.id}
                      onSelect={() => handleChatSelect(chat)}
                      onSalesforceOpen={() => onSalesforceOpen(chat.contact.leadId)}
                      showChannelIndicator={true}
                      isConnectChat={true}
                    />
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500 text-sm">
                    {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa do Connect'}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Nenhuma conversa
              </h3>
              <p className="text-gray-500 text-sm">
                As conversas do Amazon Connect aparecerão aqui
              </p>
            </div>
          </div>
        )}

        {/* Resultado de busca vazio */}
        {connectChats?.length > 0 && searchTerm && filteredConnectChats.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Nenhum resultado
              </h3>
              <p className="text-gray-500 text-sm">
                Não encontramos conversas com "{searchTerm}"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer com status de conexão */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Sistema Online</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>Total não lidas:</span>
            <span className="font-semibold text-blue-600">{connectUnread}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
