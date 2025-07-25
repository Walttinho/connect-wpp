import React, { useRef, useState } from "react";
import { Upload, File as FileIcon, X, Check } from "lucide-react";
import { Modal } from "../../common/Modal";

interface FileInfo {
  file: File;
  id: string;
  preview?: string;
  uploaded: boolean;
}

interface FileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesUpload?: (files: File[]) => void;
  acceptedTypes?: string;
  maxFiles?: number;
  maxSize?: number;
}

export const FileModal: React.FC<FileModalProps> = ({
  isOpen,
  onClose,
  onFilesUpload,
  acceptedTypes = "*/*",
  maxFiles = 5,
  maxSize = 10, // 10MB por padrão
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFileId = () => Math.random().toString(36).substr(2, 9);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `Arquivo "${file.name}" excede o tamanho máximo de ${maxSize}MB`;
    }
    return null;
  };

  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const processFiles = async (files: FileList) => {
    setError(null);
    const newFiles: FileInfo[] = [];

    if (selectedFiles.length + files.length > maxFiles) {
      setError(`Máximo de ${maxFiles} arquivos permitidos`);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        return;
      }

      const preview = await createFilePreview(file);

      newFiles.push({
        file,
        id: generateFileId(),
        preview,
        uploaded: false,
      });
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }

    event.target.value = "";
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId));
    setError(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSelectedFiles((prev) =>
        prev.map((file) => ({ ...file, uploaded: true }))
      );

      const files = selectedFiles.map((f) => f.file);
      onFilesUpload?.(files);

      setTimeout(() => {
        onClose();
        resetModal();
      }, 1000);
    } catch (error) {
      setError("Erro ao fazer upload dos arquivos. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const resetModal = () => {
    setSelectedFiles([]);
    setError(null);
    setUploading(false);
    setDragOver(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return "🖼️";
    if (file.type.startsWith("video/")) return "🎥";
    if (file.type.startsWith("audio/")) return "🎵";
    if (file.type.includes("pdf")) return "📄";
    if (file.type.includes("word")) return "📝";
    if (file.type.includes("excel") || file.type.includes("spreadsheet"))
      return "📊";
    return "📎";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload de Arquivos"
      size="lg"
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Área de Drop */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Arraste arquivos aqui ou clique para selecionar
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Máximo {maxFiles} arquivos, até {maxSize}MB cada
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Selecionar Arquivos
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Lista de Arquivos Selecionados */}
        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700">
              Arquivos Selecionados ({selectedFiles.length})
            </h4>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {selectedFiles.map((fileInfo) => (
                <div
                  key={fileInfo.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  {fileInfo.preview ? (
                    <img
                      src={fileInfo.preview}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded">
                      <span className="text-lg">
                        {getFileIcon(fileInfo.file)}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileInfo.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileInfo.file.size)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {fileInfo.uploaded && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                    {!uploading && (
                      <button
                        onClick={() => removeFile(fileInfo.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        {selectedFiles.length > 0 && (
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={resetModal}
              disabled={uploading}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors"
            >
              Limpar Tudo
            </button>
            <button
              onClick={uploadFiles}
              disabled={uploading || selectedFiles.every((f) => f.uploaded)}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Enviando...</span>
                </>
              ) : selectedFiles.every((f) => f.uploaded) ? (
                <>
                  <Check size={16} />
                  <span>Concluído</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Enviar Arquivos</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
