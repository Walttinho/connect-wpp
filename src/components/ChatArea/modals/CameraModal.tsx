import React, { useRef, useEffect, useState } from "react";
import { Camera, RotateCcw } from "lucide-react";
import { Modal } from "../../common/Modal";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture?: (imageData: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setLoading(true);
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Erro ao acessar câmera:", error);
      setError(
        "Erro ao acessar a câmera. Verifique as permissões do navegador."
      );
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    setError(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(imageData);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const savePhoto = () => {
    if (capturedImage) {
      onCapture?.(capturedImage);

      const link = document.createElement("a");
      link.download = `foto_${new Date().getTime()}.jpg`;
      link.href = capturedImage;
      link.click();

      onClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Câmera" size="lg">
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            <span className="ml-2 text-gray-600">Acessando câmera...</span>
          </div>
        )}

        {!capturedImage && !loading && !error ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg bg-black"
              style={{ maxHeight: "300px", objectFit: "cover" }}
            />
            <div className="flex justify-center space-x-4">
              <button
                onClick={capturePhoto}
                disabled={!stream}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Camera size={20} />
                <span>Capturar Foto</span>
              </button>
            </div>
          </>
        ) : (
          capturedImage && (
            <>
              <img
                src={capturedImage}
                alt="Foto capturada"
                className="w-full rounded-lg shadow-md"
              />
              <div className="flex justify-center space-x-4">
                <button
                  onClick={retakePhoto}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <RotateCcw size={20} />
                  <span>Refazer</span>
                </button>
                <button
                  onClick={savePhoto}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Salvar Foto
                </button>
              </div>
            </>
          )
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </Modal>
  );
};
