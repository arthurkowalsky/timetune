import { useGameStore } from '../store';
import { useTranslations, pluralize } from '../i18n';

export function EndScreen() {
  const { players, resetGame, targetScore } = useGameStore();
  const { t } = useTranslations();

  // Calculate total score (cards + bonus points)
  const getPlayerScore = (player: { timeline: unknown[]; bonusPoints: number }) =>
    player.timeline.length + player.bonusPoints;

  const sortedPlayers = [...players].sort(
    (a, b) => getPlayerScore(b) - getPlayerScore(a)
  );

  const winner = sortedPlayers[0];
  const hasWinner = winner?.timeline.length >= targetScore;

  const getCardWord = (count: number) =>
    pluralize(count, t('reveal.card_one'), t('reveal.card_few'), t('reveal.card_many'));

  return (
    <div className="min-h-screen bg-bg p-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl mb-4">🏆</div>
        <h1 className="text-4xl font-black text-white mb-2">
          {hasWinner ? t('end.winner') : t('end.gameOver')}
        </h1>

        {hasWinner && (
          <p className="text-2xl text-primary font-bold mb-8">
            {winner.name} {t('end.wins')}
          </p>
        )}
        <div className="bg-surface rounded-xl p-4 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">{t('end.finalRanking')}</h2>
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
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
              </div>
            ))}
          </div>
        </div>
        {hasWinner && winner.timeline.length > 0 && (
          <div className="bg-surface rounded-xl p-4 mb-6 text-left">
            <h2 className="text-lg font-bold text-white mb-4">
              {t('end.winnerTimeline')}
            </h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {[...winner.timeline]
                .sort((a, b) => a.year - b.year)
                .map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-3 bg-surface-light rounded-lg px-3 py-2"
                  >
                    <span className="text-primary font-bold w-12">
                      {song.year}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm truncate">{song.title}</div>
                      <div className="text-gray-500 text-xs truncate">{song.artist}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
        <button
          onClick={resetGame}
          className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700 text-white py-4 rounded-xl text-xl font-bold transition-all hover:scale-[1.02]"
        >
          🔄 {t('end.playAgain')}
        </button>
      </div>
    </div>
  );
}
