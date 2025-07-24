import { useState, useRef, useEffect } from 'react';

export const useMediaActions = () => {
  const [showMediaDropdown, setShowMediaDropdown] = useState<boolean>(false);
  const mediaDropdownRef = useRef<HTMLDivElement>(null);

  const handleMediaAction = (action: string, onTemplateToggle?: () => void) => {
    switch (action) {
      case "template":
        onTemplateToggle?.();
        break;
      case "camera":
        console.log("Abrir câmera");
        // Implementar funcionalidade da câmera
        break;
      case "file":
        console.log("Selecionar arquivo");
        // Implementar seleção de arquivo
        break;
      case "video":
        console.log("Selecionar vídeo");
        // Implementar seleção de vídeo
        break;
      case "audio":
        console.log("Gravar áudio");
        // Implementar gravação de áudio
        break;
    }
    setShowMediaDropdown(false);
  };

  // Fechar dropdown ao clicar fora
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
    mediaDropdownRef,
    handleMediaAction,
  };
};