import { useTranslations } from '../../i18n';

interface GameConfigSectionProps {
  targetScore: number;
  turnTimeout: number | null;
  autoPlayOnDraw: boolean;
  onTargetScoreChange?: (value: number) => void;
  onTurnTimeoutChange?: (value: number | null) => void;
  onAutoPlayChange?: (value: boolean) => void;
  isEditable?: boolean;
}

export function GameConfigSection({
  targetScore,
  turnTimeout,
  autoPlayOnDraw,
  onTargetScoreChange,
  onTurnTimeoutChange,
  onAutoPlayChange,
  isEditable = true,
}: GameConfigSectionProps) {
  const { t } = useTranslations();

  const formatTimeout = (value: number | null): string => {
    if (value === null) return t('settings.timeoutOff');
    if (value === 60) return t('settings.timeout1min');
    if (value === 120) return t('settings.timeout2min');
    if (value === 300) return t('settings.timeout5min');
    return t('settings.timeout10min');
  };

  if (!isEditable) {
    return (
      <div className="bg-surface rounded-xl p-4">
        <h2 className="text-lg font-bold text-white mb-3">{t('settings.title')}</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">{t('start.goalTitle')}</span>
            <span className="text-white">{targetScore} {t('lobby.cardsToWin')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">{t('settings.turnTimeout')}</span>
            <span className="text-white">{formatTimeout(turnTimeout)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">{t('settings.autoPlay')}</span>
            <span className="text-white">{autoPlayOnDraw ? '✓' : '✗'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl p-4">
      <h2 className="text-lg font-bold text-white mb-3">{t('settings.title')}</h2>

      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400">{t('start.goalDescription')}</span>
        <select
          value={targetScore}
          onChange={(e) => onTargetScoreChange?.(Number(e.target.value))}
          className="bg-surface-light border border-surface-light rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
        >
          <option value={5}>{t('start.cards5')}</option>
          <option value={7}>{t('start.cards7')}</option>
          <option value={10}>{t('start.cards10')}</option>
          <option value={15}>{t('start.cards15')}</option>
        </select>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-white">{t('settings.turnTimeout')}</span>
          <p className="text-gray-500 text-sm">{t('settings.turnTimeoutDescription')}</p>
        </div>
        <select
          value={turnTimeout ?? 'off'}
          onChange={(e) => onTurnTimeoutChange?.(e.target.value === 'off' ? null : Number(e.target.value))}
          className="bg-surface-light border border-surface-light rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
        >
          <option value="off">{t('settings.timeoutOff')}</option>
          <option value={60}>{t('settings.timeout1min')}</option>
          <option value={120}>{t('settings.timeout2min')}</option>
          <option value={300}>{t('settings.timeout5min')}</option>
          <option value={600}>{t('settings.timeout10min')}</option>
        </select>
      </div>

      <label className="flex items-center justify-between cursor-pointer">
        <div>
          <span className="text-white">{t('settings.autoPlay')}</span>
          <p className="text-gray-500 text-sm">{t('settings.autoPlayDescription')}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={autoPlayOnDraw}
          onClick={() => onAutoPlayChange?.(!autoPlayOnDraw)}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
            autoPlayOnDraw ? 'bg-primary' : 'bg-surface-light'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              autoPlayOnDraw ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </label>
    </div>
  );
}
