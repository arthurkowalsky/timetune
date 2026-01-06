import { useTranslations } from '../../i18n';

interface ModeSelectorProps {
  onSelectLocal: () => void;
  onSelectOnline: () => void;
}

export function ModeSelector({ onSelectLocal, onSelectOnline }: ModeSelectorProps) {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-2">
            🎵 {t('app.name').toUpperCase()}
          </h1>
          <p className="text-gray-400 text-lg">{t('app.subtitle')}</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onSelectLocal}
            className="w-full bg-surface hover:bg-surface-light rounded-xl p-6 text-left transition-colors group"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">📱</span>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                  {t('mode.local')}
                </h3>
                <p className="text-gray-400 text-sm">
                  {t('mode.localDescription')}
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={onSelectOnline}
            className="w-full bg-surface hover:bg-surface-light rounded-xl p-6 text-left transition-colors group"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">🌐</span>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                  {t('mode.online')}
                </h3>
                <p className="text-gray-400 text-sm">
                  {t('mode.onlineDescription')}
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p className="mb-2">📋 {t('start.rulesTitle')}</p>
          <p>{t('start.rulesDescription')}</p>
        </div>
      </div>
    </div>
  );
}
