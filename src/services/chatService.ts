import { Chat, Message, MessageStatus } from "../types";

//TODO: Implementar Amazon Connect CCP service, para chat e voz

export class ChatService {
  static async sendMessage(
    chatId: string,
    messageText: string
  ): Promise<Message> {
    const newMessage: Message = {
      chatId: `m${Date.now()}`,
      text: messageText,
      timestamp: new Date(),
      sent: true,
      status: "sent",
    };

    return new Promise((resolve) => {
      setTimeout(() => resolve(newMessage), 100);
    });
  }

  static async updateMessageStatus(
    messageId: string,
    status: MessageStatus
  ): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 1000);
    });
  }

  static filterChats(chats: Chat[] = [], searchTerm: string): Chat[] {
  if (!searchTerm?.trim()) return chats;

  const lowerSearch = searchTerm.toLowerCase();

  return chats.filter((chat) => {
    const name = chat.contact?.name?.toLowerCase() || "";
    const phone = chat.contact?.phone || "";
    const lastMessage = chat.lastMessage?.toLowerCase() || "";

    return (
      name.includes(lowerSearch) ||
      phone.includes(lowerSearch) ||
      lastMessage.includes(lowerSearch)
    );
  });
}
}
