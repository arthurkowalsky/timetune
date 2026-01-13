import { useState, useMemo } from 'react';
import { useGameStore, useSettingsStore } from '../store';
import { useTranslations } from '../i18n';
import { GameConfigSection } from './shared/GameConfigSection';
import { SongCategorySelector } from './shared/SongCategorySelector';
import { EraSelector } from './shared/EraSelector';
import { getSongs, getSongCounts, filterByCategory, getEraCounts } from '../songs';
import type { SongCategory, SongEra } from '../types';

interface StartScreenProps {
  onBack: () => void;
}

export function StartScreen({ onBack }: StartScreenProps) {
  const [teamName, setTeamName] = useState('');
  const { players, addPlayer, removePlayer, startGame, targetScore, setTargetScore, songCategory, setSongCategory, selectedEra, setSelectedEra } = useGameStore();
  const { autoPlayOnDraw, setAutoPlayOnDraw, turnTimeout, setTurnTimeout } = useSettingsStore();
  const { t } = useTranslations();

  const allSongs = useMemo(() => getSongs(), []);

  const songCounts = useMemo<Record<SongCategory, number>>(() => {
    return allSongs.length > 0 ? getSongCounts(allSongs) : { all: 0, polish: 0, international: 0 };
  }, [allSongs]);

  const eraCounts = useMemo<Record<SongEra, number>>(() => {
    const filteredByCategory = filterByCategory(allSongs, songCategory);
    return getEraCounts(filteredByCategory);
  }, [allSongs, songCategory]);

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim()) {
      addPlayer(teamName.trim());
      setTeamName('');
    }
  };

  const canStart = players.length >= 2;

  const getStaggerClass = (index: number) => {
    const delays = ['stagger-delay-1', 'stagger-delay-2', 'stagger-delay-3', 'stagger-delay-4', 'stagger-delay-5', 'stagger-delay-6', 'stagger-delay-7', 'stagger-delay-8'];
    return delays[index % delays.length];
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 animate-screen">
      <div className="max-w-md w-full">
        <div className="text-center mb-8 animate-slide-in">
          <h1 className="text-5xl font-black text-white mb-2">
            🎵 {t('app.name').toUpperCase()}
          </h1>
          <p className="text-gray-400 text-lg">{t('app.subtitle')}</p>
        </div>
        <form onSubmit={handleAddTeam} className="mb-6 animate-stagger-in stagger-delay-1">
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
        <div className="bg-surface rounded-xl p-4 mb-6 animate-stagger-in stagger-delay-2">
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
                  className={`flex items-center justify-between bg-surface-light rounded-lg px-4 py-2 animate-stagger-in ${getStaggerClass(index)}`}
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
        <div className="mb-6 animate-stagger-in stagger-delay-3">
          <SongCategorySelector
            selected={songCategory}
            onChange={setSongCategory}
            songCounts={songCounts}
          />
        </div>
        <div className="mb-6 animate-stagger-in stagger-delay-4">
          <EraSelector
            selected={selectedEra}
            onChange={setSelectedEra}
            eraCounts={eraCounts}
          />
        </div>
        <div className="mb-6 animate-stagger-in stagger-delay-5">
          <GameConfigSection
            targetScore={targetScore}
            turnTimeout={turnTimeout}
            autoPlayOnDraw={autoPlayOnDraw}
            onTargetScoreChange={setTargetScore}
            onTurnTimeoutChange={setTurnTimeout}
            onAutoPlayChange={setAutoPlayOnDraw}
            isEditable
          />
        </div>
        <button
          onClick={startGame}
          disabled={!canStart}
          className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-xl text-xl font-bold transition-all hover:scale-[1.02] disabled:hover:scale-100 animate-stagger-in stagger-delay-6"
        >
          {canStart ? `🎮 ${t('start.startGame')}` : t('start.startGameDisabled')}
        </button>

        <button
          onClick={onBack}
          className="w-full mt-4 bg-surface-light hover:bg-surface text-gray-400 hover:text-white py-3 rounded-xl font-bold transition-colors animate-stagger-in stagger-delay-7"
        >
          ← {t('common.back')}
        </button>

        <div className="mt-6 text-center text-gray-500 text-sm animate-stagger-in stagger-delay-8">
          <p className="mb-2">📋 {t('start.rulesTitle')}</p>
          <p>{t('start.rulesDescription')}</p>
        </div>
      </div>
    </div>
  );
}
