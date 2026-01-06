import { useTranslations } from '../../i18n';

interface OnlineMenuProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onBack: () => void;
}

export function OnlineMenu({ onCreateRoom, onJoinRoom, onBack }: OnlineMenuProps) {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            🌐 {t('online.title')}
          </h1>
          <p className="text-gray-400">{t('online.subtitle')}</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onCreateRoom}
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700 text-white rounded-xl p-5 text-left transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">➕</span>
              <div>
                <h3 className="text-xl font-bold">{t('online.createRoom')}</h3>
                <p className="text-white/70 text-sm">{t('online.createRoomDescription')}</p>
              </div>
            </div>
          </button>

          <button
            onClick={onJoinRoom}
            className="w-full bg-surface hover:bg-surface-light text-white rounded-xl p-5 text-left transition-colors group"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">🔗</span>
              <div>
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                  {t('online.joinRoom')}
                </h3>
                <p className="text-gray-400 text-sm">{t('online.joinRoomDescription')}</p>
              </div>
            </div>
          </button>
        </div>

        <button
          onClick={onBack}
          className="w-full mt-6 bg-surface-light hover:bg-surface text-gray-400 hover:text-white py-3 rounded-xl font-bold transition-colors"
        >
          ← {t('common.back')}
        </button>
      </div>
    </div>
  );
}
