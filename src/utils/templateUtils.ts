import { MessageTemplate } from '../types';

export const applyTemplatePersonalization = (
  template: MessageTemplate,
  contactName: string
): string => {
  return template.content.replace("{{name}}", contactName);
};