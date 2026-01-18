import type { Song, GamePhase, SongCategory, SongEra } from '../types';

export type GameMode = 'local' | 'online';

export type RoomPhase = 'waiting' | 'starting' | 'playing' | 'finished';

export interface OnlinePlayer {
  id: string;
  name: string;
  timeline: Song[];
  bonusPoints: number;
  connectionId: string;
  isHost: boolean;
  isConnected: boolean;
  lastSeen: number;
  isReady: boolean;
}

export interface RoomState {
  roomId: string;
  roomCode: string;
  hostId: string;
  createdAt: number;
  maxPlayers: number;
  isPrivate: boolean;
  roomPhase: RoomPhase;
  gameState: OnlineGameState;
  version: number;
  lastUpdated: number;
  recordingDeadline: number | null;
}

export interface VotingState {
  audioData: string;
  deadline: number;
  votes: { yes: number; no: number };
  votedPlayerIds: string[];
  recordingPlayerId: string;
}

export interface OnlineGameState {
  players: OnlinePlayer[];
  currentPlayerIndex: number;
  deck: Song[];
  currentSong: Song | null;
  phase: GamePhase;
  lastGuessCorrect: boolean | null;
  targetScore: number;
  turnStartedAt: number | null;
  turnTimeout: number | null;
  previewPosition: number | null;
  autoPlayOnDraw: boolean;
  voiceVotingEnabled: boolean;
  votingState: VotingState | null;
  musicPlaying: boolean;
  songCategory: SongCategory;
  selectedEra: SongEra;
  bonusClaimed: boolean;
}

export interface CreateRoomMessage {
  type: 'CREATE_ROOM';
  payload: {
    playerName: string;
  };
}

export interface JoinRoomMessage {
  type: 'JOIN_ROOM';
  payload: {
    playerName: string;
  };
}

export interface LeaveRoomMessage {
  type: 'LEAVE_ROOM';
}

export interface KickPlayerMessage {
  type: 'KICK_PLAYER';
  payload: {
    playerId: string;
  };
}

export interface SetReadyMessage {
  type: 'SET_READY';
  payload: {
    isReady: boolean;
  };
}

export interface StartGameMessage {
  type: 'START_GAME';
}

export interface UpdateSettingsMessage {
  type: 'UPDATE_SETTINGS';
  payload: {
    targetScore?: number;
    maxPlayers?: number;
    deck?: Song[];
    turnTimeout?: number | null;
    autoPlayOnDraw?: boolean;
    voiceVotingEnabled?: boolean;
    songCategory?: SongCategory;
    selectedEra?: SongEra;
  };
}

export interface DrawCardMessage {
  type: 'DRAW_CARD';
}

export interface PlaceSongMessage {
  type: 'PLACE_SONG';
  payload: {
    position: number;
  };
}

export interface ClaimBonusMessage {
  type: 'CLAIM_BONUS';
}

export interface NextTurnMessage {
  type: 'NEXT_TURN';
}

export interface HeartbeatMessage {
  type: 'HEARTBEAT';
}

export interface RequestSyncMessage {
  type: 'REQUEST_SYNC';
  payload: {
    clientVersion: number;
  };
}

export interface ReconnectMessage {
  type: 'RECONNECT';
  payload: {
    playerId: string;
  };
}

export interface PositionPreviewMessage {
  type: 'POSITION_PREVIEW';
  payload: {
    position: number | null;
  };
}

export interface MusicStartedMessage {
  type: 'MUSIC_STARTED';
}

export interface SubmitGuessRecordingMessage {
  type: 'SUBMIT_GUESS_RECORDING';
  payload: {
    audioData: string;
  };
}

export interface SkipRecordingMessage {
  type: 'SKIP_RECORDING';
}

export interface SubmitVoteMessage {
  type: 'SUBMIT_VOTE';
  payload: {
    correct: boolean;
  };
}

export type ClientMessage =
  | CreateRoomMessage
  | JoinRoomMessage
  | LeaveRoomMessage
  | KickPlayerMessage
  | SetReadyMessage
  | StartGameMessage
  | UpdateSettingsMessage
  | DrawCardMessage
  | PlaceSongMessage
  | ClaimBonusMessage
  | NextTurnMessage
  | HeartbeatMessage
  | RequestSyncMessage
  | ReconnectMessage
  | PositionPreviewMessage
  | MusicStartedMessage
  | SubmitGuessRecordingMessage
  | SkipRecordingMessage
  | SubmitVoteMessage;

export interface RoomCreatedEvent {
  type: 'ROOM_CREATED';
  payload: {
    roomCode: string;
    playerId: string;
    roomState: RoomState;
  };
}

export interface RoomJoinedEvent {
  type: 'ROOM_JOINED';
  payload: {
    playerId: string;
    roomState: RoomState;
  };
}

export interface PlayerJoinedEvent {
  type: 'PLAYER_JOINED';
  payload: {
    player: OnlinePlayer;
  };
}

export interface PlayerLeftEvent {
  type: 'PLAYER_LEFT';
  payload: {
    playerId: string;
    reason: 'left' | 'kicked' | 'timeout';
  };
}

export interface PlayerReadyChangedEvent {
  type: 'PLAYER_READY_CHANGED';
  payload: {
    playerId: string;
    isReady: boolean;
  };
}

