import React from 'react';
import { MessageCircle, ExternalLink, Settings, Menu } from 'lucide-react';
import { ViewType } from '../../types';

interface HeaderProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onViewChange,
  onMenuToggle,
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-blue-100 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Menu Mobile */}
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex bg-blue-100 rounded-lg p-1">
            <button
              onClick={() => onViewChange("chat")}
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
              onClick={() => onViewChange("salesforce")}
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
  );
};