import { useState, useEffect, startTransition } from 'react';
import { useTranslations } from '../../i18n';
import { useMultiplayerStore, usePartySocket } from '../../multiplayer';
import { getSongs } from '../../songs';

interface CreateRoomFormProps {
  onBack: () => void;
  onRoomCreated: () => void;
}

export function CreateRoomForm({ onBack, onRoomCreated }: CreateRoomFormProps) {
  const { t } = useTranslations();
  const [playerName, setPlayerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { connect, send } = usePartySocket();
  const { roomCode, isConnected, connectionError, setConnectionError } = useMultiplayerStore();

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    setIsCreating(true);
    setConnectionError(null);
    const code = generateRoomCode();
    connect(code);
  };

  useEffect(() => {
    if (isConnected && isCreating && !roomCode) {
      const songs = getSongs();
      send({
        type: 'CREATE_ROOM',
        payload: {
          playerName: playerName.trim(),
        },
      });
      send({
        type: 'UPDATE_SETTINGS',
        payload: {
          deck: songs,
        },
      });
    }
  }, [isConnected, isCreating, roomCode, playerName, send]);

  useEffect(() => {
    if (roomCode && isCreating) {
      startTransition(() => {
        setIsCreating(false);
      });
      onRoomCreated();
    }
  }, [roomCode, isCreating, onRoomCreated]);

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            ➕ {t('online.createRoom')}
          </h1>
          <p className="text-gray-400">{t('online.createRoomSubtitle')}</p>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          <div className="bg-surface rounded-xl p-4">
            <label className="block text-white font-bold mb-2">
              {t('online.yourName')}
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder={t('online.namePlaceholder')}
              className="w-full bg-surface-light border border-surface-light rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              maxLength={25}
              autoComplete="off"
              autoCapitalize="words"
              disabled={isCreating}
            />
          </div>

          {connectionError && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-400">
              {t(connectionError)}
            </div>
          )}

          <button
            type="submit"
            disabled={!playerName.trim() || isCreating}
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-xl text-xl font-bold transition-all hover:scale-[1.02] disabled:hover:scale-100"
          >
            {isCreating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> {t('online.creating')}
              </span>
            ) : (
              t('online.createButton')
            )}
          </button>
        </form>

        <button
          onClick={onBack}
          disabled={isCreating}
          className="w-full mt-4 bg-surface-light hover:bg-surface text-gray-400 hover:text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
        >
          ← {t('common.back')}
        </button>
      </div>
    </div>
  );
}
