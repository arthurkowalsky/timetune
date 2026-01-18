import { useState, useMemo } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { useGameStore, useSettingsStore } from '../store';
import { useTranslations } from '../i18n';
import { GameConfigSection } from './shared/GameConfigSection';
import { SongCategorySelector } from './shared/SongCategorySelector';
import { EraSelector } from './shared/EraSelector';
import { getSongs, getSongCounts, filterByCategory, getEraCounts } from '../songs';
import {
  useMotionPreference,
  screenSlideUp,
  slideIn,
  staggerContainer,
  staggerItem,
  listItemVariants
} from '../motion';
import type { SongCategory, SongEra } from '../types';

interface StartScreenProps {
  onBack: () => void;
}

export function StartScreen({ onBack }: StartScreenProps) {
  const [teamName, setTeamName] = useState('');
  const { players, addPlayer, removePlayer, startGame, targetScore, setTargetScore, songCategory, setSongCategory, selectedEra, setSelectedEra } = useGameStore();
  const { autoPlayOnDraw, setAutoPlayOnDraw, turnTimeout, setTurnTimeout } = useSettingsStore();
  const { t } = useTranslations();
  const { getVariants, shouldReduceMotion } = useMotionPreference();

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

  return (
    <m.div
      className="min-h-screen bg-bg flex flex-col items-center justify-center p-4"
      variants={getVariants(screenSlideUp)}
      initial="hidden"
      animate="visible"
    >
      <m.div
        className="max-w-md w-full"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <m.div className="text-center mb-8" variants={getVariants(slideIn)}>
          <h1 className="text-5xl font-black text-white mb-2">
            🎵 {t('app.name').toUpperCase()}
          </h1>
          <p className="text-gray-400 text-lg">{t('app.subtitle')}</p>
        </m.div>

        <m.form onSubmit={handleAddTeam} className="mb-6" variants={staggerItem}>
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
              className="bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {t('start.addButton')}
            </button>
          </div>
        </m.form>

        <m.div className="bg-surface rounded-xl p-4 mb-6" variants={staggerItem}>
          <h2 className="text-lg font-bold text-white mb-3">
            {t('start.teamsTitle')} ({players.length})
          </h2>
          {players.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              {t('start.minTeamsWarning')}
            </p>
          ) : (
            <ul className="space-y-2">
              <AnimatePresence mode="popLayout">
                {players.map((player, index) => (
                  <m.li
                    key={player.id}
                    layout={!shouldReduceMotion}
                    variants={listItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex items-center justify-between bg-surface-light rounded-lg px-4 py-2"
                  >
                    <span className="text-white flex items-center gap-2">
                      <span className="text-2xl">
                        {['🎸', '🎤', '🎹', '🥁', '🎷', '🎺', '🎻', '🪗'][index % 8]}
                      </span>
                      {player.name}
                    </span>
                    <m.button
                      onClick={() => removePlayer(player.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      ✕
                    </m.button>
                  </m.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </m.div>

        <m.div className="mb-6" variants={staggerItem}>
          <SongCategorySelector
            selected={songCategory}
            onChange={setSongCategory}
            songCounts={songCounts}
          />
        </m.div>

        <m.div className="mb-6" variants={staggerItem}>
          <EraSelector
            selected={selectedEra}
            onChange={setSelectedEra}
            eraCounts={eraCounts}
          />
        </m.div>

        <m.div className="mb-6" variants={staggerItem}>
          <GameConfigSection
            targetScore={targetScore}
            turnTimeout={turnTimeout}
            autoPlayOnDraw={autoPlayOnDraw}
            onTargetScoreChange={setTargetScore}
            onTurnTimeoutChange={setTurnTimeout}
            onAutoPlayChange={setAutoPlayOnDraw}
            isEditable
          />
        </m.div>

        <m.button
          onClick={startGame}
          disabled={!canStart}
          variants={staggerItem}
          whileHover={canStart ? { scale: 1.02 } : {}}
          whileTap={canStart ? { scale: 0.98 } : {}}
          className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-xl text-xl font-bold transition-colors"
        >
          {canStart ? `🎮 ${t('start.startGame')}` : t('start.startGameDisabled')}
        </m.button>

        <m.button
          onClick={onBack}
          variants={staggerItem}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-4 bg-surface-light hover:bg-surface text-gray-400 hover:text-white py-3 rounded-xl font-bold transition-colors"
        >
          ← {t('common.back')}
        </m.button>

        <m.div className="mt-6 text-center text-gray-500 text-sm" variants={staggerItem}>
          <p className="mb-2">📋 {t('start.rulesTitle')}</p>
          <p>{t('start.rulesDescription')}</p>
        </m.div>
      </m.div>
    </m.div>
  );
}
