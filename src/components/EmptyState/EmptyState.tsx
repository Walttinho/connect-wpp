import React from 'react';
import { MessageSquare } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
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
  );
};