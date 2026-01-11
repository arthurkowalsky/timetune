import { useGame } from '../contexts';
import { VoiceRecorder } from './shared/VoiceRecorder';
import { GameHeader } from './shared/GameHeader';
import { PlayerTabs } from './shared/PlayerTabs';
import { useTranslations } from '../i18n';

export function RecordingScreen() {
  const game = useGame();
  const { t } = useTranslations();

  if (!game.currentPlayer) return null;

  return (
    <div className="min-h-screen bg-bg">
      <div className="sticky top-0 z-10 bg-bg pt-4 px-4 pb-2">
        <div className="max-w-2xl mx-auto">
          <GameHeader />
          {game.players.length > 1 && (
            <div className="mt-3">
              <PlayerTabs
                players={game.players}
                currentPlayerId={game.currentPlayer.id}
                myPlayerId={game.myPlayerId}
                selectedPlayerId={game.currentPlayer.id}
                targetScore={game.targetScore}
                onSelectPlayer={() => {}}
              />
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-surface rounded-xl p-6 text-center">
            {game.isMyTurn ? (
              <VoiceRecorder
                onRecordingComplete={game.submitRecording}
                onSkip={game.skipRecording}
              />
            ) : (
              <>
                <h2 className="text-xl font-bold text-white mb-4">
                  {t('voting.waitingForRecording', { name: game.currentPlayer.name })}
                </h2>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-gray-400">{t('voting.waitingForVotes')}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
