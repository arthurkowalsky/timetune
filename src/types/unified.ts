import type { Song, GamePhase } from '../types';

export interface UnifiedPlayer {
  id: string;
  name: string;
  timeline: Song[];
  bonusPoints: number;
  isConnected?: boolean;
}

export interface ConfirmModalConfig {
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant: 'danger' | 'primary';
}

export interface UnifiedGameState {
  phase: GamePhase;
  currentSong: Song | null;
  players: UnifiedPlayer[];
  currentPlayerIndex: number;
  targetScore: number;
  lastGuessCorrect: boolean | null;
  isMyTurn: boolean;
  myPlayerId: string | null;
  previewPosition: number | null;
  turnStartedAt: number | null;
  turnTimeout: number | null;
  autoPlayOnDraw: boolean;
  isOnline: boolean;
}

export interface UnifiedGameActions {
  drawCard: () => void;
  placeSong: (position: number) => void;
  claimBonus: () => void;
  nextTurn: () => void;
  skipTurn: () => void;
  sendPositionPreview: (position: number | null) => void;
  notifyMusicStarted: () => void;
  onExit: () => void;
}

export interface UnifiedGameContext extends UnifiedGameState, UnifiedGameActions {
  currentPlayer: UnifiedPlayer | null;
  myPlayer: UnifiedPlayer | null;
  exitConfirmConfig: ConfirmModalConfig;
}
