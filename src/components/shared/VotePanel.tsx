import { useState, useEffect } from 'react';
import { m } from 'motion/react';
import { AudioPlayback } from './AudioPlayback';
import { useTranslations } from '../../i18n';
import { useMotionPreference } from '../../motion';

interface VotePanelProps {
  audioData: string;
  playerName: string;
  votingDeadline: number;
  currentVotes: { yes: number; no: number };
  hasVoted: boolean;
  onVote: (correct: boolean) => void;
}

export function VotePanel({
  audioData,
  playerName,
  votingDeadline,
  currentVotes,
  hasVoted,
  onVote,
}: VotePanelProps) {
  const { t } = useTranslations();
  const { shouldReduceMotion } = useMotionPreference();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((votingDeadline - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [votingDeadline]);

  const totalVotes = currentVotes.yes + currentVotes.no;

  return (
    <div className="bg-surface rounded-xl p-4">
      <div className="text-center mb-4">
        <p className="text-gray-400 text-sm mb-2">{t('voting.playerSaid', { name: playerName })}</p>
        <AudioPlayback audioData={audioData} autoPlay />
      </div>

      <div className="flex items-center justify-center gap-2 mb-4">
        <m.div
          className="w-2 h-2 bg-amber-500 rounded-full"
          animate={shouldReduceMotion ? {} : { opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="text-amber-400 font-mono">{timeLeft}s</span>
      </div>

      {hasVoted ? (
        <div className="text-center">
          <p className="text-green-400 mb-3">{t('voting.voted')}</p>
          <div className="flex justify-center gap-4 text-sm">
            <span className="text-green-400">{currentVotes.yes} {t('voting.yes')}</span>
            <span className="text-red-400">{currentVotes.no} {t('voting.no')}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-center text-gray-400 text-sm">{t('voting.didTheyGuess')}</p>
          <div className="flex gap-3">
            <button
              onClick={() => onVote(true)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t('voting.correct')}
            </button>
            <button
              onClick={() => onVote(false)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {t('voting.incorrect')}
            </button>
          </div>
          {totalVotes > 0 && (
            <div className="flex justify-center gap-4 text-sm text-gray-500">
              <span>{currentVotes.yes} {t('voting.yes')}</span>
              <span>{currentVotes.no} {t('voting.no')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
