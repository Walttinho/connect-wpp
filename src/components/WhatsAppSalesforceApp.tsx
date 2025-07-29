"use client";

import React, { useState } from "react";
import { Chat, ViewType } from "../types";
import { initialChats, messageTemplates } from "../services/mockData";
import { SalesforceService } from "../services/mockData";
import { useChat } from "../hooks/useChat";
import { useSidebar } from "../hooks/useSidebar";
import { Header } from "./Header/Header";
import { ChatList } from "./ChatList/ChatList";
import { ChatArea } from "./ChatArea/ChatArea";
import { SalesforceView } from "./Salesforce/SalesforceView";

const WhatsAppSalesforceApp: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>("chat");
  const [showTemplates, setShowTemplates] = useState<boolean>(false);

  const { chats, isLoading, sendMessage, applyTemplate } =
    useChat(initialChats);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const { showSidebar, toggleSidebar, closeSidebar } = useSidebar();

  const handleSendMessage = async (messageText: string) => {
    await sendMessage(messageText);
  };

  const handleTemplateToggle = () => {
    setShowTemplates(!showTemplates);
  };

  const handleSalesforceOpen = async (leadId: string) => {
    await SalesforceService.openContact(leadId);
    setActiveView("salesforce");
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    closeSidebar();
  };

  const handleChatClose = () => {
    setSelectedChat(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      <Header
        activeView={activeView}
        onViewChange={setActiveView}
        onMenuToggle={toggleSidebar}
      />

      {activeView === "chat" ? (
        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar Mobile Overlay */}
          {showSidebar && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={closeSidebar}
            />
          )}

          <ChatList
            chats={chats}
            connectChats={chats}
            selectedChat={selectedChat}
            onChatSelect={handleChatSelect}
            onSalesforceOpen={handleSalesforceOpen}
            showSidebar={showSidebar}
            onSidebarClose={closeSidebar}
          />

          <ChatArea
            selectedChat={selectedChat}
            onChatClose={handleChatClose}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            showTemplates={showTemplates}
            onTemplateToggle={handleTemplateToggle}
            onTemplateApply={applyTemplate}
            messageTemplates={messageTemplates}
          />
        </div>
      ) : (
        <SalesforceView onViewChange={setActiveView} />
      )}
    </div>
  );
};

export default WhatsAppSalesforceApp;
