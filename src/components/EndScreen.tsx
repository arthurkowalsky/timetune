import { useGame } from '../contexts';
import { useTranslations } from '../i18n';
import { EndContent } from './shared/EndContent';

export function EndScreen() {
  const game = useGame();
  const { t } = useTranslations();

  const actionLabel = game.isOnline
    ? t('lobby.leave')
    : `🔄 ${t('end.playAgain')}`;

  return (
    <EndContent
      players={game.players}
      targetScore={game.targetScore}
      onAction={game.onExit}
      actionLabel={actionLabel}
    />
  );
}
