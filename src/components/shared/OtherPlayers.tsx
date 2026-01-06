import { useTranslations } from '../../i18n';
import type { UnifiedPlayer } from '../../types/unified';

interface OtherPlayersProps {
  players: UnifiedPlayer[];
  currentPlayerId: string;
  myPlayerId: string | null;
  onViewTimeline: (player: UnifiedPlayer) => void;
}

export function OtherPlayers({
  players,
  currentPlayerId,
  myPlayerId,
  onViewTimeline,
}: OtherPlayersProps) {
  const { t } = useTranslations();

  const otherPlayers = players.filter((p) => p.id !== currentPlayerId);
  if (otherPlayers.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold text-white mb-3">{t('game.otherTeams')}</h3>
      <div className="grid gap-3">
        {otherPlayers.map((player) => (
          <button
            key={player.id}
            onClick={() => onViewTimeline(player)}
            className="bg-surface rounded-lg p-3 flex justify-between items-center hover:bg-surface-light transition-colors text-left w-full group"
          >
            <div className="flex items-center gap-2">
              {player.isConnected === false && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
              <span className="text-white">
                {player.name}
                {player.id === myPlayerId && (
                  <span className="text-gray-500 ml-1">({t('lobby.you')})</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">
                {player.timeline.length} {t('game.cards')}
              </span>
              <span className="text-gray-500 group-hover:text-primary transition-colors">
                👁
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
