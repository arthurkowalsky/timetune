import type { ErrorCode } from './types';

export const errorCodeToTranslationKey: Record<ErrorCode, string> = {
  ROOM_NOT_FOUND: 'error.roomNotFound',
  ROOM_FULL: 'error.roomFull',
  GAME_ALREADY_STARTED: 'error.gameAlreadyStarted',
  NOT_YOUR_TURN: 'error.notYourTurn',
  INVALID_ACTION: 'error.invalidAction',
  NOT_HOST: 'error.notHost',
  NOT_ENOUGH_PLAYERS: 'error.notEnoughPlayers',
  PLAYER_NAME_TAKEN: 'error.nameTaken',
  INVALID_ROOM_CODE: 'error.roomNotFound',
  PLAYERS_NOT_READY: 'error.playersNotReady',
  NO_SONGS_PROVIDED: 'error.noSongsProvided',
  KICKED: 'error.kicked',
  UNKNOWN_ERROR: 'error.disconnected',
};

export function getErrorTranslationKey(code: ErrorCode): string {
  return errorCodeToTranslationKey[code] || 'error.disconnected';
}
