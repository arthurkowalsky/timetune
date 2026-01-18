import { useGame } from '../contexts';
import { RevealContent } from './shared/RevealContent';
import { ConfirmModal } from './shared/ConfirmModal';
import { useTranslations } from '../i18n';

export function RevealScreen() {
  const game = useGame();
  const { t } = useTranslations();

  if (!game.currentSong || game.lastGuessCorrect === null || !game.currentPlayer) {
    return null;
  }

  return (
    <>
      {game.isOnline && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => game.setShowExitConfirm(true)}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors bg-surface/80 rounded-full"
            title={t('lobby.leave')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      )}

      <RevealContent
        currentSong={game.currentSong}
        lastGuessCorrect={game.lastGuessCorrect}
        playerName={game.currentPlayer.name}
        cardCount={game.currentPlayer.timeline.length}
        bonusPoints={game.currentPlayer.bonusPoints}
        bonusClaimed={game.bonusClaimed}
        isMyTurn={game.isMyTurn}
        isOnline={game.isOnline}
        voiceVotingEnabled={game.voiceVotingEnabled}
        votingState={game.votingState}
        myPlayerId={game.myPlayerId}
        onClaimBonus={game.claimBonus}
        onNextTurn={game.nextTurn}
        onVote={game.submitVote}
      />

      {game.showExitConfirm && (
        <ConfirmModal
          title={game.exitConfirmConfig.title}
          message={game.exitConfirmConfig.message}
          confirmLabel={game.exitConfirmConfig.confirmLabel}
          cancelLabel={t('game.cancel')}
          onConfirm={() => {
            game.onExit();
            game.setShowExitConfirm(false);
          }}
          onCancel={() => game.setShowExitConfirm(false)}
          confirmVariant={game.exitConfirmConfig.confirmVariant}
        />
      )}
    </>
  );
}
