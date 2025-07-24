import React from 'react';
import { Plus } from 'lucide-react';
import { mediaOptions } from '../../services/mockData';

interface MediaDropdownProps {
  showMediaDropdown: boolean;
  onToggle: () => void;
  onMediaAction: (action: string) => void;
  mediaDropdownRef: React.RefObject<HTMLDivElement>;
}

export const MediaDropdown: React.FC<MediaDropdownProps> = ({
  showMediaDropdown,
  onToggle,
  onMediaAction,
  mediaDropdownRef,
}) => {
  return (
    <div className="relative" ref={mediaDropdownRef}>
      <button
        onClick={onToggle}
        className={`p-2 rounded-lg transition-colors ${
          showMediaDropdown
            ? "bg-blue-500 text-white"
            : "text-gray-500 hover:text-gray-600 hover:bg-gray-50"
        }`}
      >
        <Plus className="w-5 h-5" />
      </button>

      {showMediaDropdown && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {mediaOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onMediaAction(option.action)}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
            >
              <span className="text-blue-500">{option.icon}</span>
              <span className="text-sm font-medium">{option.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );   
};  