import { useEffect, useState } from 'react';
import { useGameStore } from '../store';
import { YouTubePlayer } from './YouTubePlayer';
import { useTranslations, pluralize } from '../i18n';

export function RevealScreen() {
  const {
    currentSong,
    lastGuessCorrect,
    players,
    currentPlayerIndex,
    nextTurn,
    awardBonusPoint
  } = useGameStore();
  const { t } = useTranslations();

  const [bonusClaimed, setBonusClaimed] = useState(false);
  const currentPlayer = players[currentPlayerIndex];

  // Reset bonus state when song changes
  useEffect(() => {
    setBonusClaimed(false);
  }, [currentSong?.id]);

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
    awardBonusPoint();
    setBonusClaimed(true);
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 100]);
    }
  };

  if (!currentSong) return null;

  const cardCount = currentPlayer.timeline.length;
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
              ? `${currentPlayer.name} ${t('reveal.getsCard')}`
              : t('reveal.notThisTime')
            }
          </p>
        </div>
        <YouTubePlayer song={currentSong} showYear={true} />
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            {currentPlayer.name} {t('reveal.hasNow')}{' '}
            <span className="text-primary font-bold">
              {cardCount}
            </span>{' '}
            {cardWord}
            {currentPlayer.bonusPoints > 0 && (
              <span className="text-amber-400 ml-2">
                (+{currentPlayer.bonusPoints} {t('reveal.bonus')})
              </span>
            )}
          </p>
        </div>

        {/* Bonus section - only shown when guess is correct */}
        {lastGuessCorrect && !bonusClaimed && (
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

        {lastGuessCorrect && bonusClaimed && (
          <div className="mt-6 bg-green-900/30 border-2 border-green-500 rounded-xl p-4 text-center">
            <span className="text-green-400 text-lg font-bold">✓ {t('reveal.bonusAwarded')}</span>
          </div>
        )}

        <button
          onClick={nextTurn}
          className="w-full mt-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700 text-white py-4 rounded-xl text-xl font-bold transition-all hover:scale-[1.02] min-h-[56px]"
        >
          {t('reveal.nextTurn')}
        </button>
      </div>
    </div>
  );
}
