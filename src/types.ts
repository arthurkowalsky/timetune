export type Origin =
  | 'PL'
  | 'INT'
  | 'US' | 'UK' | 'CA' | 'AU' | 'IE'
  | 'DE' | 'FR' | 'IT' | 'ES' | 'SE' | 'NO' | 'FI' | 'DK' | 'NL' | 'BE' | 'AT'
  | 'JP' | 'KR' | 'CO' | 'PR' | 'JM' | 'CU' | 'BB'
  | (string & {});

export type Genre =
  | 'pop'
  | 'rock'
  | 'hip-hop'
  | 'disco-polo'
  | 'folk'
  | 'jazz'
  | 'electronic'
  | 'metal'
  | 'r&b'
  | 'alternative';

export type SongCategory = 'all' | 'polish' | 'international';

export type SongEra = 'all' | 'oldSchool' | 'newSchool';

export const ERA_CONFIG: Record<SongEra, { minYear?: number; maxYear?: number }> = {
  all: {},
  oldSchool: { maxYear: 1989 },
  newSchool: { minYear: 1990 },
};

export interface Song {
  id: string;
  title: string;
  artist: string;
  year: number;
  youtubeId: string;
  origin: Origin;
  genres: Genre[];
}

export interface GameFilter {
  origins?: Origin[];
  genres?: Genre[];
  yearRange?: {
    min?: number;
    max?: number;
  };
}

export interface Player {
  id: string;
  name: string;
  timeline: Song[];
  bonusPoints: number;
}

export type GamePhase = 'setup' | 'playing' | 'placing' | 'recording' | 'reveal' | 'finished';

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  deck: Song[];
  currentSong: Song | null;
  phase: GamePhase;
  lastGuessCorrect: boolean | null;
  targetScore: number;
  songCategory: SongCategory;
  selectedEra: SongEra;
}

export interface GameActions {
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  startGame: () => void;
  setTargetScore: (score: number) => void;
  setSongCategory: (category: SongCategory) => void;
  setSelectedEra: (era: SongEra) => void;
  drawCard: () => void;
  placeSong: (position: number) => void;
  awardBonusPoint: () => void;
  nextTurn: () => void;
  skipTurn: () => void;
  resetGame: () => void;
  restartGame: () => void;
}

export interface GameSettings {
  autoPlayOnDraw: boolean;
  turnTimeout: number | null;
  voiceVotingEnabled: boolean;
}

export interface SettingsActions {
  setAutoPlayOnDraw: (value: boolean) => void;
  setTurnTimeout: (value: number | null) => void;
  setVoiceVotingEnabled: (value: boolean) => void;
}
