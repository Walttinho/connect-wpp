import { useState, useCallback } from 'react';
import { Chat, Message, MessageTemplate } from '../types';
import { ChatService } from '../services/mockData';
import { applyTemplatePersonalization } from '../utils/templateUtils';

export const useChat = (initialChats: Chat[]) => {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || !selectedChat) return;

    setIsLoading(true);

    try {
      const newMessage = await ChatService.sendMessage(selectedChat.id, messageText);

      // Atualizar o chat com a nova mensagem
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === selectedChat.id
            ? {
                ...chat,
                messages: [...chat.messages, newMessage],
                lastMessage: messageText,
                timestamp: new Date(),
              }
            : chat
        )
      );

      // Simular mudanças de status da mensagem
      setTimeout(() => {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === selectedChat.id
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) =>
                    msg.chatId === newMessage.chatId ? { ...msg, status: "delivered" } : msg
                  ),
                }
              : chat
          )
        );
      }, 1000);

      setTimeout(() => {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === selectedChat.id
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) =>
                    msg.chatId === newMessage.chatId ? { ...msg, status: "read" } : msg
                  ),
                }
              : chat
          )
        );
      }, 3000);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedChat]);

  const applyTemplate = useCallback((template: MessageTemplate): string => {
    if (!selectedChat) return template.content;
    
    return applyTemplatePersonalization(template, selectedChat.contact.name);
  }, [selectedChat]);

  const filterChats = useCallback((searchTerm: string): Chat[] => {
    return ChatService.filterChats(chats, searchTerm);
  }, [chats]);

  return {
    chats,
    selectedChat,
    setSelectedChat,
    isLoading,
    sendMessage,
    applyTemplate,
    filterChats,
  };
};
