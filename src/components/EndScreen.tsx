import { useGame } from '../contexts';
import { useTranslations } from '../i18n';
import { EndContent } from './shared/EndContent';

export function EndScreen() {
  const game = useGame();
  const { t } = useTranslations();

  const actionLabel = game.isOnline
    ? t('lobby.leave')
    : `🔄 ${t('end.playAgain')}`;

  const onAction = game.isOnline ? game.onExit : (game.onPlayAgain ?? game.onExit);

  return (
    <EndContent
      players={game.players}
      targetScore={game.targetScore}
      onAction={onAction}
      actionLabel={actionLabel}
    />
  );
}
