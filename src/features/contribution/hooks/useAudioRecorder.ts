import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { RecordingState } from '../types';
import { bufferToWave, getCleanAudioRange } from '../utils/audioUtils';

interface AudioRecorderState {
  recordingState: RecordingState;
  audioBlob: Blob | null;
  audioUrl: string | null;
  duration: number;
  error: string | null;
  waveformData: number[];
}

interface AudioRecorderActions {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
  requestPermission: () => Promise<boolean>;
}

const MAX_RECORDING_DURATION = 50000; // 50 seconds max

export function useAudioRecorder(): AudioRecorderState & AudioRecorderActions {
  const { t } = useTranslation();
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const updateWaveform = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Sample 20 points from the frequency data
    const samples = 20;
    const step = Math.floor(dataArray.length / samples);
    const waveform: number[] = [];

    for (let i = 0; i < samples; i++) {
      const value = dataArray[i * step] || 0;
      waveform.push(value / 255); // Normalize to 0-1
    }

    setWaveformData(waveform);
    animationFrameRef.current = requestAnimationFrame(updateWaveform);
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      setRecordingState('requesting');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100, // Higher sample rate for better quality
          channelCount: 1, // Mono
        },
      });

      streamRef.current = stream;
      setRecordingState('idle');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Microphone access denied';
      setError(message);
      setRecordingState('idle');
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!streamRef.current) {
      const permitted = await requestPermission();
      if (!permitted) return;
    }

    try {
      setError(null);
      audioChunksRef.current = [];

      // Set up audio context for waveform visualization and WAV conversion
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(streamRef.current!);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Determine supported MIME type (for the interim chunks)
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : 'audio/webm';

      const mediaRecorder = new MediaRecorder(streamRef.current!, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const tempBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        try {
          // Convert to WAV using AudioContext
          const arrayBuffer = await tempBlob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Detect clean audio range
          const range = getCleanAudioRange(audioBuffer);
          
          if (!range) {
             setError(t('contribution.chat.silentError'));
             setRecordingState('idle');
             setAudioBlob(null);
             setAudioUrl(null);
             return;
          }

          const wavBlob = bufferToWave(audioBuffer, range.start, range.length);
          
          setAudioBlob(wavBlob);
          setAudioUrl(URL.createObjectURL(wavBlob));
        } catch (e) {
          console.error('WAV conversion failed, falling back to original format', e);
          setAudioBlob(tempBlob);
          setAudioUrl(URL.createObjectURL(tempBlob));
        }

        // Stop waveform animation
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        setWaveformData([]);
        
        // Close audio context
        if (audioContext.state !== 'closed') {
          audioContext.close();
        }
      };

      mediaRecorder.onerror = () => {
        setError('Recording error occurred');
        setRecordingState('idle');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms
      setRecordingState('recording');
      startTimeRef.current = Date.now();

      // Start waveform visualization
      animationFrameRef.current = requestAnimationFrame(updateWaveform);

      // Start duration timer
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDuration(elapsed);

        // Auto-stop at max duration
        if (elapsed >= MAX_RECORDING_DURATION) {
          stopRecording();
        }
      }, 100);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start recording';
      setError(message);
      setRecordingState('idle');
    }
  }, [requestPermission, updateWaveform]);

  const stopRecording = useCallback(() => {
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Stop waveform animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop analyser
    if (analyserRef.current) {
      analyserRef.current = null;
    }

    setRecordingState('stopped');
  }, []);

  const resetRecording = useCallback(() => {
    stopRecording();

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setWaveformData([]);
    setError(null);
    setRecordingState('idle');
  }, [audioUrl, stopRecording]);

  return {
    // State
    recordingState,
    audioBlob,
    audioUrl,
    duration,
    error,
    waveformData,
    // Actions
    startRecording,
    stopRecording,
    resetRecording,
    requestPermission,
  };
}

// Helper to format duration
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);

  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${tenths}`;
  }
  return `${remainingSeconds}.${tenths}s`;
}
