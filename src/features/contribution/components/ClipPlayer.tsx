import { useState, useRef } from 'react';
import { Play, Pause, Volume2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ClipPlayerProps {
  audioUrl: string;
  duration?: number;
  onError?: () => void;
}

export function ClipPlayer({ audioUrl, duration: propDuration, onError }: ClipPlayerProps) {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(propDuration || 0);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          setError(t('contribution.chat.playError'));
          onError?.();
        });
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleError = () => {
    setError(t('contribution.chat.audioError'));
    onError?.();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={handleError}
        preload="metadata"
      />

      {error ? (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-none">
          <button
            type="button"
            onClick={handlePlay}
            className="h-10 w-10 flex items-center justify-center rounded-none bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex-shrink-0"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current ml-0.5" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            {/* Progress bar */}
            <div className="h-1.5 bg-muted rounded-none overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Time */}
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-muted-foreground">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <Volume2 className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
