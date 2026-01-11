import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, GameActions, Player, Song, GameSettings, SettingsActions } from './types';
import { getSongs, shuffleSongs } from './songs';

type GameStore = GameState & GameActions;

const createPlayer = (name: string): Player => ({
  id: crypto.randomUUID(),
  name,
  timeline: [],
  bonusPoints: 0,
});

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      players: [],
      currentPlayerIndex: 0,
      deck: [],
      currentSong: null,
      phase: 'setup',
      lastGuessCorrect: null,
      targetScore: 10,

      addPlayer: (name: string) => {
        const trimmedName = name.trim();
        if (!trimmedName) return;

        set((state) => ({
          players: [...state.players, createPlayer(trimmedName)],
        }));
      },

      removePlayer: (id: string) => {
        set((state) => ({
          players: state.players.filter((p) => p.id !== id),
        }));
      },

      setTargetScore: (score: number) => {
        set({ targetScore: score });
      },

      startGame: () => {
        const { players } = get();
        if (players.length < 2) return;

        const shuffledDeck = shuffleSongs(getSongs());

        const playersWithCards = players.map((player) => {
          const starterCard = shuffledDeck.pop()!;
          return {
            ...player,
            timeline: [starterCard],
          };
        });

        set({
          players: playersWithCards,
          deck: shuffledDeck,
          phase: 'playing',
          currentPlayerIndex: 0,
          currentSong: null,
          lastGuessCorrect: null,
        });
      },

      drawCard: () => {
        const { deck } = get();
        if (deck.length === 0) {
          set({ phase: 'finished' });
          return;
        }

        const [nextCard, ...remainingDeck] = deck;
        set({
          currentSong: nextCard,
          deck: remainingDeck,
          phase: 'placing',
        });
      },

      placeSong: (position: number) => {
        const { currentSong, players, currentPlayerIndex } = get();
        if (!currentSong) return;

        const currentPlayer = players[currentPlayerIndex];
        const timeline = [...currentPlayer.timeline];
        const isCorrect = isPlacementCorrect(timeline, currentSong, position);

        if (isCorrect) {
          timeline.splice(position, 0, currentSong);
          timeline.sort((a, b) => a.year - b.year);

          const updatedPlayers = [...players];
          updatedPlayers[currentPlayerIndex] = {
            ...currentPlayer,
            timeline,
          };

          set({
            players: updatedPlayers,
            lastGuessCorrect: true,
            phase: 'reveal',
          });
        } else {
          set({
            lastGuessCorrect: false,
            phase: 'reveal',
          });
        }
      },

      awardBonusPoint: () => {
        const { players, currentPlayerIndex } = get();
        const updatedPlayers = [...players];
        updatedPlayers[currentPlayerIndex] = {
          ...updatedPlayers[currentPlayerIndex],
          bonusPoints: updatedPlayers[currentPlayerIndex].bonusPoints + 1,
        };
        set({ players: updatedPlayers });
      },

      nextTurn: () => {
        const { players, currentPlayerIndex, targetScore } = get();
        const winner = players.find((p) => p.timeline.length + p.bonusPoints >= targetScore);
        if (winner) {
          set({ phase: 'finished' });
          return;
        }

        const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
        set({
          currentPlayerIndex: nextPlayerIndex,
          currentSong: null,
          phase: 'playing',
          lastGuessCorrect: null,
        });
      },

      skipTurn: () => {
        const { players, currentPlayerIndex } = get();
        const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
        set({
          currentPlayerIndex: nextPlayerIndex,
          currentSong: null,
          phase: 'playing',
          lastGuessCorrect: null,
        });
      },

      resetGame: () => {
        set({
          players: [],
          currentPlayerIndex: 0,
          deck: [],
          currentSong: null,
          phase: 'setup',
          lastGuessCorrect: null,
          targetScore: 10,
        });
      },
    }),
    {
      name: 'timetune-game-storage',
      partialize: (state) => ({
        players: state.players,
        deck: state.deck,
        currentSong: state.currentSong,
        phase: state.phase,
        currentPlayerIndex: state.currentPlayerIndex,
        targetScore: state.targetScore,
      }),
    }
  )
);

function isPlacementCorrect(
  timeline: Song[],
  newSong: Song,
  position: number
): boolean {
  if (timeline.length === 0) return true;

  const sortedTimeline = [...timeline].sort((a, b) => a.year - b.year);
  const beforeSong = position > 0 ? sortedTimeline[position - 1] : null;
  const afterSong = position < sortedTimeline.length ? sortedTimeline[position] : null;

  if (beforeSong && newSong.year < beforeSong.year) return false;
  if (afterSong && newSong.year > afterSong.year) return false;

  return true;
}

type SettingsStore = GameSettings & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      autoPlayOnDraw: false,
      turnTimeout: null,
      voiceVotingEnabled: true,

      setAutoPlayOnDraw: (value: boolean) => {
        set({ autoPlayOnDraw: value });
      },

      setTurnTimeout: (value: number | null) => {
        set({ turnTimeout: value });
      },

      setVoiceVotingEnabled: (value: boolean) => {
        set({ voiceVotingEnabled: value });
      },
    }),
    {
      name: 'timetune-settings',
    }
  )
);
