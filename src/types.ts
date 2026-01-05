export interface Song {
  id: string;
  title: string;
  artist: string;
  year: number;
  youtubeId: string;
}

export interface Player {
  id: string;
  name: string;
  timeline: Song[];
  bonusPoints: number;
}

export type GamePhase = 'setup' | 'playing' | 'placing' | 'reveal' | 'finished';

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  deck: Song[];
  currentSong: Song | null;
  phase: GamePhase;
  lastGuessCorrect: boolean | null;
  targetScore: number;
}

export interface GameActions {
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  startGame: () => void;
  setTargetScore: (score: number) => void;
  drawCard: () => void;
  placeSong: (position: number) => void;
  awardBonusPoint: () => void;
  nextTurn: () => void;
  resetGame: () => void;
}

export interface GameSettings {
  autoPlayOnDraw: boolean;
}

export interface SettingsActions {
  setAutoPlayOnDraw: (value: boolean) => void;
}