export interface SettingsUpdatedEvent {
  type: 'SETTINGS_UPDATED';
  payload: {
    targetScore: number;
    maxPlayers: number;
    turnTimeout: number | null;
    autoPlayOnDraw: boolean;
    voiceVotingEnabled: boolean;
    songCategory: SongCategory;
    selectedEra: SongEra;
  };
}

export interface GameStartedEvent {
  type: 'GAME_STARTED';
  payload: {
    gameState: OnlineGameState;
  };
}

export interface CardDrawnEvent {
  type: 'CARD_DRAWN';
  payload: {
    playerId: string;
    song: Song;
  };
}

export interface SongPlacedEvent {
  type: 'SONG_PLACED';
  payload: {
    playerId: string;
    position: number;
    isCorrect: boolean;
    song: Song;
    updatedTimeline: Song[];
  };
}

export interface BonusClaimedEvent {
  type: 'BONUS_CLAIMED';
  payload: {
    playerId: string;
    newBonusPoints: number;
  };
}

export interface TurnChangedEvent {
  type: 'TURN_CHANGED';
  payload: {
    currentPlayerIndex: number;
    phase: GamePhase;
    turnStartedAt: number;
  };
}

export interface GameFinishedEvent {
  type: 'GAME_FINISHED';
  payload: {
    winnerId: string;
    finalStandings: Array<{
      playerId: string;
      playerName: string;
      score: number;
      timelineLength: number;
      bonusPoints: number;
    }>;
  };
}

export interface StateSyncEvent {
  type: 'STATE_SYNC';
  payload: {
    roomState: RoomState;
  };
}

export interface ErrorEvent {
  type: 'ERROR';
  payload: {
    code: ErrorCode;
  };
}

export interface PlayerReconnectedEvent {
  type: 'PLAYER_RECONNECTED';
  payload: {
    playerId: string;
  };
}

export interface PlayerDisconnectedEvent {
  type: 'PLAYER_DISCONNECTED';
  payload: {
    playerId: string;
  };
}

export interface HostChangedEvent {
  type: 'HOST_CHANGED';
  payload: {
    newHostId: string;
    newHostPlayerId: string;
  };
}

export interface TurnSkippedEvent {
  type: 'TURN_SKIPPED';
  payload: {
    skippedPlayerId: string;
    reason: 'timeout' | 'disconnected';
    newCurrentPlayerIndex: number;
    turnStartedAt: number | null;
  };
}

export interface TurnTimerStartedEvent {
  type: 'TURN_TIMER_STARTED';
  payload: {
    turnStartedAt: number;
  };
}

export interface PositionPreviewEvent {
  type: 'POSITION_PREVIEW';
  payload: {
    playerId: string;
    position: number | null;
  };
}

export interface RecordingPhaseStartedEvent {
  type: 'RECORDING_PHASE_STARTED';
  payload: {
    playerId: string;
    playerName: string;
    deadline: number;
  };
}

export interface GuessRecordingEvent {
  type: 'GUESS_RECORDING';
  payload: {
    playerId: string;
    playerName: string;
    audioData: string;
    votingDeadline: number;
  };
}

export interface VoteUpdateEvent {
  type: 'VOTE_UPDATE';
  payload: {
    yesCount: number;
    noCount: number;
    totalVoters: number;
  };
}

export interface VotingResultEvent {
  type: 'VOTING_RESULT';
  payload: {
    playerId: string;
    bonusAwarded: boolean;
    finalVotes: { yes: number; no: number };
    reason: 'majority_yes' | 'majority_no' | 'tie_favor_player' | 'timeout' | 'skipped';
  };
}

export type ServerMessage =
  | RoomCreatedEvent
  | RoomJoinedEvent
  | PlayerJoinedEvent
  | PlayerLeftEvent
  | PlayerReadyChangedEvent
  | SettingsUpdatedEvent
  | GameStartedEvent
  | CardDrawnEvent
  | SongPlacedEvent
  | BonusClaimedEvent
  | TurnChangedEvent
  | GameFinishedEvent
  | StateSyncEvent
  | ErrorEvent
  | PlayerReconnectedEvent
  | PlayerDisconnectedEvent
  | HostChangedEvent
  | TurnSkippedEvent
  | TurnTimerStartedEvent
  | PositionPreviewEvent
  | RecordingPhaseStartedEvent
  | GuessRecordingEvent
  | VoteUpdateEvent
  | VotingResultEvent;

export type ErrorCode =
  | 'ROOM_NOT_FOUND'
  | 'ROOM_FULL'
  | 'GAME_ALREADY_STARTED'
  | 'NOT_YOUR_TURN'
  | 'INVALID_ACTION'
  | 'NOT_HOST'
  | 'NOT_ENOUGH_PLAYERS'
  | 'PLAYER_NAME_TAKEN'
  | 'INVALID_ROOM_CODE'
  | 'PLAYERS_NOT_READY'
  | 'NO_SONGS_PROVIDED'
  | 'KICKED'
  | 'UNKNOWN_ERROR';

export interface MultiplayerState {
  mode: GameMode;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  roomCode: string | null;
  roomState: RoomState | null;
  myPlayerId: string | null;
  isHost: boolean;
}

export const initialMultiplayerState: MultiplayerState = {
  mode: 'local',
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  roomCode: null,
  roomState: null,
  myPlayerId: null,
  isHost: false,
};
