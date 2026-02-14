import { useEffect, useRef, useState, startTransition, type ReactNode } from 'react';
import { useGameStore, useSettingsStore } from '../store';
import { useTranslations } from '../i18n';
import { GameContext } from './GameContext';
import type { UnifiedGameContext, UnifiedPlayer } from '../types/unified';

interface LocalGameProviderProps {
  children: ReactNode;
  onExit: () => void;
  onPlayAgain: () => void;
  showExitConfirm: boolean;
  setShowExitConfirm: (show: boolean) => void;
}

export function LocalGameProvider({ children, onExit, onPlayAgain, showExitConfirm, setShowExitConfirm }: LocalGameProviderProps) {
  const gameStore = useGameStore();
  const { turnTimeout, autoPlayOnDraw } = useSettingsStore();
  const { t } = useTranslations();
  const [turnStartedAt, setTurnStartedAt] = useState(() => Date.now());
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const turnStartedAtRef = useRef<number>(turnStartedAt);

  useEffect(() => {
    const now = Date.now();
    turnStartedAtRef.current = now;
    startTransition(() => {
      setTurnStartedAt(now);
      setBonusClaimed(false);
    });
  }, [gameStore.currentPlayerIndex]);

  const players: UnifiedPlayer[] = gameStore.players.map((p) => ({
    id: p.id,
    name: p.name,
    timeline: p.timeline,
    bonusPoints: p.bonusPoints,
  }));

  const currentPlayer = players[gameStore.currentPlayerIndex] || null;

  const handleClaimBonus = () => {
    gameStore.awardBonusPoint();
    setBonusClaimed(true);
  };

  const value: UnifiedGameContext = {
    phase: gameStore.phase,
    currentSong: gameStore.currentSong,
    players,
    currentPlayerIndex: gameStore.currentPlayerIndex,
    targetScore: gameStore.targetScore,
    lastGuessCorrect: gameStore.lastGuessCorrect,
    isMyTurn: true,
    myPlayerId: null,
    previewPosition: null,
    turnStartedAt,
    turnTimeout,
    autoPlayOnDraw,
    voiceVotingEnabled: false,
    votingState: null,
    musicPlaying: false,
    recordingDeadline: null,
    isOnline: false,
    bonusClaimed,
    currentPlayer,
    myPlayer: currentPlayer,
    drawCard: gameStore.drawCard,
    placeSong: gameStore.placeSong,
    claimBonus: handleClaimBonus,
    nextTurn: gameStore.nextTurn,
    skipTurn: gameStore.skipTurn,
    sendPositionPreview: () => {},
    notifyMusicStarted: () => {
      const now = Date.now();
      turnStartedAtRef.current = now;
      setTurnStartedAt(now);
    },
    submitRecording: () => {},
    skipRecording: () => {},
    submitVote: () => {},
    onExit,
    onPlayAgain,
    exitConfirmConfig: {
      title: t('game.exitConfirmTitle'),
      message: t('game.exitConfirmMessage'),
      confirmLabel: t('game.exit'),
      confirmVariant: 'danger',
    },
    showExitConfirm,
    setShowExitConfirm,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
