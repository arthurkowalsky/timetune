import { useState, useEffect, useRef, startTransition } from 'react';
import { useTranslations } from '../../i18n';
import { useMultiplayerStore, usePartySocket } from '../../multiplayer';

interface JoinRoomFormProps {
  onBack: () => void;
  onRoomJoined: () => void;
  initialRoomCode?: string | null;
}

export function JoinRoomForm({ onBack, onRoomJoined, initialRoomCode }: JoinRoomFormProps) {
  const { t } = useTranslations();
  const [playerName, setPlayerName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState(initialRoomCode ?? '');
  const [isJoining, setIsJoining] = useState(false);
  const { connect, send } = usePartySocket();
  const { roomState, isConnected, connectionError, setConnectionError } = useMultiplayerStore();
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialRoomCode && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [initialRoomCode]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || roomCodeInput.length !== 6) return;

    setIsJoining(true);
    setConnectionError(null);
    connect(roomCodeInput.toUpperCase());
  };

  useEffect(() => {
    if (isConnected && isJoining && !roomState) {
      send({
        type: 'JOIN_ROOM',
        payload: {
          playerName: playerName.trim(),
        },
      });
    }
  }, [isConnected, isJoining, roomState, playerName, send]);

  useEffect(() => {
    if (roomState && isJoining) {
      startTransition(() => {
        setIsJoining(false);
      });
      onRoomJoined();
    }
  }, [roomState, isJoining, onRoomJoined]);

  useEffect(() => {
    if (connectionError) {
      startTransition(() => {
        setIsJoining(false);
      });
    }
  }, [connectionError]);

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setRoomCodeInput(value);
      if (connectionError) setConnectionError(null);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
    if (connectionError) setConnectionError(null);
  };

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'Game already in progress': return t('error.gameAlreadyStarted');
      case 'Room not found': return t('error.roomNotFound');
      case 'Room full': return t('error.roomFull');
      case 'Name already taken': return t('error.nameTaken');
      default: return error;
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            🔗 {t('online.joinRoom')}
          </h1>
          <p className="text-gray-400">{t('online.joinRoomSubtitle')}</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div className="bg-surface rounded-xl p-4">
            <label className="block text-white font-bold mb-2">
              {t('online.roomCode')}
            </label>
            <input
              type="text"
              value={roomCodeInput}
              onChange={handleRoomCodeChange}
              placeholder="ABC123"
              className="w-full bg-surface-light border border-surface-light rounded-lg px-4 py-4 text-white text-center text-2xl font-mono tracking-widest placeholder-gray-500 focus:outline-none focus:border-primary"
              maxLength={6}
              autoComplete="off"
              autoCapitalize="characters"
              disabled={isJoining}
            />
          </div>

          <div className="bg-surface rounded-xl p-4">
            <label className="block text-white font-bold mb-2">
              {t('online.yourName')}
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={playerName}
              onChange={handleNameChange}
              placeholder={t('online.namePlaceholder')}
              className="w-full bg-surface-light border border-surface-light rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              maxLength={25}
              autoComplete="off"
              autoCapitalize="words"
              disabled={isJoining}
            />
          </div>

          {connectionError && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-400">
              {getErrorMessage(connectionError)}
            </div>
          )}

          <button
            type="submit"
            disabled={!playerName.trim() || roomCodeInput.length !== 6 || isJoining}
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-xl text-xl font-bold transition-all hover:scale-[1.02] disabled:hover:scale-100"
          >
            {isJoining ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> {t('online.joining')}
              </span>
            ) : (
              t('online.joinButton')
            )}
          </button>
        </form>

        <button
          onClick={onBack}
          disabled={isJoining}
          className="w-full mt-4 bg-surface-light hover:bg-surface text-gray-400 hover:text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
        >
          ← {t('common.back')}
        </button>
      </div>
    </div>
  );
}
