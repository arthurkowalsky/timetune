import { useTranslations } from '../../i18n';

interface FloatingFullscreenButtonProps {
  isFullscreen: boolean;
  onToggle: () => void;
}

export function FloatingFullscreenButton({ isFullscreen, onToggle }: FloatingFullscreenButtonProps) {
  const { t } = useTranslations();

  return (
    <button
      onClick={onToggle}
      className="fixed top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white/60 hover:text-white transition-all"
      title={isFullscreen ? t('game.exitFullscreen') : t('game.fullscreen')}
    >
      {isFullscreen ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0v5m0-5h5m6 6l5 5m0 0v-5m0 5h-5M9 15l-5 5m0 0v-5m0 5h5m6-6l5-5m0 0v5m0-5h-5" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5" />
        </svg>
      )}
    </button>
  );
}
