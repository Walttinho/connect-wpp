export type MediaType = "image" | "video" | "audio" | "file";

export type RecordingState = "idle" | "recording" | "paused" | "stopped";

export interface MediaFile {
  id: string;
  file: File;
  type: MediaType;
  url?: string;
  preview?: string;
  duration?: number;
  uploaded: boolean;
  uploadProgress?: number;
}

export interface CameraSettings {
  width?: number;
  height?: number;
  facingMode?: "user" | "environment";
  quality?: number;
}

export interface VideoSettings extends CameraSettings {
  audio?: boolean;
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
}

export interface AudioSettings {
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
  sampleRate?: number;
}

export interface FileUploadSettings {
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string;
  allowMultiple?: boolean;
}

export interface MediaCallbacks {
  onCameraCapture?: (imageData: string, file?: File) => void;
  onVideoRecording?: (
    videoBlob: Blob,
    videoUrl: string,
    duration: number
  ) => void;
  onAudioRecording?: (
    audioBlob: Blob,
    audioUrl: string,
    duration: number
  ) => void;
  onFilesUpload?: (files: File[]) => void;
  onMediaError?: (error: string, type: MediaType) => void;
  onUploadProgress?: (progress: number, fileId: string) => void;
}
