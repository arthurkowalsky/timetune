import { useState, useEffect } from 'react';
import { useGameStore } from '../store';
import { YouTubePlayer } from './YouTubePlayer';
import { Timeline } from './Timeline';
import { useTranslations } from '../i18n';
import type { Player } from '../types';

export function GameScreen() {
  const {
    players,
    currentPlayerIndex,
    currentSong,
    phase,
    drawCard,
    placeSong,
    targetScore,
    resetGame
  } = useGameStore();
  const { t } = useTranslations();

  const [viewingPlayerIndex, setViewingPlayerIndex] = useState<number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [lastPhase, setLastPhase] = useState(phase);

  const currentPlayer = players[currentPlayerIndex];
  const viewingPlayer = viewingPlayerIndex !== null ? players[viewingPlayerIndex] : null;

  // Reset state when phase changes (using derived state pattern)
  if (phase !== lastPhase) {
    setLastPhase(phase);
    if (phase !== 'placing') {
      setSelectedPosition(null);
      setIsMusicPlaying(false);
    }
  }

  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleSelectPosition = (position: number) => {
    if (selectedPosition === position) {
      setSelectedPosition(null); // Toggle off if same position clicked
    } else {
      setSelectedPosition(position);
    }
  };

  const handleConfirmPlacement = () => {
    if (selectedPosition !== null) {
      placeSong(selectedPosition);
    }
  };

  if (phase === 'playing') {
    return (
      <div className="min-h-screen bg-bg p-4">
        <div className="max-w-2xl mx-auto">
          <Header
            currentPlayer={currentPlayer}
            players={players}
            targetScore={targetScore}
            onReset={() => setShowResetConfirm(true)}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />
          <div className="bg-surface rounded-xl p-4 mb-6 max-h-[50vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">
              {t('game.yourTimeline')} ({currentPlayer.timeline.length} / {targetScore})
            </h3>
            <Timeline songs={currentPlayer.timeline} />
          </div>
          <button
            onClick={drawCard}
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700 text-white py-4 rounded-xl text-xl font-bold transition-all hover:scale-[1.02] animate-pulse min-h-[56px]"
          >
            🎵 {t('game.drawCard')}
          </button>
          <OtherPlayers
            players={players}
            currentPlayerIndex={currentPlayerIndex}
            onViewTimeline={setViewingPlayerIndex}
          />
          {showResetConfirm && (
            <ResetConfirmModal
              onConfirm={() => {
                resetGame();
                setShowResetConfirm(false);
              }}
              onCancel={() => setShowResetConfirm(false)}
            />
          )}
          {viewingPlayer && (
            <TimelineViewerModal
              player={viewingPlayer}
              onClose={() => setViewingPlayerIndex(null)}
            />
          )}
        </div>
      </div>
    );
  }

  if (phase === 'placing' && currentSong) {
    return (
      <div className="min-h-screen bg-bg p-4 pb-24">
        <div className="max-w-2xl mx-auto">
          <Header
            currentPlayer={currentPlayer}
            players={players}
            targetScore={targetScore}
            onReset={() => setShowResetConfirm(true)}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />
          <div className="mb-6">
            <YouTubePlayer song={currentSong} showYear={false} onPlayStarted={() => setIsMusicPlaying(true)} />
          </div>
          <div className="bg-surface rounded-xl p-4 max-h-[45vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">
              {!isMusicPlaying
                ? t('game.listenFirst')
                : selectedPosition !== null
                  ? t('game.confirmSelection')
                  : `${t('game.wherePlaceSong')} 🤔`}
            </h3>
            <Timeline
              songs={currentPlayer.timeline}
              onSelectPosition={handleSelectPosition}
              selectedPosition={selectedPosition}
              isInteractive={isMusicPlaying}
            />
          </div>
          {showResetConfirm && (
            <ResetConfirmModal
              onConfirm={() => {
                resetGame();
                setShowResetConfirm(false);
              }}
              onCancel={() => setShowResetConfirm(false)}
            />
          )}
        </div>

        {/* Sticky footer with confirm button */}
        <div className={`
          fixed bottom-0 left-0 right-0 p-4
          bg-gradient-to-t from-bg via-bg to-transparent
          transition-all duration-300
          ${selectedPosition !== null ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}
        `}>
          <button
            onClick={handleConfirmPlacement}
            className="w-full max-w-2xl mx-auto block bg-gradient-to-r from-green-500 to-emerald-600
                       hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl
                       text-xl font-bold transition-all hover:scale-[1.02] min-h-[56px]
                       shadow-lg shadow-green-500/30 animate-pulse"
          >
            ✓ {t('game.confirmButton')}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

interface HeaderProps {
  currentPlayer: { name: string; timeline: { id: string }[]; bonusPoints: number };
  players: { id: string; name: string; timeline: { id: string }[]; bonusPoints: number }[];
  targetScore: number;
  onReset: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

function Header({ currentPlayer, players, targetScore, onReset, isFullscreen, onToggleFullscreen }: HeaderProps) {
  const { t } = useTranslations();

  return (
    <div className="text-center mb-6">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onToggleFullscreen}
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
          title={isFullscreen ? t('game.exitFullscreen') : t('game.fullscreen')}
        >
          {isFullscreen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0v5m0-5h5m6 6l5 5m0 0v-5m0 5h-5M9 15l-5 5m0 0v-5m0 5h5m6-6l5-5m0 0v5m0-5h-5" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5" />
            </svg>
          )}
        </button>
        <h1 className="text-3xl font-black text-white">
          🎵 {t('app.name').toUpperCase()}
        </h1>
        <button
          onClick={onReset}
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
          title={t('game.resetGame')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      <div className="flex items-center justify-center gap-4">
        <span className="text-gray-400">{t('game.turn')}</span>
        <span className="text-xl font-bold text-primary">{currentPlayer.name}</span>
      </div>
      <div className="mt-4 flex gap-2 justify-center flex-wrap">
        {players.map((player) => (
          <div
            key={player.id}
            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
              player.name === currentPlayer.name
                ? 'bg-primary text-white'
                : 'bg-surface-light text-gray-400'
            }`}
          >
            <span>{player.name}: {player.timeline.length}/{targetScore}</span>
            {player.bonusPoints > 0 && (
              <span className="text-amber-400 ml-1">+{player.bonusPoints}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface OtherPlayersProps {
  players: { id: string; name: string; timeline: { id: string }[] }[];
  currentPlayerIndex: number;
  onViewTimeline: (index: number) => void;
}

function OtherPlayers({ players, currentPlayerIndex, onViewTimeline }: OtherPlayersProps) {
  const { t } = useTranslations();

  if (players.length <= 1) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-white mb-3">{t('game.otherTeams')}</h3>
      <div className="grid gap-3">
        {players.map((player, index) => (
          index !== currentPlayerIndex && (
            <button
              key={player.id}
              onClick={() => onViewTimeline(index)}
              className="bg-surface rounded-lg p-3 flex justify-between items-center hover:bg-surface-light transition-colors text-left w-full group"
            >
              <span className="text-white">{player.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">
                  {player.timeline.length} {t('game.cards')}
                </span>
                <span className="text-gray-500 group-hover:text-primary transition-colors">
                  👁
                </span>
              </div>
            </button>
          )
        ))}
      </div>
    </div>
  );
}

interface ResetConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function ResetConfirmModal({ onConfirm, onCancel }: ResetConfirmModalProps) {
  const { t } = useTranslations();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl p-6 max-w-sm w-full">
        <h3 className="text-xl font-bold text-white mb-4 text-center">
          {t('game.resetConfirmTitle')}
        </h3>
        <p className="text-gray-400 text-center mb-6">
          {t('game.resetConfirmMessage')}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-surface-light hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition-colors"
          >
            {t('game.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-colors"
          >
            {t('game.reset')}
          </button>
        </div>
      </div>
    </div>
  );
}

interface TimelineViewerModalProps {
  player: Player;
  onClose: () => void;
}

function TimelineViewerModal({ player, onClose }: TimelineViewerModalProps) {
  const { t } = useTranslations();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl p-6 max-w-lg w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">
            {t('game.timelineOf')} {player.name}
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {player.timeline.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t('game.noCards')}</p>
          ) : (
            <Timeline songs={player.timeline} />
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-surface-light hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition-colors"
        >
          {t('game.close')}
        </button>
      </div>
    </div>
  );
}
