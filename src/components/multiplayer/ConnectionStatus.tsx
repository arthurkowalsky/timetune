import { useMultiplayerStore } from '../../multiplayer';
import { useTranslations } from '../../i18n';

export function ConnectionStatus() {
  const { isConnected, isConnecting, mode } = useMultiplayerStore();
  const { t } = useTranslations();

  if (mode !== 'online') return null;

  return (
    <div className="fixed top-2 right-2 z-50">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          isConnecting
            ? 'bg-yellow-500/20 text-yellow-400'
            : isConnected
            ? 'bg-green-500/20 text-green-400'
            : 'bg-red-500/20 text-red-400'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isConnecting
              ? 'bg-yellow-400 animate-pulse'
              : isConnected
              ? 'bg-green-400'
              : 'bg-red-400'
          }`}
        />
        {isConnecting
          ? t('connection.connecting')
          : isConnected
          ? t('connection.connected')
          : t('connection.disconnected')}
      </div>
    </div>
  );
}
