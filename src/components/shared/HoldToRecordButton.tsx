import { useHoldToRecord } from '../../hooks/useHoldToRecord';
import { useTranslations } from '../../i18n';

interface HoldToRecordButtonProps {
  onComplete: (audioData: string) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

const BUTTON_SIZE = 128;
const RING_RADIUS = 58;
const RING_STROKE = 6;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function AudioWaveform({ level }: { level: number }) {
  const bars = [0.6, 1, 0.8, 0.9, 0.5].map((multiplier, i) => {
    const height = Math.max(8, (level * multiplier * 0.4));
    return (
      <div
        key={i}
        className="w-1.5 bg-white rounded-full transition-all duration-75"
        style={{ height: `${height}px` }}
      />
    );
  });

  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {bars}
    </div>
  );
}

export function HoldToRecordButton({ onComplete, onCancel, disabled = false }: HoldToRecordButtonProps) {
  const { t } = useTranslations();

  const {
    isRecording,
    duration,
    progress,
    audioLevel,
    handlers,
    isSupported,
    permissionState,
    error,
  } = useHoldToRecord({
    maxDuration: 10000,
    onComplete,
    onCancel,
  });

  if (!isSupported) {
    return (
      <div className="text-center text-gray-400">
        <p>{t('voting.notSupported')}</p>
      </div>
    );
  }

  if (permissionState === 'denied') {
    return (
      <div className="text-center text-red-400">
        <p>{t('voting.microphoneDenied')}</p>
      </div>
    );
  }

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress / 100);
  const durationSeconds = (duration / 1000).toFixed(1);

  return (
    <div className="flex flex-col items-center gap-4">
      {error && <p className="text-red-400 text-sm">{t(error)}</p>}

      <div
        className="relative select-none touch-none"
        style={{ width: BUTTON_SIZE, height: BUTTON_SIZE }}
      >
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox={`0 0 ${BUTTON_SIZE} ${BUTTON_SIZE}`}
        >
          <circle
            cx={BUTTON_SIZE / 2}
            cy={BUTTON_SIZE / 2}
            r={RING_RADIUS}
            stroke="currentColor"
            strokeWidth={RING_STROKE}
            fill="none"
            className="text-surface-light"
          />
          <circle
            cx={BUTTON_SIZE / 2}
            cy={BUTTON_SIZE / 2}
            r={RING_RADIUS}
            stroke="currentColor"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            fill="none"
            className={`transition-all duration-100 ${isRecording ? 'text-red-500' : 'text-primary'}`}
          />
        </svg>

        <button
          {...handlers}
          disabled={disabled}
          className={`
            absolute inset-3 rounded-full
            flex flex-col items-center justify-center
            transition-all duration-150
            ${isRecording
              ? 'bg-red-500 scale-105'
              : 'bg-surface-light hover:bg-surface active:scale-95'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {isRecording ? (
            <>
              <AudioWaveform level={audioLevel} />
              <span className="text-white font-mono text-sm mt-1">{durationSeconds}s</span>
            </>
          ) : (
            <>
              <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.06 7.44-7 7.93V22h-2v-6.07z" />
              </svg>
              <span className="text-gray-400 text-xs mt-1">{t('voting.holdToRecord')}</span>
            </>
          )}
        </button>

        {isRecording && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-2 rounded-full bg-red-500/20 animate-ping" />
          </div>
        )}
      </div>

      <p className="text-gray-400 text-sm text-center">
        {isRecording ? t('voting.releaseToSend') : t('voting.sayTitleOrArtist')}
      </p>

      {isRecording && (
        <p className="text-gray-500 text-xs text-center">
          {t('voting.dragToCancel')}
        </p>
      )}
    </div>
  );
}
