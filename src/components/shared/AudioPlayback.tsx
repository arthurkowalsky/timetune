import { useState, useRef, useEffect, useMemo } from 'react';

interface AudioPlaybackProps {
  audioData: string;
  autoPlay?: boolean;
}

function generateBars(audioData: string, count: number): number[] {
  let hash = 0;
  for (let i = 0; i < Math.min(audioData.length, 100); i++) {
    hash = ((hash << 5) - hash) + audioData.charCodeAt(i);
  }
  return Array.from({ length: count }, (_, i) => {
    const seed = Math.abs((hash * (i + 1)) % 1000);
    return 20 + (seed % 60);
  });
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function AudioPlayback({ audioData, autoPlay = false }: AudioPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const bars = useMemo(() => generateBars(audioData, 32), [audioData]);

  useEffect(() => {
    const audio = new Audio(audioData);
    audioRef.current = audio;

    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };
    audio.ontimeupdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      }
    };

    if (autoPlay) {
      audio.play().catch(() => {});
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioData, autoPlay]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  return (
    <div className="w-full bg-surface-light/50 rounded-xl p-3">
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-primary hover:bg-primary-dark flex items-center justify-center shrink-0 transition-colors"
        >
          {isPlaying ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <div className="flex-1 flex items-end gap-0.5 h-10">
          {bars.map((height, i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm transition-colors ${
                (i / bars.length) * 100 <= progress ? 'bg-primary' : 'bg-surface'
              }`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>

        <span className="text-xs text-gray-400 font-mono shrink-0 w-10 text-right">
          {duration > 0 ? formatTime(currentTime) : '--:--'}
        </span>
      </div>
    </div>
  );
}
