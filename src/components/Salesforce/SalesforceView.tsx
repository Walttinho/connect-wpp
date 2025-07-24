import React from 'react';
import { ExternalLink } from 'lucide-react';
import { ViewType } from '../../types';
import Image from 'next/image';

interface SalesforceViewProps {
  onViewChange: (view: ViewType) => void;
}

export const SalesforceView: React.FC<SalesforceViewProps> = ({
  onViewChange,
}) => {
  return (
    <div className="flex-1 bg-white">
      <div className="h-full flex flex-col">
        <div className="bg-gray-50 border-b border-gray-200 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg font-semibold text-gray-800">
              Salesforce CRM
            </h2>
            <button
              onClick={() => onViewChange("chat")}
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
        </div>
      </div>
    </div>
  );
};