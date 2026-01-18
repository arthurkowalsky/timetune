import { useRef, useEffect } from 'react';
import { m } from 'motion/react';
import { useTranslations } from '../../i18n';
import { pulseBorder } from '../../motion';
import type { UnifiedPlayer } from '../../types/unified';

interface PlayerTabsProps {
  players: UnifiedPlayer[];
  currentPlayerId: string;
  myPlayerId: string | null;
  selectedPlayerId: string;
  targetScore: number;
  onSelectPlayer: (playerId: string) => void;
}

export function PlayerTabs({
  players,
  currentPlayerId,
  myPlayerId,
  selectedPlayerId,
  targetScore,
  onSelectPlayer,
}: PlayerTabsProps) {
  const { t } = useTranslations();
  const containerRef = useRef<HTMLDivElement>(null);

  const isLocalMode = myPlayerId === null;

  const sortedPlayers = isLocalMode
    ? players
    : [...players].sort((a, b) => {
        if (a.id === myPlayerId) return -1;
        if (b.id === myPlayerId) return 1;
        if (a.id === currentPlayerId) return -1;
        if (b.id === currentPlayerId) return 1;
        return 0;
      });

  useEffect(() => {
    if (containerRef.current) {
      const selectedTab = containerRef.current.querySelector(`[data-player-id="${selectedPlayerId}"]`);
      selectedTab?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedPlayerId]);

  const getTabClasses = (isSelected: boolean, isMe: boolean, isCurrentTurn: boolean) => {
    const base = 'flex flex-col items-start px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors shrink-0 min-w-[80px] border-2';

    if (isSelected) {
      if (isMe) {
        return `${base} bg-green-600 border-green-500 text-white shadow-md`;
      }
      if (isCurrentTurn) {
        return `${base} bg-primary border-primary text-white shadow-md`;
      }
      return `${base} bg-surface-light border-surface-light text-white`;
    }

    if (isMe) {
      return `${base} bg-transparent border-green-500/50 text-green-400 hover:border-green-500`;
    }
    if (isCurrentTurn) {
      return `${base} bg-transparent border-primary/70 text-primary`;
    }
    return `${base} bg-transparent border-surface-light/50 text-gray-400 hover:border-surface-light hover:text-gray-300`;
  };

  return (
    <div
      ref={containerRef}
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
    >
      {sortedPlayers.map((player) => {
        const isMe = !isLocalMode && player.id === myPlayerId;
        const isCurrentTurn = player.id === currentPlayerId;
        const isSelected = player.id === selectedPlayerId;
        const timelineScore = player.timeline.length;
        const bonusScore = player.bonusPoints;
        const shouldPulse = isCurrentTurn && !isSelected;

        return (
          <m.button
            key={player.id}
            data-player-id={player.id}
            onClick={() => onSelectPlayer(player.id)}
            className={getTabClasses(isSelected, isMe, isCurrentTurn)}
            animate={shouldPulse ? 'pulse' : undefined}
            variants={shouldPulse ? pulseBorder : undefined}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-1.5">
              {player.isConnected === false && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
              {isMe && <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />}
              <span className="font-semibold">
                {isMe ? t('lobby.you') : player.name}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs opacity-80">
              <span>{timelineScore}/{targetScore}</span>
              {bonusScore > 0 && (
                <span className="text-amber-400">+{bonusScore}</span>
              )}
            </div>
          </m.button>
        );
      })}
    </div>
  );
}
