import { useState } from 'react';
import { useGameStore } from '../store';
import { useTranslations } from '../i18n';

export function StartScreen() {
  const [teamName, setTeamName] = useState('');
  const { players, addPlayer, removePlayer, startGame, targetScore, setTargetScore } = useGameStore();
  const { t } = useTranslations();

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim()) {
      addPlayer(teamName.trim());
      setTeamName('');
    }
  };

  const canStart = players.length >= 2;

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-2">
            🎵 {t('app.name').toUpperCase()}
          </h1>
          <p className="text-gray-400 text-lg">{t('app.subtitle')}</p>
        </div>
        <form onSubmit={handleAddTeam} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder={t('start.playerPlaceholder')}
              className="flex-1 bg-surface border border-surface-light rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary min-h-[48px]"
              maxLength={25}
              autoComplete="off"
              autoCapitalize="words"
              enterKeyHint="done"
            />
            <button
              type="submit"
              disabled={!teamName.trim()}
              className="bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition-colors"
            >
              {t('start.addButton')}
            </button>
          </div>
        </form>
        <div className="bg-surface rounded-xl p-4 mb-6">
          <h2 className="text-lg font-bold text-white mb-3">
            {t('start.teamsTitle')} ({players.length})
          </h2>
          {players.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              {t('start.minTeamsWarning')}
            </p>
          ) : (
            <ul className="space-y-2">
              {players.map((player, index) => (
                <li
                  key={player.id}
                  className="flex items-center justify-between bg-surface-light rounded-lg px-4 py-2"
                >
                  <span className="text-white flex items-center gap-2">
                    <span className="text-2xl">
                      {['🎸', '🎤', '🎹', '🥁', '🎷', '🎺', '🎻', '🪗'][index % 8]}
                    </span>
                    {player.name}
                  </span>
                  <button
                    onClick={() => removePlayer(player.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-surface rounded-xl p-4 mb-6">
          <h2 className="text-lg font-bold text-white mb-3">{t('start.goalTitle')}</h2>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">{t('start.goalDescription')}</span>
            <select
              value={targetScore}
              onChange={(e) => setTargetScore(Number(e.target.value))}
              className="bg-surface-light border border-surface-light rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value={5}>{t('start.cards5')}</option>
              <option value={7}>{t('start.cards7')}</option>
              <option value={10}>{t('start.cards10')}</option>
              <option value={15}>{t('start.cards15')}</option>
            </select>
          </div>
        </div>
        <button
          onClick={startGame}
          disabled={!canStart}
          className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-xl text-xl font-bold transition-all hover:scale-[1.02] disabled:hover:scale-100"
        >
          {canStart ? `🎮 ${t('start.startGame')}` : t('start.startGameDisabled')}
        </button>
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p className="mb-2">📋 {t('start.rulesTitle')}</p>
          <p>{t('start.rulesDescription')}</p>
        </div>
      </div>
    </div>
  );
}
