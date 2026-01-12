import { useState, useEffect, startTransition, useRef } from 'react';
import { useGame } from '../contexts';
import { Timeline } from './Timeline';
import { BottomActionBar } from './BottomActionBar';
import { MysteryCard } from './MysteryCard';
import { TurnTimer } from './TurnTimer';
import { GameHeader } from './shared/GameHeader';
import { PlayerTabs } from './shared/PlayerTabs';
import { ConfirmModal } from './shared/ConfirmModal';
import { useTranslations } from '../i18n';

export function GameScreen() {
  const game = useGame();
  const { t } = useTranslations();

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (game.phase !== 'placing') {
      startTransition(() => {
        setSelectedPosition(null);
        setIsMusicPlaying(false);
      });
    }
  }, [game.phase]);

  useEffect(() => {
    startTransition(() => {
      setSelectedPlayerId(null);
    });
  }, [game.currentPlayer?.id]);

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

  const handleSelectPlayer = (playerId: string) => {
    setSelectedPlayerId(playerId === game.currentPlayer?.id ? null : playerId);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !game.currentPlayer) return;

    const diff = touchStartX.current - e.changedTouches[0].clientX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      const currentSelectedId = selectedPlayerId ?? game.currentPlayer.id;
      const currentIndex = game.players.findIndex((p) => p.id === currentSelectedId);
      if (diff > 0 && currentIndex < game.players.length - 1) {
        setSelectedPlayerId(game.players[currentIndex + 1].id);
      } else if (diff < 0 && currentIndex > 0) {
        setSelectedPlayerId(game.players[currentIndex - 1].id);
      }
    }

    touchStartX.current = null;
  };

  if (!game.currentPlayer) return null;

  const effectiveSelectedId = selectedPlayerId ?? game.currentPlayer.id;
  const selectedPlayer = game.players.find((p) => p.id === effectiveSelectedId);
  const isPlacing = game.phase === 'placing' && !!game.currentSong;

  const isViewingMyTimeline = game.myPlayerId ? effectiveSelectedId === game.myPlayerId : effectiveSelectedId === game.currentPlayer.id;
  const isViewingCurrentTurn = effectiveSelectedId === game.currentPlayer.id;
  const canInteract = isViewingMyTimeline && game.isMyTurn && isPlacing && isMusicPlaying;

  const getTimelineLabel = () => {
    if (!selectedPlayer) return '';

    if (isViewingMyTimeline && game.isMyTurn) {
      if (!isPlacing) return t('game.yourTimeline');
      if (!isMusicPlaying) return t('game.listenFirst');
      if (selectedPosition !== null) return t('game.confirmSelection');
      return t('game.wherePlaceSong');
    }

    if (isViewingMyTimeline && !game.isMyTurn) {
      return `${t('game.yourTimeline')} (${selectedPlayer.timeline.length}/${game.targetScore})`;
    }

    if (isViewingCurrentTurn && isPlacing) {
      return `${t('game.timelineOf')} ${selectedPlayer.name} - ${t('online.isPlacing')}`;
    }

    return `${t('game.timelineOf')} ${selectedPlayer.name} (${selectedPlayer.timeline.length}/${game.targetScore})`;
  };

  return (
    <div className="min-h-screen bg-bg animate-fade-in">
      <TurnTimer
        turnStartedAt={game.turnStartedAt}
        timeoutSeconds={game.turnTimeout}
        isActive={game.isMyTurn && game.phase === 'placing' && isMusicPlaying}
      />
      <div className="sticky top-0 z-10 bg-bg pt-4 px-4 pb-2">
        <div className="max-w-2xl mx-auto">
          <GameHeader
            onReset={game.isOnline ? undefined : () => setShowExitConfirm(true)}
            onLeave={game.isOnline ? () => setShowExitConfirm(true) : undefined}
          />
        </div>
      </div>

      <div className="px-4 pb-24">
        <div className="max-w-2xl mx-auto">
          {isPlacing && game.isMyTurn && !isMusicPlaying && !game.autoPlayOnDraw && (
            <div className="animate-scale-bounce">
              <MysteryCard />
            </div>
          )}

          <div
            className="bg-surface rounded-xl overflow-hidden mb-4 animate-slide-in"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {game.players.length > 1 && (
              <div className="px-4 pt-4 pb-3 border-b border-surface-light/30">
                <PlayerTabs
                  players={game.players}
                  currentPlayerId={game.currentPlayer.id}
                  myPlayerId={game.myPlayerId}
                  selectedPlayerId={effectiveSelectedId}
                  targetScore={game.targetScore}
                  onSelectPlayer={handleSelectPlayer}
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="text-lg font-bold text-white mb-4">
                {getTimelineLabel()}
              </h3>
              {selectedPlayer && (
                selectedPlayer.timeline.length === 0 && !canInteract ? (
                  <p className="text-gray-500 text-center py-4">{t('game.noCards')}</p>
                ) : (
                  <Timeline
                    songs={selectedPlayer.timeline}
                    onSelectPosition={canInteract ? handleSelectPosition : undefined}
                    selectedPosition={canInteract ? selectedPosition : null}
                    isInteractive={canInteract}
                    previewPosition={isViewingCurrentTurn && !game.isMyTurn && isPlacing && game.isOnline ? game.previewPosition : undefined}
                  />
                )
              )}
            </div>
          </div>
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
          musicStartedByGuesser={game.musicPlaying}
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
