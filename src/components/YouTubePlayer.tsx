import { useState, useEffect } from 'react';
import type { Song } from '../types';
import { useTranslations } from '../i18n';

interface YouTubePlayerProps {
  song: Song;
  showYear?: boolean;
}

export function YouTubePlayer({ song, showYear = false }: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { t } = useTranslations();

  const embedUrl = `https://www.youtube.com/embed/${song.youtubeId}?autoplay=1&controls=1&modestbranding=1&rel=0`;

  return (
    <div className="bg-surface rounded-2xl p-6 text-center">
      {showYear ? (
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-white mb-2">{song.title}</h3>
          <p className="text-lg text-gray-400">{song.artist}</p>
          <div className="mt-4 text-5xl font-black text-primary">{song.year}</div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="text-6xl mb-4">🎵</div>
          <p className="text-gray-400 text-lg">{t('player.listen')}</p>
        </div>
      )}
      {!isPlaying ? (
        <button
          onClick={() => setIsPlaying(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full text-xl font-bold transition-all hover:scale-105 flex items-center gap-3 mx-auto min-h-[56px]"
        >
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          {t('player.playSong')}
        </button>
      ) : (
        <div className="space-y-4">
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
          <AudioVisualizer />

          <p className="text-gray-400 text-sm">
            {t('player.listenCarefully')}
          </p>
        </div>
      )}
    </div>
  );
}

function AudioVisualizer() {
  const [bars, setBars] = useState<number[]>([30, 50, 40, 60, 35, 55, 45]);
  const { t } = useTranslations();

  useEffect(() => {
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => 20 + Math.random() * 50));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-2xl p-8 flex flex-col items-center">
      <div className="text-5xl mb-4">🎧</div>
      <div className="flex items-end gap-1 h-16">
        {bars.map((height, i) => (
          <div
            key={i}
            className="w-3 bg-gradient-to-t from-primary to-purple-500 rounded-full transition-all duration-150"
            style={{ height: `${height}px` }}
          />
        ))}
      </div>

      <p className="text-white mt-4 font-medium">{t('player.playing')}</p>
    </div>
  );
}
