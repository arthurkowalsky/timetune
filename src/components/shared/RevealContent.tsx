import { useEffect, useState } from 'react';
import { m } from 'motion/react';
import confetti from 'canvas-confetti';
import { useTranslations, pluralize } from '../../i18n';
import { generateGitHubIssueUrl } from '../../utils/gameUtils';
import { VotePanel } from './VotePanel';
import {
  useMotionPreference,
  screenSlideUp,
  slideIn,
  scaleBounce,
  fadeIn,
  shake,
  staggerContainer,
  staggerItemY
} from '../../motion';
import type { Song } from '../../types';
import type { VotingState } from '../../multiplayer/types';

interface RevealContentProps {
  currentSong: Song;
  lastGuessCorrect: boolean;
  playerName: string;
  cardCount: number;
  bonusPoints: number;
  bonusClaimed?: boolean;
  isMyTurn?: boolean;
  isOnline?: boolean;
  voiceVotingEnabled?: boolean;
  votingState?: VotingState | null;
  myPlayerId?: string | null;
  onClaimBonus: () => void;
  onNextTurn: () => void;
  onVote?: (correct: boolean) => void;
}

export function RevealContent({
  currentSong,
  lastGuessCorrect,
  playerName,
  cardCount,
  bonusPoints,
  bonusClaimed: bonusClaimedProp = false,
  isMyTurn = true,
  isOnline = false,
  voiceVotingEnabled = false,
  votingState = null,
  myPlayerId = null,
  onClaimBonus,
  onNextTurn,
  onVote,
}: RevealContentProps) {
  const { t } = useTranslations();
  const [localBonusClaimed, setLocalBonusClaimed] = useState(false);
  const [lastSongId, setLastSongId] = useState(currentSong?.id);
  const [hasVoted, setHasVoted] = useState(false);

  if (currentSong?.id !== lastSongId) {
    setLastSongId(currentSong?.id);
    setLocalBonusClaimed(false);
    setHasVoted(false);
  }

  const bonusClaimed = bonusClaimedProp || localBonusClaimed;

  const { shouldReduceMotion, getVariants } = useMotionPreference();
  const showVotePanel = isOnline && votingState && !isMyTurn && votingState.recordingPlayerId !== myPlayerId;
  const showStandardBonus = lastGuessCorrect && isMyTurn && !bonusClaimed && !(isOnline && voiceVotingEnabled);

  useEffect(() => {
    if ('vibrate' in navigator) {
      if (lastGuessCorrect) {
        navigator.vibrate([100, 50, 100]);
      } else {
        navigator.vibrate(300);
      }
    }

    if (lastGuessCorrect && !shouldReduceMotion) {
      const musicNote = confetti.shapeFromText({ text: '🎵', scalar: 2 });
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        shapes: ['circle', musicNote],
        colors: ['#10B981', '#34D399', '#6EE7B7', '#FFD700'],
        disableForReducedMotion: true
      });
    }
  }, [lastGuessCorrect, shouldReduceMotion]);

  const handleClaimBonus = () => {
    if (!isMyTurn) return;
    onClaimBonus();
    setLocalBonusClaimed(true);
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 100]);
    }
  };

  const handleVote = (correct: boolean) => {
    setHasVoted(true);
    onVote?.(correct);
  };

  const cardWord = pluralize(
    cardCount,
    t('reveal.card_one'),
    t('reveal.card_few'),
    t('reveal.card_many')
  );

  return (
    <m.div
      className="min-h-screen bg-bg p-4 flex flex-col items-center justify-center"
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
        <m.div
          className={`
            text-center mb-8 p-6 rounded-2xl
            ${lastGuessCorrect
              ? 'bg-green-900/30 border-2 border-green-500'
              : 'bg-red-900/30 border-2 border-red-500'
            }
          `}
          variants={getVariants(lastGuessCorrect ? slideIn : shake)}
        >
          <m.div
            className="text-6xl mb-4"
            variants={getVariants(scaleBounce)}
          >
            {lastGuessCorrect ? '🎉' : '😢'}
          </m.div>
          <m.h2
            className={`text-3xl font-black mb-2 ${
              lastGuessCorrect ? 'text-green-400' : 'text-red-400'
            }`}
            variants={getVariants(fadeIn)}
          >
            {lastGuessCorrect ? t('reveal.correct') : t('reveal.wrong')}
          </m.h2>
          <m.p
            className="text-gray-400"
            variants={getVariants(fadeIn)}
          >
            {lastGuessCorrect
              ? `${playerName} ${t('reveal.getsCard')}`
              : t('reveal.notThisTime')
            }
          </m.p>
        </m.div>

        <m.div
          className="bg-surface rounded-2xl p-6 text-center"
          variants={staggerItemY}
        >
          <h3 className="text-2xl font-bold text-white mb-2">{currentSong.title}</h3>
          <p className="text-lg text-gray-400">{currentSong.artist}</p>
          <div className="mt-4 text-5xl font-black text-primary">{currentSong.year}</div>
        </m.div>

        <m.div className="mt-3 text-center" variants={staggerItemY}>
          <a
            href={generateGitHubIssueUrl(currentSong)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <span>🚩</span>
            <span>{t('reveal.reportIssue')}</span>
          </a>
        </m.div>

        <m.div className="mt-6 text-center" variants={staggerItemY}>
          <p className="text-gray-400">
            {playerName} {t('reveal.hasNow')}{' '}
            <span className="text-primary font-bold">
              {cardCount}
            </span>{' '}
            {cardWord}
            {bonusPoints > 0 && (
              <span className="text-amber-400 ml-2">
                (+{bonusPoints} {t('reveal.bonus')})
              </span>
            )}
          </p>
        </m.div>

        {showStandardBonus && (
          <m.div
            className="mt-6 bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-2 border-amber-500 rounded-xl p-4"
            variants={getVariants(slideIn)}
          >
            <p className="text-amber-300 text-center mb-3 text-sm">
              {t('reveal.bonusQuestion')}
            </p>
            <m.button
              onClick={handleClaimBonus}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500
                         hover:from-amber-600 hover:to-orange-600 text-white
                         py-3 rounded-xl font-bold transition-colors min-h-[48px]
                         shadow-lg shadow-amber-500/20"
            >
              {t('reveal.bonusButton')}
            </m.button>
          </m.div>
        )}

        {showVotePanel && votingState && (
          <m.div
            className="mt-6"
            variants={getVariants(slideIn)}
            initial="hidden"
            animate="visible"
          >
            <VotePanel
              audioData={votingState.audioData}
              playerName={playerName}
              votingDeadline={votingState.deadline}
              currentVotes={votingState.votes}
              hasVoted={hasVoted}
              onVote={handleVote}
            />
          </m.div>
        )}

        {lastGuessCorrect && bonusClaimed && (
          <m.div
            className="mt-6 bg-green-900/30 border-2 border-green-500 rounded-xl p-4 text-center"
            variants={getVariants(scaleBounce)}
            initial="hidden"
            animate="visible"
          >
            <span className="text-green-400 text-lg font-bold">✓ {t('reveal.bonusAwarded')}</span>
          </m.div>
        )}

        {isMyTurn ? (
          <m.button
            onClick={onNextTurn}
            variants={staggerItemY}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700 text-white py-4 rounded-xl text-xl font-bold transition-colors min-h-[56px]"
          >
            {t('reveal.nextTurn')}
          </m.button>
        ) : (
          <m.div
            className="mt-6 bg-surface rounded-xl p-4 text-center"
            variants={staggerItemY}
          >
            <p className="text-gray-400">
              {t('online.waitingFor')} <span className="text-primary font-bold">{playerName}</span>
            </p>
          </m.div>
        )}
      </m.div>
    </m.div>
  );
}
