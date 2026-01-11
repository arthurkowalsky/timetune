import { useEffect, useState } from 'react';
import { YouTubePlayer } from '../YouTubePlayer';
import { useTranslations, pluralize } from '../../i18n';
import { generateGitHubIssueUrl } from '../../utils/gameUtils';
import { VotePanel } from './VotePanel';
import type { Song } from '../../types';
import type { VotingState } from '../../multiplayer/types';

interface RevealContentProps {
  currentSong: Song;
  lastGuessCorrect: boolean;
  playerName: string;
  cardCount: number;
  bonusPoints: number;
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
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [lastSongId, setLastSongId] = useState(currentSong?.id);
  const [hasVoted, setHasVoted] = useState(false);

  if (currentSong?.id !== lastSongId) {
    setLastSongId(currentSong?.id);
    setBonusClaimed(false);
    setHasVoted(false);
  }

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
  }, [lastGuessCorrect]);

  const handleClaimBonus = () => {
    if (!isMyTurn) return;
    onClaimBonus();
    setBonusClaimed(true);
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
    <div className="min-h-screen bg-bg p-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        <div className={`
          text-center mb-8 p-6 rounded-2xl
          ${lastGuessCorrect
            ? 'bg-green-900/30 border-2 border-green-500'
            : 'bg-red-900/30 border-2 border-red-500'
          }
        `}>
          <div className="text-6xl mb-4">
            {lastGuessCorrect ? '🎉' : '😢'}
          </div>
          <h2 className={`text-3xl font-black mb-2 ${
            lastGuessCorrect ? 'text-green-400' : 'text-red-400'
          }`}>
            {lastGuessCorrect ? t('reveal.correct') : t('reveal.wrong')}
          </h2>
          <p className="text-gray-400">
            {lastGuessCorrect
              ? `${playerName} ${t('reveal.getsCard')}`
              : t('reveal.notThisTime')
            }
          </p>
        </div>

        <YouTubePlayer song={currentSong} showYear={true} />

        <div className="mt-3 text-center">
          <a
            href={generateGitHubIssueUrl(currentSong)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <span>🚩</span>
            <span>{t('reveal.reportIssue')}</span>
          </a>
        </div>

        <div className="mt-6 text-center">
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
        </div>

        {showStandardBonus && (
          <div className="mt-6 bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-2 border-amber-500 rounded-xl p-4">
            <p className="text-amber-300 text-center mb-3 text-sm">
              {t('reveal.bonusQuestion')}
            </p>
            <button
              onClick={handleClaimBonus}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500
                         hover:from-amber-600 hover:to-orange-600 text-white
                         py-3 rounded-xl font-bold transition-all hover:scale-[1.02] min-h-[48px]
                         shadow-lg shadow-amber-500/20"
            >
              {t('reveal.bonusButton')}
            </button>
          </div>
        )}

        {showVotePanel && votingState && (
          <div className="mt-6">
            <VotePanel
              audioData={votingState.audioData}
              playerName={playerName}
              votingDeadline={votingState.deadline}
              currentVotes={votingState.votes}
              hasVoted={hasVoted}
              onVote={handleVote}
            />
          </div>
        )}

        {lastGuessCorrect && bonusClaimed && (
          <div className="mt-6 bg-green-900/30 border-2 border-green-500 rounded-xl p-4 text-center">
            <span className="text-green-400 text-lg font-bold">✓ {t('reveal.bonusAwarded')}</span>
          </div>
        )}

        {isMyTurn ? (
          <button
            onClick={onNextTurn}
            className="w-full mt-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700 text-white py-4 rounded-xl text-xl font-bold transition-all hover:scale-[1.02] min-h-[56px]"
          >
            {t('reveal.nextTurn')}
          </button>
        ) : (
          <div className="mt-6 bg-surface rounded-xl p-4 text-center">
            <p className="text-gray-400">
              {t('online.waitingFor')} <span className="text-primary font-bold">{playerName}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
