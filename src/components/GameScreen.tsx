import { useState, useEffect, startTransition } from 'react';
import { useGame } from '../contexts';
import { Timeline } from './Timeline';
import { BottomActionBar } from './BottomActionBar';
import { MysteryCard } from './MysteryCard';
import { TurnTimer } from './TurnTimer';
import { TimelineViewerModal } from './shared/TimelineViewerModal';
import { GameHeader } from './shared/GameHeader';
import { OtherPlayers } from './shared/OtherPlayers';
import { ConfirmModal } from './shared/ConfirmModal';
import { useTranslations } from '../i18n';
import { useFullscreen } from '../hooks/useFullscreen';
import type { UnifiedPlayer } from '../types/unified';

export function GameScreen() {
  const game = useGame();
  const { t } = useTranslations();

  const [viewingPlayer, setViewingPlayer] = useState<UnifiedPlayer | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  useEffect(() => {
    if (game.phase !== 'placing') {
      startTransition(() => {
        setSelectedPosition(null);
        setIsMusicPlaying(false);
      });
    }
  }, [game.phase]);

  useEffect(() => {
    if (game.isOnline || !game.turnTimeout || game.phase === 'reveal' || game.phase === 'finished' || game.phase === 'setup') return;
    if (game.phase === 'placing' && !isMusicPlaying) return;

    const checkTimeout = () => {
      const elapsed = Math.floor((Date.now() - (game.turnStartedAt || Date.now())) / 1000);
      if (elapsed >= game.turnTimeout!) {
        game.skipTurn();
      }
    };

    const interval = setInterval(checkTimeout, 1000);
    return () => clearInterval(interval);
  }, [game, isMusicPlaying]);

  const handleSelectPosition = (position: number) => {
    if (!game.isMyTurn) return;
    const newPosition = selectedPosition === position ? null : position;
    setSelectedPosition(newPosition);
    game.sendPositionPreview(newPosition);
  };

  const handleConfirmPlacement = () => {
    if (selectedPosition !== null && game.isMyTurn) {
      game.placeSong(selectedPosition);
    }
  };

  const handleMusicStarted = () => {
    setIsMusicPlaying(true);
    game.notifyMusicStarted();
  };

  const handleViewTimeline = (player: UnifiedPlayer) => {
    setViewingPlayer(player);
  };

  if (!game.currentPlayer) return null;

  const displayedPlayer = game.isMyTurn ? game.currentPlayer : game.myPlayer;
  const isPlacing = game.phase === 'placing' && game.currentSong;
  const showInteractiveTimeline = !!(isPlacing && isMusicPlaying && game.isMyTurn);

  return (
    <div className="min-h-screen bg-bg">
      <TurnTimer
        turnStartedAt={game.turnStartedAt}
        timeoutSeconds={game.turnTimeout}
        isActive={game.isMyTurn && game.phase === 'placing' && isMusicPlaying}
      />
      <div className="sticky top-0 z-10 bg-bg pt-4 px-4 pb-2">
        <div className="max-w-2xl mx-auto">
          <GameHeader
            currentPlayer={game.currentPlayer}
            players={game.players}
            targetScore={game.targetScore}
            myPlayerId={game.myPlayerId}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            onReset={game.isOnline ? undefined : () => setShowExitConfirm(true)}
            onLeave={game.isOnline ? () => setShowExitConfirm(true) : undefined}
          />
        </div>
      </div>

      <div className="px-4 pb-24">
        <div className="max-w-2xl mx-auto">
          {isPlacing && game.isMyTurn && !isMusicPlaying && <MysteryCard />}

          {!game.isMyTurn && isPlacing && game.isOnline && (
            <div className="bg-amber-900/30 border-2 border-amber-500 rounded-xl p-4 mb-4 text-center">
              <p className="text-amber-300">
                {game.currentPlayer.name} {t('online.isPlacing')}
              </p>
            </div>
          )}

          <div className="bg-surface rounded-xl p-4 mb-4">
            <h3 className="text-lg font-bold text-white mb-4">
              {game.isMyTurn ? (
                isPlacing
                  ? (!isMusicPlaying
                      ? t('game.listenFirst')
                      : selectedPosition !== null
                        ? t('game.confirmSelection')
                        : `${t('game.wherePlaceSong')} 🤔`)
                  : `${t('game.yourTimeline')} (${displayedPlayer?.timeline.length || 0} / ${game.targetScore})`
              ) : game.isOnline ? (
                `${t('game.timelineOf')} ${game.currentPlayer.name}`
              ) : (
                `${t('game.yourTimeline')} (${game.currentPlayer.timeline.length} / ${game.targetScore})`
              )}
            </h3>
            <Timeline
              songs={game.isMyTurn ? (displayedPlayer?.timeline || []) : game.currentPlayer.timeline}
              onSelectPosition={showInteractiveTimeline ? handleSelectPosition : undefined}
              selectedPosition={selectedPosition}
              isInteractive={showInteractiveTimeline}
              previewPosition={!game.isMyTurn && isPlacing && game.isOnline ? game.previewPosition : null}
            />
          </div>

          {game.phase === 'playing' && (
            <OtherPlayers
              players={game.players}
              currentPlayerId={game.currentPlayer.id}
              myPlayerId={game.myPlayerId}
              onViewTimeline={handleViewTimeline}
            />
          )}
        </div>
      </div>

      {game.isMyTurn && (
        <BottomActionBar
          phase={isPlacing ? 'placing' : 'playing'}
          currentSong={game.currentSong}
          selectedPosition={selectedPosition}
          autoPlayEnabled={game.autoPlayOnDraw}
          onDrawCard={game.drawCard}
          onConfirmPlacement={handleConfirmPlacement}
          onMusicStarted={handleMusicStarted}
        />
      )}

      {!game.isMyTurn && isPlacing && game.isOnline && (
        <BottomActionBar
          phase="placing"
          currentSong={game.currentSong}
          selectedPosition={null}
          autoPlayEnabled={false}
          onDrawCard={() => {}}
          onConfirmPlacement={() => {}}
          onMusicStarted={() => {}}
          isSpectator
        />
      )}

      {!game.isMyTurn && game.phase === 'playing' && game.isOnline && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-surface-light p-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-400">
              {t('online.waitingFor')} <span className="text-primary font-bold">{game.currentPlayer.name}</span>
            </p>
          </div>
        </div>
      )}

      {viewingPlayer && (
        <TimelineViewerModal
          playerName={viewingPlayer.name}
          timeline={viewingPlayer.timeline}
          onClose={() => setViewingPlayer(null)}
        />
      )}

      {showExitConfirm && (
        <ConfirmModal
          title={game.exitConfirmConfig.title}
          message={game.exitConfirmConfig.message}
          confirmLabel={game.exitConfirmConfig.confirmLabel}
          cancelLabel={t('game.cancel')}
          onConfirm={() => {
            game.onExit();
            setShowExitConfirm(false);
          }}
          onCancel={() => setShowExitConfirm(false)}
          confirmVariant={game.exitConfirmConfig.confirmVariant}
        />
      )}
    </div>
  );
}
