"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  Clock,
  Check,
  CheckCheck,
  Phone,
  User,
  FileText,
  MessageSquare,
  ExternalLink,
  Search,
  Settings,
  X,
  Plus,
  Camera,
  File,
  Video,
  Mic,
  Menu,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";

// Types
interface Contact {
  name: string;
  phone: string;
  avatar: string;
  leadId: string;
  status: "hot" | "warm" | "cold";
}

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sent: boolean;
  status: "sent" | "delivered" | "read";
}

interface Chat {
  id: string;
  contact: Contact;
  lastMessage: string;
  timestamp: Date;
  unread: number;
  status: "sent" | "delivered" | "read";
  messages: Message[];
}

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
}

interface MediaOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  action: string;
}

const WhatsAppSalesforceApp: React.FC = () => {
  const [activeView, setActiveView] = useState<"chat" | "salesforce">("chat");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const [showMediaDropdown, setShowMediaDropdown] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaDropdownRef = useRef<HTMLDivElement>(null);

  // Mock data para conversas do WhatsApp
  const [chats, setChats] = useState<Chat[]>([
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
          id: "m1",
          text: "Olá, vi o anúncio no Facebook",
          timestamp: new Date(Date.now() - 1800000),
          sent: false,
          status: "read",
        },
        {
          id: "m2",
          text: "Olá Maria! Obrigado pelo interesse. Em que posso ajudá-la?",
          timestamp: new Date(Date.now() - 1500000),
          sent: true,
          status: "read",
        },
        {
          id: "m3",
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
          id: "m4",
          text: "Bom dia! Tenho interesse no serviço",
          timestamp: new Date(Date.now() - 3600000),
          sent: false,
          status: "read",
        },
        {
          id: "m5",
          text: "Bom dia João! Vamos agendar uma demonstração?",
          timestamp: new Date(Date.now() - 3300000),
          sent: true,
          status: "read",
        },
        {
          id: "m6",
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
          id: "m7",
          text: "Olá, preciso de mais informações",
          timestamp: new Date(Date.now() - 5400000),
          sent: false,
          status: "read",
        },
        {
          id: "m8",
          text: "Claro! Segue nossa apresentação em anexo",
          timestamp: new Date(Date.now() - 4800000),
          sent: true,
          status: "read",
        },
        {
          id: "m9",
          text: "Obrigada pelas informações!",
          timestamp: new Date(Date.now() - 3600000),
          sent: false,
          status: "read",
        },
      ],
    },
  ]);

  // Templates de mensagem
  const messageTemplates: MessageTemplate[] = [
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

  // Opções de mídia
  const mediaOptions: MediaOption[] = [
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

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return formatTime(date);
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ontem";
    } else {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="w-4 h-4 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case "read":
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "hot":
        return "bg-red-100 text-red-800 border-red-200";
      case "warm":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cold":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const sendMessage = async (): Promise<void> => {
    if (!newMessage.trim() || !selectedChat) return;

    setIsLoading(true);

    // Simular envio de mensagem
    const newMsg: Message = {
      id: `m${Date.now()}`,
      text: newMessage,
      timestamp: new Date(),
      sent: true,
      status: "sent",
    };

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === selectedChat.id
          ? {
              ...chat,
              messages: [...chat.messages, newMsg],
              lastMessage: newMessage,
              timestamp: new Date(),
            }
          : chat
      )
    );

    setNewMessage("");

    // Simular mudança de status da mensagem
    setTimeout(() => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === selectedChat.id
            ? {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg.id === newMsg.id ? { ...msg, status: "delivered" } : msg
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
                  msg.id === newMsg.id ? { ...msg, status: "read" } : msg
                ),
              }
            : chat
        )
      );
    }, 3000);

    setIsLoading(false);
  };

  const applyTemplate = (template: MessageTemplate): void => {
    if (selectedChat) {
      const personalizedMessage = template.content.replace(
        "{{name}}",
        selectedChat.contact.name
      );
      setNewMessage(personalizedMessage);
      setShowTemplates(false);
    }
  };

  const openSalesforceContact = (leadId: string): void => {
    // Simular abertura do Salesforce com o lead específico
    setActiveView("salesforce");
    console.log(`Abrindo Salesforce para lead: ${leadId}`);
    // Na implementação real, isso carregaria o Salesforce com o lead específico
  };

  const handleMediaAction = (action: string): void => {
    switch (action) {
      case "template":
        setShowTemplates(!showTemplates);
        break;
      case "camera":
        console.log("Abrir câmera");
        // Implementar funcionalidade da câmera
        break;
      case "file":
        console.log("Selecionar arquivo");
        // Implementar seleção de arquivo
        break;
      case "video":
        console.log("Selecionar vídeo");
        // Implementar seleção de vídeo
        break;
      case "audio":
        console.log("Gravar áudio");
        // Implementar gravação de áudio
        break;
    }
    setShowMediaDropdown(false);
  };

  const filteredChats = chats.filter(
    (chat) =>
      chat.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.contact.phone.includes(searchTerm) ||
      chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mediaDropdownRef.current &&
        !mediaDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMediaDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChat?.messages]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Menu Mobile */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex bg-blue-100 rounded-lg p-1">
              <button
                onClick={() => setActiveView("chat")}
                className={`px-2 md:px-4 py-2 rounded-md text-xs md:text-sm font-medium transition-colors ${
                  activeView === "chat"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                <MessageCircle className="w-4 h-4 inline mr-1 md:mr-2" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
              <button
                onClick={() => setActiveView("salesforce")}
                className={`px-2 md:px-4 py-2 rounded-md text-xs md:text-sm font-medium transition-colors ${
                  activeView === "salesforce"
                    ? "bg-gray-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <ExternalLink className="w-4 h-4 inline mr-1 md:mr-2" />
                <span className="hidden sm:inline">Salesforce</span>
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {activeView === "chat" ? (
        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar Mobile Overlay */}
          {showSidebar && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setShowSidebar(false)}
            />
          )}

          {/* Lista de Conversas */}
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
                onClick={() => setShowSidebar(false)}
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
                <div
                  key={chat.id}
                  onClick={() => {
                    setSelectedChat(chat);
                    setShowSidebar(false);
                  }}
                  className={`p-3 md:p-4 border-b border-blue-50 cursor-pointer transition-colors hover:bg-blue-50 ${
                    selectedChat?.id === chat.id
                      ? "bg-blue-100 border-l-4 border-l-blue-500"
                      : ""
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
                              openSalesforceContact(chat.contact.leadId);
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
              ))}
            </div>
          </div>

          {/* Área de Chat */}
          {selectedChat ? (
            <div className="flex-1 flex flex-col bg-gradient-to-b from-blue-25 to-gray-25">
              {/* Header do Chat */}
              <div className="bg-white border-b border-blue-100 p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="md:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-gray-500 rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-sm">
                      {selectedChat.contact.avatar}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900 text-sm md:text-base">
                        {selectedChat.contact.name}
                      </h2>
                      <p className="text-xs md:text-sm text-gray-500">
                        {selectedChat.contact.leadId}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(
                        selectedChat.contact.status
                      )}`}
                    >
                      {selectedChat.contact.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <button
                      onClick={() =>
                        openSalesforceContact(selectedChat.contact.leadId)
                      }
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

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
                {selectedChat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sent ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-3 md:px-4 py-2 rounded-lg ${
                        message.sent
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-900 border border-blue-100"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <div
                        className={`flex items-center justify-end space-x-1 mt-1 ${
                          message.sent ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        <span className="text-xs">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.sent && getStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Templates (se ativo) */}
              {showTemplates && (
                <div className="bg-white border-t border-blue-100 p-3 md:p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                      Templates
                    </h3>
                    <button
                      onClick={() => setShowTemplates(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {messageTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className="p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                      >
                        <p className="font-medium text-sm text-blue-900">
                          {template.name}
                        </p>
                        <p className="text-xs text-blue-600 mt-1 truncate">
                          {template.content}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input de Mensagem */}
              <div className="bg-white border-t border-blue-100 p-3 md:p-4">
                <div className="flex items-end space-x-2 md:space-x-3">
                  {/* Dropdown de Mídia */}
                  <div className="relative" ref={mediaDropdownRef}>
                    <button
                      onClick={() => setShowMediaDropdown(!showMediaDropdown)}
                      className={`p-2 rounded-lg transition-colors ${
                        showMediaDropdown
                          ? "bg-blue-500 text-white"
                          : "text-gray-500 hover:text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {showMediaDropdown && (
                      <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        {mediaOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleMediaAction(option.action)}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                          >
                            <span className="text-blue-500">{option.icon}</span>
                            <span className="text-sm font-medium">
                              {option.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      rows={1}
                      className="w-full text-black px-3 md:px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isLoading}
                    className="p-2 md:p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-blue-25 to-gray-25">
              <div className="text-center p-4">
                <MessageSquare className="w-12 h-12 md:w-16 md:h-16 text-blue-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Selecione uma conversa
                </h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Escolha uma conversa para começar a responder mensagens
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Salesforce Iframe
        <div className="flex-1 bg-white">
          <div className="h-full flex flex-col">
            <div className="bg-gray-50 border-b border-gray-200 p-3 md:p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base md:text-lg font-semibold text-gray-800">
                  Salesforce CRM
                </h2>
                <button
                  onClick={() => setActiveView("chat")}
                  className="px-3 md:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Voltar ao Chat
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 flex items-center justify-center relative">
              <Image
                src="/Captura de tela 2025-07-23 230045.png"
                alt="Captura de tela"
                fill
                style={{ objectFit: "contain" }}
              />

              {/* <div className="text-center bg-white p-8 rounded-lg shadow-md">
                <ExternalLink className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Salesforce Integration
                </h3>
                <p className="text-gray-600 mb-4">
                  Aqui seria carregado o Salesforce via iframe
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-800">
                    Na implementação real, este espaço seria ocupado por:
                    <br />
                    • Iframe do Salesforce
                    <br />
                    • Integração com APIs do SF
                    <br />• Navegação automática para leads específicos
                  </p>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppSalesforceApp;
