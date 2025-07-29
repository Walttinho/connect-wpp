import React, { useEffect, useState } from "react";
import { Send, AlertCircle } from "lucide-react";
import { MediaDropdown } from "./MediaDropdown";
import { CameraModal } from "./modals/CameraModal";
import { VideoModal } from "./modals/VideoModal";
import { AudioModal } from "./modals/AudioModal";
import { FileModal } from "./modals/FileModal";
import { useMediaActions } from "../../hooks/useMediaActions";
import { useConnectChat } from "../../hooks/useConnectChat";

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
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { sendAttachment } = useConnectChat();

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

  const handleCameraCapture = async (imageData: string) => {
    try {
      setUploadError(null);
      // Converte base64 para File
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' });
      await sendAttachment(file);
      console.log('Foto enviada via Amazon Connect');
    } catch (error) {
      console.error('Erro ao enviar foto:', error);
      setUploadError('Erro ao enviar foto. Tente novamente.');
    }
  };

  const handleVideoRecording = async (videoBlob: Blob) => {
    try {
      setUploadError(null);
      const file = new File([videoBlob], `video_${Date.now()}.webm`, { type: 'video/webm' });
      await sendAttachment(file);
      console.log('Vídeo enviado via Amazon Connect');
    } catch (error) {
      console.error('Erro ao enviar vídeo:', error);
      setUploadError('Erro ao enviar vídeo. Tente novamente.');
    }
  };

  const handleAudioRecording = async (audioBlob: Blob) => {
    try {
      setUploadError(null);
      const file = new File([audioBlob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });
      await sendAttachment(file);
      console.log('Áudio enviado via Amazon Connect');
    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
      setUploadError('Erro ao enviar áudio. Tente novamente.');
    }
  };

  const handleFilesUpload = async (files: File[]) => {
    try {
      setUploadError(null);
      for (const file of files) {
        await sendAttachment(file);
      }
      console.log(`${files.length} arquivo(s) enviado(s) via Amazon Connect`);
    } catch (error) {
      console.error('Erro ao enviar arquivos:', error);
      setUploadError('Erro ao enviar arquivo(s). Tente novamente.');
    }
  };

  const clearUploadError = () => {
    setUploadError(null);
  };

  return (
    <>
      {/* Erro de Upload */}
      {uploadError && (
        <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{uploadError}</span>
            </div>
            <button
              onClick={clearUploadError}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border-t border-blue-100 p-3 md:p-4">
        <div className="flex items-end space-x-2 md:space-x-3">
          <MediaDropdown
            showMediaDropdown={showMediaDropdown}
            onToggle={() => setShowMediaDropdown(!showMediaDropdown)}
            onMediaAction={(action) => handleMediaAction(action, onTemplateToggle)}
            mediaDropdownRef={mediaDropdownRef as React.RefObject<HTMLDivElement>}
          />

          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem (Amazon Connect)..."
              rows={1}
              className="w-full text-black px-3 md:px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              onKeyPress={handleKeyPress}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || isLoading}
            className="p-2 md:p-3 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Enviar via Amazon Connect"
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
