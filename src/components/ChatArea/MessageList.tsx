import React from 'react';
import { Message } from '../../types';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  messagesEndRef,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
      {messages.map((message) => (
        <MessageItem key={message.chatId} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};