import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  MultiplayerState,
  GameMode,
  RoomState,
  ServerMessage,
  OnlinePlayer,
} from './types';
import { initialMultiplayerState } from './types';

interface MultiplayerActions {
  setMode: (mode: GameMode) => void;
  setConnected: (isConnected: boolean) => void;
  setConnecting: (isConnecting: boolean) => void;
  setConnectionError: (error: string | null) => void;
  setRoomCode: (code: string | null) => void;
  setRoomState: (state: RoomState | null) => void;
  setMyPlayerId: (id: string | null) => void;
  setIsHost: (isHost: boolean) => void;
  handleServerMessage: (message: ServerMessage) => void;
  reset: () => void;
  updatePlayerReady: (playerId: string, isReady: boolean) => void;
  removePlayer: (playerId: string) => void;
  addPlayer: (player: OnlinePlayer) => void;
  updateSettings: (targetScore: number, maxPlayers: number) => void;
  updateGameState: (updates: Partial<RoomState['gameState']>) => void;
}

type MultiplayerStore = MultiplayerState & MultiplayerActions;

export const useMultiplayerStore = create<MultiplayerStore>()(
  persist(
    (set, get) => ({
      ...initialMultiplayerState,

      setMode: (mode) => set({ mode }),
      setConnected: (isConnected) => set({ isConnected }),
      setConnecting: (isConnecting) => set({ isConnecting }),
      setConnectionError: (connectionError) => set({ connectionError }),
      setRoomCode: (roomCode) => set({ roomCode }),
      setRoomState: (roomState) => set({ roomState }),
      setMyPlayerId: (myPlayerId) => set({ myPlayerId }),
      setIsHost: (isHost) => set({ isHost }),

      handleServerMessage: (message) => {
        const state = get();

        switch (message.type) {
          case 'ROOM_CREATED':
            set({
              roomCode: message.payload.roomCode,
              roomState: message.payload.roomState,
              myPlayerId: message.payload.playerId,
              isHost: true,
            });
            break;

          case 'ROOM_JOINED':
            set({
              roomState: message.payload.roomState,
              myPlayerId: message.payload.playerId,
              roomCode: message.payload.roomState.roomCode,
              isHost: message.payload.roomState.gameState.players.find(
                (p) => p.id === message.payload.playerId
              )?.isHost ?? false,
            });
            break;

          case 'PLAYER_JOINED':
            if (state.roomState) {
              set({
                roomState: {
                  ...state.roomState,
                  gameState: {
                    ...state.roomState.gameState,
                    players: [
                      ...state.roomState.gameState.players,
                      message.payload.player,
                    ],
                  },
                },
              });
            }
            break;

          case 'PLAYER_LEFT':
            if (state.roomState) {
              set({
                roomState: {
                  ...state.roomState,
                  gameState: {
                    ...state.roomState.gameState,
                    players: state.roomState.gameState.players.filter(
                      (p) => p.id !== message.payload.playerId
                    ),
                  },
                },
              });
            }
            break;

          case 'PLAYER_READY_CHANGED':
            if (state.roomState) {
              set({
                roomState: {
                  ...state.roomState,
                  gameState: {
                    ...state.roomState.gameState,
                    players: state.roomState.gameState.players.map((p) =>
                      p.id === message.payload.playerId
                        ? { ...p, isReady: message.payload.isReady }
                        : p
                    ),
                  },
                },
              });
            }
            break;

          case 'SETTINGS_UPDATED':
            if (state.roomState) {
              set({
                roomState: {
                  ...state.roomState,
                  maxPlayers: message.payload.maxPlayers,
                  gameState: {
                    ...state.roomState.gameState,
                    targetScore: message.payload.targetScore,
                    turnTimeout: message.payload.turnTimeout,
                    autoPlayOnDraw: message.payload.autoPlayOnDraw,
                    voiceVotingEnabled: message.payload.voiceVotingEnabled,
                  },
                },
              });
            }
            break;

          case 'GAME_STARTED':
            if (state.roomState) {
              set({
                roomState: {
                  ...state.roomState,
                  roomPhase: 'playing',
                  gameState: message.payload.gameState,
                },
              });
            }
            break;

          case 'CARD_DRAWN':
            if (state.roomState) {
              set({
                roomState: {
                  ...state.roomState,
                  recordingDeadline: null,
                  gameState: {
                    ...state.roomState.gameState,
                    currentSong: message.payload.song,
                    phase: 'placing',
                    previewPosition: null,
                    musicPlaying: false,
                  },
                },
              });
            }
            break;

          case 'SONG_PLACED':
            if (state.roomState) {
              const updatedPlayers = state.roomState.gameState.players.map((p) =>
                p.id === message.payload.playerId
                  ? { ...p, timeline: message.payload.updatedTimeline }
                  : p
              );
              set({
                roomState: {
                  ...state.roomState,
                  gameState: {
                    ...state.roomState.gameState,
                    players: updatedPlayers,
                    lastGuessCorrect: message.payload.isCorrect,
                    phase: 'reveal',
                    previewPosition: null,
                  },
                },
              });
            }
            break;

          case 'BONUS_CLAIMED':
            if (state.roomState) {
              const updatedPlayers = state.roomState.gameState.players.map((p) =>
                p.id === message.payload.playerId
                  ? { ...p, bonusPoints: message.payload.newBonusPoints }
                  : p
              );
              set({
                roomState: {
                  ...state.roomState,
                  gameState: {
                    ...state.roomState.gameState,
                    players: updatedPlayers,
                  },
                },
              });
            }
            break;

          case 'TURN_CHANGED':
            if (state.roomState) {
              set({
                roomState: {
                  ...state.roomState,
                  recordingDeadline: null,
                  gameState: {
                    ...state.roomState.gameState,
                    currentPlayerIndex: message.payload.currentPlayerIndex,
                    phase: message.payload.phase,
                    currentSong: null,
                    lastGuessCorrect: null,
                    turnStartedAt: message.payload.turnStartedAt,
                    previewPosition: null,
                    musicPlaying: false,
                  },
                },
              });
            }
            break;

          case 'TURN_SKIPPED':
            if (state.roomState) {
              set({
                roomState: {
                  ...state.roomState,
                  gameState: {
                    ...state.roomState.gameState,
                    currentPlayerIndex: message.payload.newCurrentPlayerIndex,
                    phase: 'playing',
                    currentSong: null,
                    lastGuessCorrect: null,
                    turnStartedAt: message.payload.turnStartedAt,
                    previewPosition: null,
                  },
                },
              });
            }
            break;

          case 'GAME_FINISHED':
            if (state.roomState) {
              set({
                roomState: {
                  ...state.roomState,
                  roomPhase: 'finished',
                  gameState: {
                    ...state.roomState.gameState,
                    phase: 'finished',
                  },
                },
              });
            }
            break;

          case 'STATE_SYNC':
            set({
              roomState: message.payload.roomState,
              roomCode: message.payload.roomState.roomCode,
            });
            break;

          case 'HOST_CHANGED':
            if (state.roomState) {
              const updatedPlayers = state.roomState.gameState.players.map((p) => ({
                ...p,
                isHost: p.id === message.payload.newHostPlayerId,
              }));
              set({
                roomState: {
                  ...state.roomState,
                  hostId: message.payload.newHostId,
                  gameState: {
                    ...state.roomState.gameState,
                    players: updatedPlayers,
                  },
                },
                isHost: state.myPlayerId === message.payload.newHostPlayerId,
              });
            }
            break;

          case 'PLAYER_DISCONNECTED':
            if (state.roomState) {
              const updatedPlayers = state.roomState.gameState.players.map((p) =>
                p.id === message.payload.playerId
                  ? { ...p, isConnected: false }
                  : p
              );
              set({
                roomState: {
                  ...state.roomState,
                  gameState: {
                    ...state.roomState.gameState,
                    players: updatedPlayers,
                  },
                },
              });
            }
            break;

          case 'PLAYER_RECONNECTED':
            if (state.roomState) {
              const updatedPlayers = state.roomState.gameState.players.map((p) =>
                p.id === message.payload.playerId
                  ? { ...p, isConnected: true }
                  : p
              );
              set({
                roomState: {
                  ...state.roomState,
                  gameState: {
                    ...state.roomState.gameState,
                    players: updatedPlayers,
                  },
                },
              });
            }
            break;

          case 'ERROR':
            set({ connectionError: message.payload.message });
            break;

          case 'POSITION_PREVIEW':
            if (state.roomState) {
              set({
                roomState: {
                  ...state.roomState,
                  gameState: {
                    ...state.roomState.gameState,
                    previewPosition: message.payload.position,
                  },
                },
              });
            }
            break;

          case 'TURN_TIMER_STARTED':
            if (state.roomState) {
              set({
                roomState: {
                  ...state.roomState,
                  gameState: {
                    ...state.roomState.gameState,
                    turnStartedAt: message.payload.turnStartedAt,
                    musicPlaying: true,
                  },
                },
              });
            }
            break;

          case 'RECORDING_PHASE_STARTED':
            if (state.roomState) {
              set({
                roomState: {
                  ...state.roomState,
                  recordingDeadline: null,
                  gameState: {
                    ...state.roomState.gameState,
                    phase: 'recording',
                  },
                },
              });
            }
            break;

          case 'GUESS_RECORDING':
            if (state.roomState) {
              set({
                roomState: {
                  ...state.roomState,
                  gameState: {
                    ...state.roomState.gameState,
                    votingState: {
                      audioData: message.payload.audioData,
                      deadline: message.payload.votingDeadline,
                      votes: { yes: 0, no: 0 },
                      votedPlayerIds: [],
                      recordingPlayerId: message.payload.playerId,
                    },
                  },
                },
              });
            }
            break;

          case 'VOTE_UPDATE':
            if (state.roomState?.gameState.votingState) {
              set({
                roomState: {
                  ...state.roomState,
                  gameState: {
                    ...state.roomState.gameState,
                    votingState: {
                      ...state.roomState.gameState.votingState,
                      votes: {
                        yes: message.payload.yesCount,
                        no: message.payload.noCount,
                      },
                    },
                  },
                },
              });
            }
            break;

          case 'VOTING_RESULT':
            if (state.roomState) {
              set({
                roomState: {
                  ...state.roomState,
                  gameState: {
                    ...state.roomState.gameState,
                    votingState: null,
                  },
                },
              });
            }
            break;
        }
      },

      reset: () => set(initialMultiplayerState),

      updatePlayerReady: (playerId, isReady) => {
        const state = get();
        if (!state.roomState) return;
        set({
          roomState: {
            ...state.roomState,
            gameState: {
              ...state.roomState.gameState,
              players: state.roomState.gameState.players.map((p) =>
                p.id === playerId ? { ...p, isReady } : p
              ),
            },
          },
        });
      },

      removePlayer: (playerId) => {
        const state = get();
        if (!state.roomState) return;
        set({
          roomState: {
            ...state.roomState,
            gameState: {
              ...state.roomState.gameState,
              players: state.roomState.gameState.players.filter(
                (p) => p.id !== playerId
              ),
            },
          },
        });
      },

      addPlayer: (player) => {
        const state = get();
        if (!state.roomState) return;
        set({
          roomState: {
            ...state.roomState,
            gameState: {
              ...state.roomState.gameState,
              players: [...state.roomState.gameState.players, player],
            },
          },
        });
      },

      updateSettings: (targetScore, maxPlayers) => {
        const state = get();
        if (!state.roomState) return;
        set({
          roomState: {
            ...state.roomState,
            maxPlayers,
            gameState: {
              ...state.roomState.gameState,
              targetScore,
            },
          },
        });
      },

      updateGameState: (updates) => {
        const state = get();
        if (!state.roomState) return;
        set({
          roomState: {
            ...state.roomState,
            gameState: {
              ...state.roomState.gameState,
              ...updates,
            },
          },
        });
      },
    }),
    {
      name: 'timetune-multiplayer',
      partialize: (state) => ({
        mode: state.mode,
        roomCode: state.roomCode,
        myPlayerId: state.myPlayerId,
        isHost: state.isHost,
      }),
    }
  )
);

export function useMyPlayer(): OnlinePlayer | null {
  const { roomState, myPlayerId } = useMultiplayerStore();
  if (!roomState || !myPlayerId) return null;
  return roomState.gameState.players.find((p) => p.id === myPlayerId) ?? null;
}
