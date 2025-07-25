//src/components/ChatArea/MessageInput.tsx
import React, { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { MediaDropdown } from "./MediaDropdown";
import { CameraModal } from "./modals/CameraModal";
import { VideoModal } from "./modals/VideoModal";
import { AudioModal } from "./modals/AudioModal";
import { FileModal } from "./modals/FileModal";
import { useMediaActions } from "../../hooks/useMediaActions";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onTemplateToggle: () => void;
  isLoading: boolean;
  defaultMessage?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTemplateToggle,
  isLoading,
  defaultMessage = "",
}) => {
  const [newMessage, setNewMessage] = useState<string>(defaultMessage);

  useEffect(() => {
    setNewMessage(defaultMessage);
  }, [defaultMessage]);

  const {
    showMediaDropdown,
    setShowMediaDropdown,
    activeModal,
    mediaDropdownRef,
    handleMediaAction,
    closeModal,
    handleCameraCapture,
    handleVideoRecording,
    handleAudioRecording,
    handleFilesUpload,
  } = useMediaActions();

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="bg-white border-t border-blue-100 p-3 md:p-4">
        <div className="flex items-end space-x-2 md:space-x-3">
          <MediaDropdown
            showMediaDropdown={showMediaDropdown}
            onToggle={() => setShowMediaDropdown(!showMediaDropdown)}
            onMediaAction={(action) =>
              handleMediaAction(action, onTemplateToggle)
            }
            mediaDropdownRef={
              mediaDropdownRef as React.RefObject<HTMLDivElement>
            }
          />

          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              rows={1}
              className="w-full text-black px-3 md:px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              onKeyPress={handleKeyPress}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || isLoading}
            className="p-2 md:p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Modais de Mídia */}
      <CameraModal
        isOpen={activeModal === "camera"}
        onClose={closeModal}
        onCapture={handleCameraCapture}
      />

      <VideoModal
        isOpen={activeModal === "video"}
        onClose={closeModal}
        onRecordingComplete={handleVideoRecording}
      />

      <AudioModal
        isOpen={activeModal === "audio"}
        onClose={closeModal}
        onRecordingComplete={handleAudioRecording}
      />

      <FileModal
        isOpen={activeModal === "file"}
        onClose={closeModal}
        onFilesUpload={handleFilesUpload}
        acceptedTypes="*/*"
        maxFiles={5}
        maxSize={10}
      />
    </>
  );
};
