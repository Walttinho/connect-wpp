import React from 'react';
import { X } from 'lucide-react';
import { MessageTemplate } from '../../types';
import { TemplateItem } from './TemplateItem';

interface TemplatePanelProps {
  templates: MessageTemplate[];
  onTemplateApply: (template: MessageTemplate) => string;
  onClose: () => void;
}

export const TemplatePanel: React.FC<TemplatePanelProps> = ({
  templates,
  onTemplateApply,
  onClose,
}) => {
  const handleTemplateClick = (template: MessageTemplate) => {
    const personalizedMessage = onTemplateApply(template);
    // Aqui você pode implementar a lógica para inserir a mensagem no input
    console.log('Mensagem personalizada:', personalizedMessage);
    onClose();
  };

  return (
    <div className="bg-white border-t border-blue-100 p-3 md:p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm md:text-base">
          Templates
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {templates.map((template) => (
          <TemplateItem
            key={template.id}
            template={template}
            onClick={() => handleTemplateClick(template)}
          />
        ))}
      </div>
    </div>
  );
};