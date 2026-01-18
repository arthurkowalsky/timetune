import { useState, useEffect, useRef, useCallback } from 'react';
import { m } from 'motion/react';
import type { Song } from '../types';
import { useTranslations } from '../i18n';
import { useMotionPreference } from '../motion';

interface BottomActionBarProps {
  phase: 'playing' | 'placing';
  currentSong: Song | null;
  selectedPosition: number | null;
  autoPlayEnabled: boolean;
  onDrawCard: () => void;
  onConfirmPlacement: () => void;
  onMusicStarted: () => void;
  isSpectator?: boolean;
  musicStartedByGuesser?: boolean;
}

export function BottomActionBar({
  phase,
  currentSong,
  selectedPosition,
  autoPlayEnabled,
  onDrawCard,
  onConfirmPlacement,
  onMusicStarted,
  isSpectator = false,
  musicStartedByGuesser = false,
}: BottomActionBarProps) {
  const { t } = useTranslations();
  const { shouldReduceMotion } = useMotionPreference();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const prevPhaseRef = useRef(phase);

  /* eslint-disable-next-line */
  if (phase === 'playing' && prevPhaseRef.current !== 'playing') {
    setIsPlaying(false);
    setShowIframe(false);
  }
  /* eslint-disable-next-line */
  prevPhaseRef.current = phase;

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    setShowIframe(true);
    onMusicStarted();
  }, [onMusicStarted]);

  useEffect(() => {
    if (phase === 'placing' && autoPlayEnabled && currentSong && !isPlaying) {
      const timer = setTimeout(() => {
        handlePlay();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [phase, autoPlayEnabled, currentSong, isPlaying, handlePlay]);

  useEffect(() => {
    if (isSpectator && musicStartedByGuesser && currentSong && !isPlaying) {
      handlePlay();
    }
  }, [isSpectator, musicStartedByGuesser, currentSong, isPlaying, handlePlay]);

  const embedUrl = currentSong
    ? `https://www.youtube.com/embed/${currentSong.youtubeId}?autoplay=1&controls=1&modestbranding=1&rel=0`
    : null;

  const renderContent = () => {
    if (phase === 'playing') {
      return (
        <m.button
          onClick={onDrawCard}
          className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700 text-white py-4 rounded-xl text-xl font-bold transition-all hover:scale-[1.02] min-h-[56px]"
          animate={shouldReduceMotion ? {} : { opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          🎵 {t('game.drawCard')}
        </m.button>
      );
    }

    if (isSpectator) {
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
          className="w-full bg-surface-light hover:bg-surface text-white py-4 rounded-xl text-xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-3 min-h-[56px]"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          {t('player.listenToo')}
        </button>
      );
    }

    if (selectedPosition !== null) {
      return (
        <m.button
          onClick={onConfirmPlacement}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl text-xl font-bold transition-all hover:scale-[1.02] min-h-[56px] shadow-lg shadow-green-500/30"
          animate={shouldReduceMotion ? {} : { opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          ✓ {t('game.confirmButton')}
        </m.button>
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
