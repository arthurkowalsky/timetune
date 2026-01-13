import { useState, useEffect, useMemo, startTransition } from 'react';
import { useTranslations } from '../../i18n';
import { useMultiplayerStore, usePartySocket, useMyPlayer } from '../../multiplayer';
import { RoomCodeDisplay } from './RoomCodeDisplay';
import { GameConfigSection } from '../shared/GameConfigSection';
import { SongCategorySelector } from '../shared/SongCategorySelector';
import { EraSelector } from '../shared/EraSelector';
import { getSongs, getSongCounts, filterByCategory, filterByEra, getEraCounts } from '../../songs';
import type { SongCategory, SongEra } from '../../types';

interface LobbyProps {
  onLeave: () => void;
}

export function Lobby({ onLeave }: LobbyProps) {
  const { t } = useTranslations();
  const { send, disconnect } = usePartySocket();
  const { roomCode, roomState, isHost, myPlayerId, reset, connectionError, setConnectionError } = useMultiplayerStore();
  const myPlayer = useMyPlayer();
  const [isStarting, setIsStarting] = useState(false);

  const allSongs = useMemo(() => getSongs(), []);

  const songCounts = useMemo<Record<SongCategory, number>>(() => {
    return allSongs.length > 0 ? getSongCounts(allSongs) : { all: 0, polish: 0, international: 0 };
  }, [allSongs]);

  const eraCounts = useMemo<Record<SongEra, number>>(() => {
    const currentCategory = roomState?.gameState.songCategory || 'all';
    const filteredByCategory = filterByCategory(allSongs, currentCategory);
    return getEraCounts(filteredByCategory);
  }, [allSongs, roomState?.gameState.songCategory]);

  useEffect(() => {
    return () => setConnectionError(null);
  }, [setConnectionError]);

  useEffect(() => {
    if (connectionError) {
      startTransition(() => {
        setIsStarting(false);
      });
    }
  }, [connectionError]);

  if (!roomState || !roomCode) return null;

  const players = roomState.gameState.players;
  const allReady = players.every((p) => p.isReady || p.isHost);
  const canStart = isHost && players.length >= 2 && allReady;

  const handleReady = () => {
    if (myPlayer) {
      send({
        type: 'SET_READY',
        payload: { isReady: !myPlayer.isReady },
      });
    }
  };

  const handleKick = (playerId: string) => {
    send({
      type: 'KICK_PLAYER',
      payload: { playerId },
    });
  };

  const handleStart = () => {
    if (allSongs.length === 0) {
      setConnectionError('No songs loaded. Please refresh the page.');
      return;
    }
    const currentCategory = roomState?.gameState.songCategory || 'all';
    const currentEra = roomState?.gameState.selectedEra || 'all';
    const filteredByCategory = filterByCategory(allSongs, currentCategory);
    const filteredSongs = filterByEra(filteredByCategory, currentEra);
    if (filteredSongs.length === 0) {
      setConnectionError('No songs in selected category and era.');
      return;
    }
    setConnectionError(null);
    setIsStarting(true);
    send({
      type: 'UPDATE_SETTINGS',
      payload: { deck: filteredSongs },
    });
    setTimeout(() => {
      send({ type: 'START_GAME' });
    }, 200);
  };

  const handleLeave = () => {
    send({ type: 'LEAVE_ROOM' });
    disconnect();
    reset();
    onLeave();
  };

  const handleTargetScoreChange = (targetScore: number) => {
    send({
      type: 'UPDATE_SETTINGS',
      payload: { targetScore },
    });
  };

  const handleTimeoutChange = (turnTimeout: number | null) => {
    send({
      type: 'UPDATE_SETTINGS',
      payload: { turnTimeout },
    });
  };

  const handleAutoPlayChange = (autoPlayOnDraw: boolean) => {
    send({
      type: 'UPDATE_SETTINGS',
      payload: { autoPlayOnDraw },
    });
  };

  const handleVoiceVotingChange = (voiceVotingEnabled: boolean) => {
    send({
      type: 'UPDATE_SETTINGS',
      payload: { voiceVotingEnabled },
    });
  };

  const handleSongCategoryChange = (songCategory: SongCategory) => {
    send({
      type: 'UPDATE_SETTINGS',
      payload: { songCategory },
    });
  };

  const handleEraChange = (selectedEra: SongEra) => {
    send({
      type: 'UPDATE_SETTINGS',
      payload: { selectedEra },
    });
  };

  const getStaggerClass = (index: number) => {
    const delays = ['stagger-delay-1', 'stagger-delay-2', 'stagger-delay-3', 'stagger-delay-4', 'stagger-delay-5', 'stagger-delay-6', 'stagger-delay-7', 'stagger-delay-8'];
    return delays[index % delays.length];
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 animate-screen">
      <div className="max-w-md w-full">
        <div className="animate-slide-in">
          <RoomCodeDisplay code={roomCode} />
        </div>

        <div className="bg-surface rounded-xl p-4 mb-6 animate-stagger-in stagger-delay-1">
          <h2 className="text-lg font-bold text-white mb-3">
            {t('lobby.players')} ({players.length}/{roomState.maxPlayers})
          </h2>
          <div className="space-y-2">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg animate-stagger-in ${getStaggerClass(index)} ${
                  player.isHost
                    ? 'bg-primary/20 border border-primary/50'
                    : 'bg-surface-light'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      player.isConnected ? 'bg-green-500' : 'bg-gray-500 animate-pulse'
                    }`}
                  />
                  <span className="text-2xl">
                    {['🎸', '🎤', '🎹', '🥁', '🎷', '🎺', '🎻', '🪗'][index % 8]}
                  </span>
                  <span className="text-white">{player.name}</span>
                  {player.isHost && (
                    <span className="text-xs bg-primary px-2 py-0.5 rounded-full text-white">
                      {t('lobby.host')}
                    </span>
                  )}
                  {player.id === myPlayerId && (
                    <span className="text-xs bg-surface-light px-2 py-0.5 rounded-full text-gray-400">
                      {t('lobby.you')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {player.isReady && !player.isHost && (
                    <span className="text-green-400 text-sm">{t('lobby.ready')}</span>
                  )}
                  {isHost && !player.isHost && (
                    <button
                      onClick={() => handleKick(player.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors text-sm"
                    >
                      {t('lobby.kick')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 animate-stagger-in stagger-delay-2">
          <SongCategorySelector
            selected={roomState.gameState.songCategory || 'all'}
            onChange={handleSongCategoryChange}
            songCounts={songCounts}
            isEditable={isHost}
          />
        </div>

        <div className="mb-6 animate-stagger-in stagger-delay-3">
          <EraSelector
            selected={roomState.gameState.selectedEra || 'all'}
            onChange={handleEraChange}
            eraCounts={eraCounts}
            isEditable={isHost}
          />
        </div>

        <div className="mb-6 animate-stagger-in stagger-delay-4">
          <GameConfigSection
            targetScore={roomState.gameState.targetScore}
            turnTimeout={roomState.gameState.turnTimeout}
            autoPlayOnDraw={roomState.gameState.autoPlayOnDraw}
            voiceVotingEnabled={roomState.gameState.voiceVotingEnabled}
            onTargetScoreChange={handleTargetScoreChange}
            onTurnTimeoutChange={handleTimeoutChange}
            onAutoPlayChange={handleAutoPlayChange}
            onVoiceVotingChange={handleVoiceVotingChange}
            isEditable={isHost}
            showVoiceVoting={true}
          />
        </div>

        {connectionError && (
          <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-xl mb-4 text-center animate-slide-in">
            {connectionError}
          </div>
        )}

        <div className="space-y-3 animate-stagger-in stagger-delay-5">
          {!isHost && myPlayer && (
            <button
              onClick={handleReady}
              className={`w-full py-4 rounded-xl text-xl font-bold transition-all ${
                myPlayer.isReady
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-surface-light hover:bg-surface text-gray-300 hover:text-white'
              }`}
            >
              {myPlayer.isReady ? `✓ ${t('lobby.readyActive')}` : t('lobby.setReady')}
            </button>
          )}

          {isHost && (
            <button
              onClick={handleStart}
              disabled={!canStart || isStarting}
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-xl text-xl font-bold transition-all hover:scale-[1.02] disabled:hover:scale-100"
            >
              {isStarting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> {t('lobby.starting')}
                </span>
              ) : canStart ? (
                `🎮 ${t('lobby.startGame')}`
              ) : (
                t('lobby.waitingForReady')
              )}
            </button>
          )}

          <button
            onClick={handleLeave}
            className="w-full bg-surface-light hover:bg-surface text-gray-400 hover:text-white py-3 rounded-xl font-bold transition-colors"
          >
            {t('lobby.leave')}
          </button>
        </div>
      </div>
    </div>
  );
}
