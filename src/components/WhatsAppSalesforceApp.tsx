'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  X 
} from 'lucide-react';

// Types
interface Contact {
  name: string;
  phone: string;
  avatar: string;
  leadId: string;
  status: 'hot' | 'warm' | 'cold';
}

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sent: boolean;
  status: 'sent' | 'delivered' | 'read';
}

interface Chat {
  id: string;
  contact: Contact;
  lastMessage: string;
  timestamp: Date;
  unread: number;
  status: 'sent' | 'delivered' | 'read';
  messages: Message[];
}

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
}

const WhatsAppSalesforceApp: React.FC = () => {
  const [activeView, setActiveView] = useState<'chat' | 'salesforce'>('chat');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data para conversas do WhatsApp
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      contact: {
        name: 'Maria Silva',
        phone: '+55 11 99999-0001',
        avatar: 'MS',
        leadId: 'SF001',
        status: 'hot'
      },
      lastMessage: 'Gostaria de saber mais sobre o produto',
      timestamp: new Date(Date.now() - 300000),
      unread: 2,
      status: 'delivered',
      messages: [
        {
          id: 'm1',
          text: 'Olá, vi o anúncio no Facebook',
          timestamp: new Date(Date.now() - 1800000),
          sent: false,
          status: 'read'
        },
        {
          id: 'm2',
          text: 'Olá Maria! Obrigado pelo interesse. Em que posso ajudá-la?',
          timestamp: new Date(Date.now() - 1500000),
          sent: true,
          status: 'read'
        },
        {
          id: 'm3',
          text: 'Gostaria de saber mais sobre o produto',
          timestamp: new Date(Date.now() - 300000),
          sent: false,
          status: 'delivered'
        }
      ]
    },
    {
      id: '2',
      contact: {
        name: 'João Santos',
        phone: '+55 11 99999-0002',
        avatar: 'JS',
        leadId: 'SF002',
        status: 'warm'
      },
      lastMessage: 'Perfeito! Quando podemos agendar?',
      timestamp: new Date(Date.now() - 600000),
      unread: 0,
      status: 'read',
      messages: [
        {
          id: 'm4',
          text: 'Bom dia! Tenho interesse no serviço',
          timestamp: new Date(Date.now() - 3600000),
          sent: false,
          status: 'read'
        },
        {
          id: 'm5',
          text: 'Bom dia João! Vamos agendar uma demonstração?',
          timestamp: new Date(Date.now() - 3300000),
          sent: true,
          status: 'read'
        },
        {
          id: 'm6',
          text: 'Perfeito! Quando podemos agendar?',
          timestamp: new Date(Date.now() - 600000),
          sent: false,
          status: 'read'
        }
      ]
    },
    {
      id: '3',
      contact: {
        name: 'Ana Costa',
        phone: '+55 11 99999-0003',
        avatar: 'AC',
        leadId: 'SF003',
        status: 'cold'
      },
      lastMessage: 'Obrigada pelas informações!',
      timestamp: new Date(Date.now() - 3600000),
      unread: 0,
      status: 'read',
      messages: [
        {
          id: 'm7',
          text: 'Olá, preciso de mais informações',
          timestamp: new Date(Date.now() - 5400000),
          sent: false,
          status: 'read'
        },
        {
          id: 'm8',
          text: 'Claro! Segue nossa apresentação em anexo',
          timestamp: new Date(Date.now() - 4800000),
          sent: true,
          status: 'read'
        },
        {
          id: 'm9',
          text: 'Obrigada pelas informações!',
          timestamp: new Date(Date.now() - 3600000),
          sent: false,
          status: 'read'
        }
      ]
    }
  ]);

  // Templates de mensagem
  const messageTemplates: MessageTemplate[] = [
    {
      id: 't1',
      name: 'Boas-vindas',
      content: 'Olá {{name}}! Obrigado pelo seu interesse. Como posso ajudá-lo hoje?',
      category: 'inicial'
    },
    {
      id: 't2',
      name: 'Proposta Comercial',
      content: 'Olá {{name}}, preparei uma proposta especial para você. Quando podemos conversar?',
      category: 'vendas'
    },
    {
      id: 't3',
      name: 'Follow-up',
      content: 'Oi {{name}}, como está? Gostaria de saber se ainda tem interesse em nosso produto.',
      category: 'follow-up'
    },
    {
      id: 't4',
      name: 'Agendamento',
      content: 'Perfeito {{name}}! Vou agendar nossa reunião. Qual horário é melhor para você?',
      category: 'agendamento'
    }
  ];

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return formatTime(date);
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'hot':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warm':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cold':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
      status: 'sent'
    };

    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === selectedChat.id 
          ? {
              ...chat,
              messages: [...chat.messages, newMsg],
              lastMessage: newMessage,
              timestamp: new Date()
            }
          : chat
      )
    );

    setNewMessage('');
    
    // Simular mudança de status da mensagem
    setTimeout(() => {
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === selectedChat.id
            ? {
                ...chat,
                messages: chat.messages.map(msg =>
                  msg.id === newMsg.id ? { ...msg, status: 'delivered' } : msg
                )
              }
            : chat
        )
      );
    }, 1000);

    setTimeout(() => {
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === selectedChat.id
            ? {
                ...chat,
                messages: chat.messages.map(msg =>
                  msg.id === newMsg.id ? { ...msg, status: 'read' } : msg
                )
              }
            : chat
        )
      );
    }, 3000);

    setIsLoading(false);
  };

  const useTemplate = (template: MessageTemplate): void => {
    if (selectedChat) {
      const personalizedMessage = template.content.replace('{{name}}', selectedChat.contact.name);
      setNewMessage(personalizedMessage);
      setShowTemplates(false);
    }
  };

  const openSalesforceContact = (leadId: string): void => {
    // Simular abertura do Salesforce com o lead específico
    setActiveView('salesforce');
    console.log(`Abrindo Salesforce para lead: ${leadId}`);
    // Na implementação real, isso carregaria o Salesforce com o lead específico
  };

  const filteredChats = chats.filter(chat =>
    chat.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.contact.phone.includes(searchTerm) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat?.messages]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex bg-blue-100 rounded-lg p-1">
              <button
                onClick={() => setActiveView('chat')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'chat'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                WhatsApp
              </button>
              <button
                onClick={() => setActiveView('salesforce')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'salesforce'
                    ? 'bg-gray-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ExternalLink className="w-4 h-4 inline mr-2" />
                Salesforce
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

      {activeView === 'chat' ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Lista de Conversas */}
          <div className="w-80 bg-white border-r border-blue-100 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-blue-100">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar conversas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 border-b border-blue-50 cursor-pointer transition-colors hover:bg-blue-50 ${
                    selectedChat?.id === chat.id ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-gray-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {chat.contact.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {chat.contact.name}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(chat.contact.status)}`}>
                            {chat.contact.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">
                            {formatDate(chat.timestamp)}
                          </span>
                          {chat.unread > 0 && (
                            <span className="bg-gray-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
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
              <div className="bg-white border-b border-blue-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-gray-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedChat.contact.avatar}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {selectedChat.contact.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {selectedChat.contact.leadId}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(selectedChat.contact.status)}`}>
                      {selectedChat.contact.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openSalesforceContact(selectedChat.contact.leadId)}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Ver Lead</span>
                    </button>
                    <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Phone className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedChat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sent
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-900 border border-blue-100'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <div className={`flex items-center justify-end space-x-1 mt-1 ${
                        message.sent ? 'text-blue-100' : 'text-gray-500'
                      }`}>
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
                <div className="bg-white border-t border-blue-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Templates</h3>
                    <button
                      onClick={() => setShowTemplates(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {messageTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => useTemplate(template)}
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
              <div className="bg-white border-t border-blue-100 p-4">
                <div className="flex items-end space-x-3">
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className={`p-2 rounded-lg transition-colors ${
                      showTemplates
                        ? 'bg-gray-500 text-white'
                        : 'text-gray-500 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      rows={1}
                      className="w-full text-black px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isLoading}
                    className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-blue-25 to-gray-25">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Selecione uma conversa
                </h3>
                <p className="text-gray-600">
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
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Salesforce CRM
                </h2>
                <button
                  onClick={() => setActiveView('chat')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Voltar ao Chat
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 flex items-center justify-center">
              <div className="text-center bg-white p-8 rounded-lg shadow-md">
                <ExternalLink className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Salesforce Integration
                </h3>
                <p className="text-gray-600 mb-4">
                  Aqui seria carregado o Salesforce via iframe
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-800">
                    Na implementação real, este espaço seria ocupado por:<br/>
                    • Iframe do Salesforce<br/>
                    • Integração com APIs do SF<br/>
                    • Navegação automática para leads específicos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppSalesforceApp;