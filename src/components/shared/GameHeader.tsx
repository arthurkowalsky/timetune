import { useTranslations } from '../../i18n';

interface PlayerInfo {
  id: string;
  name: string;
  timeline: { id: string }[];
  bonusPoints: number;
  isConnected?: boolean;
}

interface GameHeaderProps {
  currentPlayer: PlayerInfo;
  players: PlayerInfo[];
  targetScore: number;
  myPlayerId?: string | null;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onReset?: () => void;
  onLeave?: () => void;
}

export function GameHeader({
  currentPlayer,
  players,
  targetScore,
  myPlayerId,
  isFullscreen,
  onToggleFullscreen,
  onReset,
  onLeave,
}: GameHeaderProps) {
  const { t } = useTranslations();
  const isMyTurn = myPlayerId ? currentPlayer.id === myPlayerId : true;

  return (
    <div className="text-center">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onToggleFullscreen}
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
          title={isFullscreen ? t('game.exitFullscreen') : t('game.fullscreen')}
        >
          {isFullscreen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0v5m0-5h5m6 6l5 5m0 0v-5m0 5h-5M9 15l-5 5m0 0v-5m0 5h5m6-6l5-5m0 0v5m0-5h-5" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5" />
            </svg>
          )}
        </button>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          🎵 {t('app.name').toUpperCase()}
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
      <div className="flex items-center justify-center gap-4">
        <span className="text-gray-400">{t('game.turn')}</span>
        <span className={`text-xl font-bold ${myPlayerId && isMyTurn ? 'text-green-400' : 'text-primary'}`}>
          {currentPlayer.name} {myPlayerId && isMyTurn && `(${t('lobby.you')})`}
        </span>
      </div>
      <div className="mt-3 flex gap-2 justify-center flex-wrap">
        {players.map((player) => (
          <div
            key={player.id}
            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
              player.id === currentPlayer.id
                ? 'bg-primary text-white'
                : myPlayerId && player.id === myPlayerId
                  ? 'bg-green-600/30 text-green-400 border border-green-500/50'
                  : 'bg-surface-light text-gray-400'
            }`}
          >
            {player.isConnected === false && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
            <span>{player.name}: {player.timeline.length}/{targetScore}</span>
            {player.bonusPoints > 0 && (
              <span className="text-amber-400 ml-1">+{player.bonusPoints}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
