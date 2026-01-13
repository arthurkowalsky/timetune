import { useMultiplayerStore, usePartySocket } from '../../multiplayer';
import { useTranslations } from '../../i18n';

export function DisconnectOverlay() {
  const { isConnected, isConnecting, connectionError, mode, roomState } = useMultiplayerStore();
  const { reconnect } = usePartySocket();
  const { t } = useTranslations();

  if (mode !== 'online' || !roomState) return null;
  if (isConnected || isConnecting) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl p-6 max-w-sm w-full text-center">
        <div className="text-6xl mb-4">🔌</div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {t('error.disconnected')}
        </h2>
        <p className="text-gray-400 mb-6">
          {connectionError ? t(connectionError) : t('error.disconnectedDescription')}
        </p>
        <div className="space-y-3">
          <button
            onClick={reconnect}
            className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold transition-colors"
          >
            {t('error.tryReconnect')}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-surface-light hover:bg-surface text-gray-400 hover:text-white py-3 rounded-xl font-bold transition-colors"
          >
            {t('error.refresh')}
          </button>
        </div>
      </div>
    </div>
  );
}
