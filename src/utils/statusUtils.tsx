import { Check, CheckCheck, Clock } from "lucide-react";
import { ContactStatus, MessageStatus } from '../types';

export const getStatusIcon = (status: MessageStatus) => {
  switch (status) {
    case "sent":
      return <Check className="w-4 h-4 text-gray-400" />;
    case "delivered":
      return <CheckCheck className="w-4 h-4 text-gray-400" />;
    case "read":
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

export const getStatusColor = (status: ContactStatus): string => {
  switch (status) {
    case "hot":
      return "bg-red-100 text-red-800 border-red-200";
    case "warm":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "cold":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};