//src/utils/templateUtils.ts
import { MessageTemplate } from "../types";

export const applyTemplatePersonalization = (
  template: MessageTemplate,
  contactName: string
): string => {
  if (!contactName) {
    console.warn("Nome do contato não fornecido");
    return template.content;
  }

  const personalizedContent = template.content.replace(
    /\{\{name\}\}/g,
    contactName
  );

  return personalizedContent;
};
