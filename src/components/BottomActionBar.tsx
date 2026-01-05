import { useState, useEffect } from 'react';
import type { Song } from '../types';
import { useTranslations } from '../i18n';

interface BottomActionBarProps {
  phase: 'playing' | 'placing';
  currentSong: Song | null;
  selectedPosition: number | null;
  autoPlayEnabled: boolean;
  onDrawCard: () => void;
  onConfirmPlacement: () => void;
  onMusicStarted: () => void;
}

export function BottomActionBar({
  phase,
  currentSong,
  selectedPosition,
  autoPlayEnabled,
  onDrawCard,
  onConfirmPlacement,
  onMusicStarted,
}: BottomActionBarProps) {
  const { t } = useTranslations();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    if (phase === 'playing') {
      setIsPlaying(false);
      setShowIframe(false);
    }
  }, [phase]);

  const handlePlay = () => {
    setIsPlaying(true);
    setShowIframe(true);
    onMusicStarted();
  };

  useEffect(() => {
    if (phase === 'placing' && autoPlayEnabled && currentSong && !isPlaying) {
      handlePlay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, autoPlayEnabled, currentSong]);

  const embedUrl = currentSong
    ? `https://www.youtube.com/embed/${currentSong.youtubeId}?autoplay=1&controls=1&modestbranding=1&rel=0`
    : null;

  const renderContent = () => {
    if (phase === 'playing') {
      return (
        <button
          onClick={onDrawCard}
          className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700 text-white py-4 rounded-xl text-xl font-bold transition-all hover:scale-[1.02] animate-pulse min-h-[56px]"
        >
          🎵 {t('game.drawCard')}
        </button>
      );
    }

    if (selectedPosition !== null) {
      return (
        <button
          onClick={onConfirmPlacement}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl text-xl font-bold transition-all hover:scale-[1.02] min-h-[56px] shadow-lg shadow-green-500/30 animate-pulse"
        >
          ✓ {t('game.confirmButton')}
        </button>
      );
    }

    if (isPlaying) {
      return (
        <div className="flex items-center justify-center gap-3 py-3 min-h-[56px]">
          <MiniVisualizer />
          <span className="text-white font-medium">{t('player.playing')}</span>
        </div>
      );
    }

    return (
      <button
        onClick={handlePlay}
        className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700 text-white py-4 rounded-xl text-xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-3 min-h-[56px]"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
        {t('player.revealSong')}
      </button>
    );
  };

  return (
    <>
      {showIframe && embedUrl && (
        <div
          className="fixed"
          style={{ left: '-9999px', top: '-9999px' }}
          aria-hidden="true"
        >
          <iframe
            src={embedUrl}
            title="Audio player"
            width="200"
            height="200"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-bg via-bg to-transparent pt-6 pb-safe z-20">
        <div className="px-4 pb-4 max-w-2xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </>
  );
}

function MiniVisualizer() {
  const [bars, setBars] = useState<number[]>(() => Array(5).fill(0).map(() => 30 + Math.random() * 60));

  useEffect(() => {
    const interval = setInterval(() => {
      setBars(Array(5).fill(0).map(() => 25 + Math.random() * 75));
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-end gap-1 h-6">
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full transition-all duration-100"
          style={{
            height: `${height * 0.24}px`,
            background: 'linear-gradient(to top, #8b5cf6, #a855f7, #ec4899)',
            boxShadow: '0 0 6px rgba(139, 92, 246, 0.5)',
          }}
        />
      ))}
    </div>
  );
}
