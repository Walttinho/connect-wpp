import { Chat, Message, MessageStatus } from "../types";

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

  static filterChats(chats: Chat[], searchTerm: string): Chat[] {
    if (!searchTerm.trim()) return chats;

    return chats.filter(
      (chat) =>
        chat.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.contact.phone.includes(searchTerm) ||
        chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}
