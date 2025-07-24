import React, { useRef, useEffect, useState } from 'react';
import { Video, Play, Pause, Square, RotateCcw } from 'lucide-react';
import { Modal } from '../../common/Modal';

type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordingComplete?: (videoBlob: Blob, videoUrl: string) => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ 
  isOpen, 
  onClose,
  onRecordingComplete 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recordingState === 'recording') {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recordingState]);

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
          facingMode: 'user'
        }, 
        audio: true 
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      setError('Erro ao acessar a câmera/microfone. Verifique as permissões do navegador.');
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setRecordingState('idle');
    setRecordingTime(0);
    setRecordedVideoUrl(null);
    setRecordedChunks([]);
    setError(null);
  };

  const startRecording = () => {
    if (!stream) return;
    
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setRecordedChunks(chunks);
        
        // Callback para componente pai
        onRecordingComplete?.(blob, url);
      };

      mediaRecorder.start(1000); // Coleta dados a cada segundo
      setRecordingState('recording');
      setRecordingTime(0);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      setError('Erro ao iniciar gravação. Tente novamente.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecordingState('stopped');
    }
  };

  const saveVideo = () => {
    if (recordedVideoUrl) {
      const link = document.createElement('a');
      link.download = `video_${new Date().getTime()}.webm`;
      link.href = recordedVideoUrl;
      link.click();
      onClose();
    }
  };

  const resetRecording = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedVideoUrl(null);
    setRecordingState('idle');
    setRecordingTime(0);
    setRecordedChunks([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Gravação de Vídeo" size="lg">
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

        {!loading && !error && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg bg-black"
              style={{ maxHeight: '300px', objectFit: 'cover' }}
            />
            
            {recordingState !== 'idle' && (
              <div className="text-center py-2">
                <div className="text-xl font-mono text-gray-800">
                  ⏱️ {formatTime(recordingTime)}
                </div>
                {recordingState === 'recording' && (
                  <div className="text-red-500 font-semibold mt-1">
                    🔴 Gravando
                  </div>
                )}
                {recordingState === 'paused' && (
                  <div className="text-yellow-500 font-semibold mt-1">
                    ⏸️ Pausado
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-center space-x-2">
              {recordingState === 'idle' && (
                <button
                  onClick={startRecording}
                  disabled={!stream}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Video size={20} />
                  <span>Iniciar Gravação</span>
                </button>
              )}
              
              {recordingState === 'recording' && (
                <>
                  <button
                    onClick={pauseRecording}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Pause size={20} />
                    <span>Pausar</span>
                  </button>
                  <button
                    onClick={stopRecording}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Square size={20} />
                    <span>Parar</span>
                  </button>
                </>
              )}
              
              {recordingState === 'paused' && (
                <>
                  <button
                    onClick={resumeRecording}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Play size={20} />
                    <span>Continuar</span>
                  </button>
                  <button
                    onClick={stopRecording}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Square size={20} />
                    <span>Parar</span>
                  </button>
                </>
              )}
            </div>

            {recordedVideoUrl && (
              <div className="space-y-4 border-t pt-4">
                <div className="text-center text-lg font-semibold text-gray-800">
                  Vídeo Gravado
                </div>
                <video
                  src={recordedVideoUrl}
                  controls
                  className="w-full rounded-lg shadow-md"
                  style={{ maxHeight: '250px' }}
                />
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={resetRecording}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <RotateCcw size={20} />
                    <span>Gravar Novo</span>
                  </button>
                  <button
                    onClick={saveVideo}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Salvar Vídeo
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};