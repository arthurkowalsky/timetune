import { useTranslations } from '../i18n';

export function MysteryCard() {
  const { t } = useTranslations();

  return (
    <div className="mb-4">
      <div className="relative bg-gradient-to-br from-primary via-purple-600 to-pink-500 rounded-2xl p-6 text-center overflow-hidden shadow-xl shadow-primary/30">
        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent animate-pulse" />

        <div className="absolute top-3 left-4 text-yellow-300 text-lg animate-pulse">✨</div>
        <div className="absolute top-3 right-4 text-yellow-300 text-lg animate-pulse" style={{ animationDelay: '0.5s' }}>✨</div>

        <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 mb-4">
          <span className="text-white font-bold text-sm tracking-wider">
            {t('game.newCard')}
          </span>
        </div>

        <div className="relative z-10 mb-4">
          <div className="flex items-center justify-center gap-3 text-5xl">
            <span className="animate-bounce" style={{ animationDelay: '0s' }}>🎵</span>
            <span className="text-6xl font-black text-white drop-shadow-lg">?</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🎵</span>
          </div>
        </div>

        <div className="relative z-10">
          <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">
            {t('game.drawnCard')}
          </h3>
          <p className="text-white/80 text-sm">
            {t('game.listenAndGuess')}
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-purple-900/30 to-transparent" />
      </div>
    </div>
  );
}
