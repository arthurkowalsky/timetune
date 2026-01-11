import { useTranslations } from '../../i18n';

interface GameHeaderProps {
  onReset?: () => void;
  onLeave?: () => void;
}

export function GameHeader({ onReset, onLeave }: GameHeaderProps) {
  const { t } = useTranslations();

  return (
    <div className="flex items-center justify-between">
      <div className="w-10" />
      <h1 className="text-2xl sm:text-3xl font-black text-white">
        {t('app.name').toUpperCase()}
      </h1>
      {(onReset || onLeave) ? (
        <button
          onClick={onReset ?? onLeave}
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
          title={t('game.exit')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      ) : (
        <div className="w-10" />
      )}
    </div>
  );
}
