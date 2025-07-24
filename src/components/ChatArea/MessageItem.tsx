import { Message } from "@/types";
import { formatTime } from "@/utils/dateUtils";
import { getStatusIcon } from "@/utils/statusUtils";

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  return (
    <div
      className={`flex ${
        message.sent ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-3 md:px-4 py-2 rounded-lg ${
          message.sent
            ? "bg-blue-500 text-white"
            : "bg-white text-gray-900 border border-blue-100"
        }`}
      >
        <p className="text-sm">{message.text}</p>
        <div
          className={`flex items-center justify-end space-x-1 mt-1 ${
            message.sent ? "text-blue-100" : "text-gray-500"
          }`}
        >
          <span className="text-xs">
            {formatTime(message.timestamp)}
          </span>
          {message.sent && getStatusIcon(message.status)}
        </div>
      </div>
    </div>
  );
};