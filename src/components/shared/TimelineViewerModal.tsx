import { Timeline } from '../Timeline';
import { useTranslations } from '../../i18n';
import type { Song } from '../../types';

interface TimelineViewerModalProps {
  playerName: string;
  timeline: Song[];
  onClose: () => void;
}

export function TimelineViewerModal({ playerName, timeline, onClose }: TimelineViewerModalProps) {
  const { t } = useTranslations();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl p-6 max-w-lg w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">
            {t('game.timelineOf')} {playerName}
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {timeline.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t('game.noCards')}</p>
          ) : (
            <Timeline songs={timeline} />
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-surface-light hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition-colors"
        >
          {t('game.close')}
        </button>
      </div>
    </div>
  );
}
