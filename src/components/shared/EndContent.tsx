import { m } from 'motion/react';
import { useTranslations, pluralize } from '../../i18n';
import { getPlayerScore } from '../../utils/gameUtils';
import {
  useMotionPreference,
  screenSlideUp,
  trophyBounce,
  fadeIn,
  staggerContainer,
  staggerItem
} from '../../motion';
import type { Song } from '../../types';

interface PlayerData {
  id: string;
  name: string;
  timeline: Song[];
  bonusPoints: number;
}

interface EndContentProps {
  players: PlayerData[];
  targetScore: number;
  onAction: () => void;
  actionLabel: string;
}

export function EndContent({ players, targetScore, onAction, actionLabel }: EndContentProps) {
  const { t } = useTranslations();
  const { getVariants, shouldReduceMotion } = useMotionPreference();

  const sortedPlayers = [...players].sort(
    (a, b) => getPlayerScore(b) - getPlayerScore(a)
  );

  const winner = sortedPlayers[0];
  const hasWinner = winner && getPlayerScore(winner) >= targetScore;

  const getCardWord = (count: number) =>
    pluralize(count, t('reveal.card_one'), t('reveal.card_few'), t('reveal.card_many'));

  return (
    <m.div
      className="min-h-screen bg-bg p-4 flex flex-col items-center justify-center"
      variants={getVariants(screenSlideUp)}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-md w-full text-center">
        <m.div
          className="text-8xl mb-4"
          variants={getVariants(trophyBounce)}
          initial="hidden"
          animate="visible"
        >
          🏆
        </m.div>

        <m.h1
          className="text-4xl font-black text-white mb-2"
          variants={getVariants(fadeIn)}
          initial="hidden"
          animate="visible"
          transition={{ delay: shouldReduceMotion ? 0 : 0.3 }}
        >
          {hasWinner ? t('end.winner') : t('end.gameOver')}
        </m.h1>

        {hasWinner && (
          <m.p
            className="text-2xl text-primary font-bold mb-8"
            variants={getVariants(fadeIn)}
            initial="hidden"
            animate="visible"
            transition={{ delay: shouldReduceMotion ? 0 : 0.4 }}
          >
            {winner.name} {t('end.wins')}
          </m.p>
        )}

        <m.div
          className="bg-surface rounded-xl p-4 mb-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-lg font-bold text-white mb-4">{t('end.finalRanking')}</h2>
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => (
              <m.div
                key={player.id}
                variants={staggerItem}
                className={`
                  flex items-center justify-between p-3 rounded-lg
                  ${index === 0
                    ? 'bg-gradient-to-r from-yellow-600/30 to-orange-600/30 border border-yellow-500/50'
                    : 'bg-surface-light'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                  </span>
                  <span className={`font-bold ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                    {player.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400">
                    {player.timeline.length} {getCardWord(player.timeline.length)}
                  </span>
                  {player.bonusPoints > 0 && (
                    <span className="text-amber-400 ml-2">
                      +{player.bonusPoints}
                    </span>
                  )}
                  {player.bonusPoints > 0 && (
                    <span className="text-white font-bold ml-2">
                      = {getPlayerScore(player)}
                    </span>
                  )}
                </div>
              </m.div>
            ))}
          </div>
        </m.div>

        {hasWinner && winner.timeline.length > 0 && (
          <m.div
            className="bg-surface rounded-xl p-4 mb-6 text-left"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-lg font-bold text-white mb-4">
              {t('end.winnerTimeline')}
            </h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {[...winner.timeline]
                .sort((a, b) => a.year - b.year)
                .map((song) => (
                  <m.div
                    key={song.id}
                    variants={staggerItem}
                    className="flex items-center gap-3 bg-surface-light rounded-lg px-3 py-2"
                  >
                    <span className="text-primary font-bold w-12">
                      {song.year}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm truncate">{song.title}</div>
                      <div className="text-gray-500 text-xs truncate">{song.artist}</div>
                    </div>
                  </m.div>
                ))}
            </div>
          </m.div>
        )}

        <m.button
          onClick={onAction}
          variants={staggerItem}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700 text-white py-4 rounded-xl text-xl font-bold transition-colors"
        >
          {actionLabel}
        </m.button>
      </div>
    </m.div>
  );
}
