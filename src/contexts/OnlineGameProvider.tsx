import type { ReactNode } from 'react';
import { useMultiplayerStore, usePartySocket } from '../multiplayer';
import { useTranslations } from '../i18n';
import { GameContext } from './GameContext';
import type { UnifiedGameContext, UnifiedPlayer } from '../types/unified';
import { useTurnNotification } from '../hooks/useTurnNotification';
import { TurnNotificationBanner } from '../components/shared/TurnNotificationBanner';

interface OnlineGameProviderProps {
  children: ReactNode;
  onLeave: () => void;
  showExitConfirm: boolean;
  setShowExitConfirm: (show: boolean) => void;
}

export function OnlineGameProvider({ children, onLeave, showExitConfirm, setShowExitConfirm }: OnlineGameProviderProps) {
  const { roomState, myPlayerId } = useMultiplayerStore();
  const { send, disconnect } = usePartySocket();
  const { t } = useTranslations();

  const gameState = roomState?.gameState;
  const rawPlayers = gameState?.players || [];

  const players: UnifiedPlayer[] = rawPlayers.map((p) => ({
    id: p.id,
    name: p.name,
    timeline: p.timeline,
    bonusPoints: p.bonusPoints,
    isConnected: p.isConnected,
  }));

  const currentPlayerIndex = gameState?.currentPlayerIndex || 0;
  const currentPlayer = players[currentPlayerIndex] || null;
  const myPlayer = players.find((p) => p.id === myPlayerId) || null;
  const isMyTurn = currentPlayer?.id === myPlayerId;

  useTurnNotification({
    isMyTurn,
    isOnline: true,
    notificationTitle: 'TimeTune',
    notificationBody: t('notification.yourTurn'),
  });

  const handleExit = () => {
    disconnect();
    onLeave();
  };

  const value: UnifiedGameContext = {
    phase: gameState?.phase || 'playing',
    currentSong: gameState?.currentSong || null,
    players,
    currentPlayerIndex,
    targetScore: gameState?.targetScore || 10,
    lastGuessCorrect: gameState?.lastGuessCorrect ?? null,
    isMyTurn,
    myPlayerId,
    previewPosition: gameState?.previewPosition ?? null,
    turnStartedAt: gameState?.turnStartedAt ?? null,
    turnTimeout: gameState?.turnTimeout ?? null,
    autoPlayOnDraw: gameState?.autoPlayOnDraw ?? false,
    voiceVotingEnabled: gameState?.voiceVotingEnabled ?? false,
    votingState: gameState?.votingState ?? null,
    musicPlaying: gameState?.musicPlaying ?? false,
    recordingDeadline: roomState?.recordingDeadline ?? null,
    isOnline: true,
    bonusClaimed: gameState?.bonusClaimed ?? false,
    currentPlayer,
    myPlayer,
    drawCard: () => {
      if (isMyTurn) {
        send({ type: 'DRAW_CARD' });
      }
    },
    placeSong: (position: number) => {
      if (isMyTurn) {
        send({ type: 'PLACE_SONG', payload: { position } });
      }
    },
    claimBonus: () => {
      send({ type: 'CLAIM_BONUS' });
    },
    nextTurn: () => {
      send({ type: 'NEXT_TURN' });
    },
    skipTurn: () => {},
    sendPositionPreview: (position: number | null) => {
      if (isMyTurn) {
        send({ type: 'POSITION_PREVIEW', payload: { position } });
      }
    },
    notifyMusicStarted: () => {
      if (isMyTurn) {
        send({ type: 'MUSIC_STARTED' });
      }
    },
    submitRecording: (audioData: string) => {
      if (isMyTurn) {
        send({ type: 'SUBMIT_GUESS_RECORDING', payload: { audioData } });
      }
    },
    skipRecording: () => {
      if (isMyTurn) {
        send({ type: 'SKIP_RECORDING' });
      }
    },
    submitVote: (correct: boolean) => {
      send({ type: 'SUBMIT_VOTE', payload: { correct } });
    },
    onExit: handleExit,
    exitConfirmConfig: {
      title: t('game.exitConfirmTitle'),
      message: t('game.exitConfirmMessage'),
      confirmLabel: t('game.exit'),
      confirmVariant: 'danger',
    },
    showExitConfirm,
    setShowExitConfirm,
  };

  return (
    <GameContext.Provider value={value}>
      <TurnNotificationBanner isMyTurn={isMyTurn} isOnline={true} />
      {children}
    </GameContext.Provider>
  );
}
