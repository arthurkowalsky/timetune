import { HoldToRecordButton } from './HoldToRecordButton';
import { useTranslations } from '../../i18n';

interface VoiceRecorderProps {
  onRecordingComplete: (audioData: string) => void;
  onSkip: () => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onRecordingComplete, onSkip, disabled = false }: VoiceRecorderProps) {
  const { t } = useTranslations();

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-1">{t('voting.wantBonus')}</h3>
        <p className="text-gray-400">{t('voting.sayTitleOrArtist')}</p>
      </div>

      <HoldToRecordButton
        onComplete={onRecordingComplete}
        disabled={disabled}
      />

      <button
        onClick={onSkip}
        disabled={disabled}
        className="px-6 py-3 bg-surface-light/50 hover:bg-surface-light text-gray-300 hover:text-white rounded-xl font-medium transition-colors disabled:opacity-50"
      >
        {t('voting.skipBonus')}
      </button>
    </div>
  );
}
