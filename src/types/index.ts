export interface Contact {
  name: string;
  phone: string;
  avatar: string;
  leadId: string;
  status: "hot" | "warm" | "cold";
}

export interface Message {
  chatId: string;
  text: string;
  timestamp: Date;
  sent: boolean;
  status: "sent" | "delivered" | "read";
}

export interface Chat {
  id: string;
  contact: Contact;
  lastMessage: string;
  timestamp: Date;
  unread: number;
  status: "sent" | "delivered" | "read";
  messages: Message[];
  connectContactId?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
}

export interface MediaOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  action: string;
}

export type ViewType = "chat" | "salesforce";
export type MessageStatus = "sent" | "delivered" | "read";
export type ContactStatus = "hot" | "warm" | "cold";