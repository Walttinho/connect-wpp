import React, { useRef, useEffect, useState } from 'react';
import { Mic, Play, Pause, Square, RotateCcw } from 'lucide-react';
import { Modal } from '../../common/Modal';

type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

interface AudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordingComplete?: (audioBlob: Blob, audioUrl: string) => void;
}

export const AudioModal: React.FC<AudioModalProps> = ({ 
  isOpen, 
  onClose,
  onRecordingComplete 
}) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

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
    if (!isOpen) {
      cleanup();
    }
    
    return () => {
      cleanup();
    };
  }, [isOpen]);

  const cleanup = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setRecordingState('idle');
    setRecordingTime(0);
    setAudioLevel(0);
    setError(null);
  };

  const setupAudioAnalyser = (stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      const updateAudioLevel = () => {
        if (analyserRef.current && recordingState === 'recording') {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average);
          
          animationRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Erro ao configurar analisador de áudio:', error);
    }
  };

  const startRecording = async () => {
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      setupAudioAnalyser(stream);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        setRecordedChunks(chunks);
        
        // Parar todas as tracks do stream
        stream.getTracks().forEach(track => track.stop());
        
        // Callback para componente pai
        onRecordingComplete?.(blob, url);
      };

      mediaRecorder.start(1000);
      setRecordingState('recording');
      setRecordingTime(0);
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      setError('Erro ao acessar o microfone. Verifique as permissões do navegador.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      setAudioLevel(0);
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
      setAudioLevel(0);
    }
  };

  const playAudio = () => {
    if (audioRef.current && recordedAudioUrl) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const saveAudio = () => {
    if (recordedAudioUrl) {
      const link = document.createElement('a');
      link.download = `audio_${new Date().getTime()}.webm`;
      link.href = recordedAudioUrl;
      link.click();
      onClose();
    }
  };

  const resetRecording = () => {
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    setRecordedAudioUrl(null);
    setRecordingState('idle');
    setRecordingTime(0);
    setIsPlaying(false);
    setRecordedChunks([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Gravação de Áudio">
      <div className="space-y-6 text-center">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-left">
            {error}
          </div>
        )}

        <div className="flex justify-center">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
            recordingState === 'recording' 
              ? 'bg-red-100 animate-pulse' 
              : 'bg-gray-100'
          }`} style={{
            transform: recordingState === 'recording' ? `scale(${1 + audioLevel / 500})` : 'scale(1)'
          }}>
            <Mic size={48} className={
              recordingState === 'recording' ? 'text-red-500' : 'text-gray-500'
            } />
          </div>
        </div>

        {recordingState !== 'idle' && (
          <div className="space-y-2">
            <div className="text-2xl font-mono text-gray-800">
              {formatTime(recordingTime)}
            </div>
            {recordingState === 'recording' && (
              <div className="space-y-2">
                <div className="text-red-500 font-semibold">🔴 Gravando</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-100"
                    style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                  />
                </div>
              </div>
            )}
            {recordingState === 'paused' && (
              <div className="text-yellow-500 font-semibold">⏸️ Pausado</div>
            )}
          </div>
        )}

        <div className="flex justify-center space-x-2">
          {recordingState === 'idle' && (
            <button
              onClick={startRecording}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Mic size={20} />
              <span>Iniciar Gravação</span>
            </button>
          )}
          
          {recordingState === 'recording' && (
            <>
              <button
                onClick={pauseRecording}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Pause size={20} />
                <span>Pausar</span>
              </button>
              <button
                onClick={stopRecording}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors"
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
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Play size={20} />
                <span>Continuar</span>
              </button>
              <button
                onClick={stopRecording}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Square size={20} />
                <span>Parar</span>
              </button>
            </>
          )}
        </div>

        {recordedAudioUrl && (
          <div className="space-y-4 border-t pt-4">
            <div className="text-lg font-semibold text-gray-800">
              Áudio Gravado
            </div>
            <audio
              ref={audioRef}
              src={recordedAudioUrl}
              onEnded={() => setIsPlaying(false)}
              style={{ display: 'none' }}
            />
            
            <div className="flex justify-center space-x-2">
              {!isPlaying ? (
                <button
                  onClick={playAudio}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Play size={20} />
                  <span>Reproduzir</span>
                </button>
              ) : (
                <button
                  onClick={pauseAudio}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Pause size={20} />
                  <span>Pausar</span>
                </button>
              )}
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={resetRecording}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <RotateCcw size={20} />
                <span>Gravar Novo</span>
              </button>
              <button
                onClick={saveAudio}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Salvar Áudio
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};