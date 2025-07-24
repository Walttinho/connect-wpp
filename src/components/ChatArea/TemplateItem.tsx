import { MessageTemplate } from "@/types";

interface TemplateItemProps {
  template: MessageTemplate;
  onClick: () => void;
}

export const TemplateItem: React.FC<TemplateItemProps> = ({ template, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
    >
      <p className="font-medium text-sm text-blue-900">{template.name}</p>
      <p className="text-xs text-blue-600 mt-1 truncate">{template.content}</p>
    </button>
  );
};
