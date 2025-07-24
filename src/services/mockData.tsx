// services/mockData.ts
import { Chat, MessageTemplate, MediaOption, Message } from "../types";
import { Camera, File, Video, Mic, FileText } from "lucide-react";

export const initialChats: Chat[] = [
  {
    id: "1",
    contact: {
      name: "Maria Silva",
      phone: "+55 11 99999-0001",
      avatar: "MS",
      leadId: "SF001",
      status: "hot",
    },
    lastMessage: "Gostaria de saber mais sobre o produto",
    timestamp: new Date(Date.now() - 300000),
    unread: 2,
    status: "delivered",
    messages: [
      {
        chatId: "m1",
        text: "Olá, vi o anúncio no Facebook",
        timestamp: new Date(Date.now() - 1800000),
        sent: false,
        status: "read",
      },
      {
        chatId: "m2",
        text: "Olá Maria! Obrigado pelo interesse. Em que posso ajudá-la?",
        timestamp: new Date(Date.now() - 1500000),
        sent: true,
        status: "read",
      },
      {
        chatId: "m3",
        text: "Gostaria de saber mais sobre o produto",
        timestamp: new Date(Date.now() - 300000),
        sent: false,
        status: "delivered",
      },
    ],
  },
  {
    id: "2",
    contact: {
      name: "João Santos",
      phone: "+55 11 99999-0002",
      avatar: "JS",
      leadId: "SF002",
      status: "warm",
    },
    lastMessage: "Perfeito! Quando podemos agendar?",
    timestamp: new Date(Date.now() - 600000),
    unread: 0,
    status: "read",
    messages: [
      {
        chatId: "m4",
        text: "Bom dia! Tenho interesse no serviço",
        timestamp: new Date(Date.now() - 3600000),
        sent: false,
        status: "read",
      },
      {
        chatId: "m5",
        text: "Bom dia João! Vamos agendar uma demonstração?",
        timestamp: new Date(Date.now() - 3300000),
        sent: true,
        status: "read",
      },
      {
        chatId: "m6",
        text: "Perfeito! Quando podemos agendar?",
        timestamp: new Date(Date.now() - 600000),
        sent: false,
        status: "read",
      },
    ],
  },
  {
    id: "3",
    contact: {
      name: "Ana Costa",
      phone: "+55 11 99999-0003",
      avatar: "AC",
      leadId: "SF003",
      status: "cold",
    },
    lastMessage: "Obrigada pelas informações!",
    timestamp: new Date(Date.now() - 3600000),
    unread: 0,
    status: "read",
    messages: [
      {
        chatId: "m7",
        text: "Olá, preciso de mais informações",
        timestamp: new Date(Date.now() - 5400000),
        sent: false,
        status: "read",
      },
      {
        chatId: "m8",
        text: "Claro! Segue nossa apresentação em anexo",
        timestamp: new Date(Date.now() - 4800000),
        sent: true,
        status: "read",
      },
      {
        chatId: "m9",
        text: "Obrigada pelas informações!",
        timestamp: new Date(Date.now() - 3600000),
        sent: false,
        status: "read",
      },
    ],
  },
];

export const messageTemplates: MessageTemplate[] = [
  {
    id: "t1",
    name: "Boas-vindas",
    content:
      "Olá {{name}}! Obrigado pelo seu interesse. Como posso ajudá-lo hoje?",
    category: "inicial",
  },
  {
    id: "t2",
    name: "Proposta Comercial",
    content:
      "Olá {{name}}, preparei uma proposta especial para você. Quando podemos conversar?",
    category: "vendas",
  },
  {
    id: "t3",
    name: "Follow-up",
    content:
      "Oi {{name}}, como está? Gostaria de saber se ainda tem interesse em nosso produto.",
    category: "follow-up",
  },
  {
    id: "t4",
    name: "Agendamento",
    content:
      "Perfeito {{name}}! Vou agendar nossa reunião. Qual horário é melhor para você?",
    category: "agendamento",
  },
];

export const mediaOptions: MediaOption[] = [
  {
    id: "camera",
    name: "Câmera",
    icon: <Camera className="w-5 h-5" />,
    action: "camera",
  },
  {
    id: "file",
    name: "Arquivo",
    icon: <File className="w-5 h-5" />,
    action: "file",
  },
  {
    id: "video",
    name: "Vídeo",
    icon: <Video className="w-5 h-5" />,
    action: "video",
  },
  {
    id: "audio",
    name: "Áudio",
    icon: <Mic className="w-5 h-5" />,
    action: "audio",
  },
  {
    id: "template",
    name: "Templates",
    icon: <FileText className="w-5 h-5" />,
    action: "template",
  },
];

export const ChatService = {
  sendMessage(chatId: string, messageText: string): Promise<Message> {
    const message: Message = {
      chatId,
      text: messageText,
      status: "sent",
      timestamp: new Date(),
      sent: true
    };

    return Promise.resolve(message);
  },

  filterChats(chats: Chat[], searchTerm: string): Chat[] {
    return chats.filter((chat) =>
      chat.contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },
};

export const SalesforceService = {
  openContact: async (leadId: string) => {
    console.log("Abrindo contato no Salesforce:", leadId);
    // lógica simulada ou real
  },
};

