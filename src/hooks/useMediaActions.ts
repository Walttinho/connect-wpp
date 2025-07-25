import { useState, useRef, useEffect } from "react";

type ModalType = "camera" | "video" | "audio" | "file" | null;

export const useMediaActions = () => {
  const [showMediaDropdown, setShowMediaDropdown] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const mediaDropdownRef = useRef<HTMLDivElement>(null);

  const handleMediaAction = (action: string, onTemplateToggle?: () => void) => {
    switch (action) {
      case "template":
        onTemplateToggle?.();
        break;
      case "camera":
        setActiveModal("camera");
        break;
      case "file":
        setActiveModal("file");
        break;
      case "video":
        setActiveModal("video");
        break;
      case "audio":
        setActiveModal("audio");
        break;
      default:
        console.log(`Ação não implementada: ${action}`);
    }
    setShowMediaDropdown(false);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const openModal = (modalType: ModalType) => {
    setActiveModal(modalType);
  };

  const handleCameraCapture = (imageData: string) => {
    console.log("Foto capturada:", imageData);
    // TODO: processar a imagem capturada
  };

  const handleVideoRecording = (videoBlob: Blob, videoUrl: string) => {
    console.log("Vídeo gravado:", { videoBlob, videoUrl });
    // TODO: processar o vídeo gravado
  };

  const handleAudioRecording = (audioBlob: Blob, audioUrl: string) => {
    console.log("Áudio gravado:", { audioBlob, audioUrl });
    // TODO: processar o áudio gravado
  };

  const handleFilesUpload = (files: File[]) => {
    console.log("Arquivos selecionados:", files);
    // TODO: processar os arquivos selecionados
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mediaDropdownRef.current &&
        !mediaDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMediaDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return {
    showMediaDropdown,
    setShowMediaDropdown,
    activeModal,
    mediaDropdownRef,
    handleMediaAction,
    closeModal,
    openModal,
    handleCameraCapture,
    handleVideoRecording,
    handleAudioRecording,
    handleFilesUpload,
  };
};
