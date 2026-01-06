import type { Song } from '../types';
import { useTranslations } from '../i18n';

interface TimelineProps {
  songs: Song[];
  onSelectPosition?: (position: number) => void;
  isInteractive?: boolean;
  selectedPosition?: number | null;
  highlightPosition?: number | null;
  previewPosition?: number | null;
}

export function Timeline({
  songs,
  onSelectPosition,
  isInteractive = false,
  selectedPosition = null,
  highlightPosition = null,
  previewPosition = null,
}: TimelineProps) {
  const { t } = useTranslations();

  const sortedSongs = [...songs].sort((a, b) => a.year - b.year);

  if (sortedSongs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('timeline.empty')}
      </div>
    );
  }

  const showPreview = !isInteractive && previewPosition !== null;

  return (
    <div className="relative">
      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-surface-light -translate-x-1/2" />

      <div className="relative space-y-2">
        {isInteractive && (
          <PlacementSlot
            position={0}
            onSelect={onSelectPosition!}
            isSelected={selectedPosition === 0}
            isHighlighted={highlightPosition === 0}
            isFirst
          />
        )}
        {showPreview && previewPosition === 0 && <PreviewMarker />}

        {sortedSongs.map((song, index) => (
          <div key={song.id}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-16 sm:w-20 text-right shrink-0">
                <span className="bg-primary text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                  {song.year}
                </span>
              </div>
              <div className="w-4 h-4 bg-primary rounded-full border-4 border-bg z-10 shrink-0" />
              <div className="flex-1 bg-surface rounded-lg px-3 sm:px-4 py-2 sm:py-3 min-w-0">
                <div className="font-bold text-white text-sm sm:text-base truncate">{song.title}</div>
                <div className="text-gray-400 text-xs sm:text-sm truncate">{song.artist}</div>
              </div>
            </div>
            {isInteractive && (
              <PlacementSlot
                position={index + 1}
                onSelect={onSelectPosition!}
                isSelected={selectedPosition === index + 1}
                isHighlighted={highlightPosition === index + 1}
              />
            )}
            {showPreview && previewPosition === index + 1 && <PreviewMarker />}
          </div>
        ))}
      </div>
    </div>
  );
}

interface PlacementSlotProps {
  position: number;
  onSelect: (position: number) => void;
  isSelected: boolean;
  isHighlighted: boolean;
  isFirst?: boolean;
}

function PlacementSlot({ position, onSelect, isSelected, isHighlighted, isFirst }: PlacementSlotProps) {
  const { t } = useTranslations();

  const handleClick = () => {
    onSelect(position);
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const getSlotStyles = () => {
    if (isHighlighted) {
      return {
        circle: 'bg-primary border-primary scale-110',
        dot: 'bg-white',
        box: 'border-primary bg-primary/20 text-primary'
      };
    }
    if (isSelected) {
      return {
        circle: 'bg-primary border-solid border-primary scale-110 ring-4 ring-primary/30 animate-pulse',
        dot: 'bg-white',
        box: 'border-solid border-primary border-3 bg-primary/30 text-white font-bold shadow-lg shadow-primary/20'
      };
    }
    return {
      circle: 'border-gray-500 group-hover:border-primary group-hover:bg-primary/20 group-active:scale-95',
      dot: 'bg-gray-500 group-hover:bg-primary',
      box: 'border-gray-600 text-gray-500 group-hover:border-primary group-hover:bg-primary/10 group-hover:text-primary group-active:scale-[0.98]'
    };
  };

  const styles = getSlotStyles();

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-3 sm:gap-4 py-2 group"
    >
      <div className="w-16 sm:w-20 shrink-0" />
      <div
        className={`
          w-12 h-12 rounded-full border-2 transition-all z-10 shrink-0
          flex items-center justify-center
          ${isSelected ? '' : 'border-dashed'}
          ${styles.circle}
        `}
      >
        <div className={`w-3 h-3 rounded-full ${styles.dot}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`
          h-14 sm:h-16 border-2 rounded-lg flex items-center justify-center transition-all
          text-sm sm:text-base px-2
          ${isSelected ? '' : 'border-dashed'}
          ${styles.box}
        `}>
          {isSelected ? `✓ ${t('timeline.selected')}` : (isFirst ? t('timeline.placeHereOldest') : t('timeline.placeHere'))}
        </div>
      </div>
    </button>
  );
}

function PreviewMarker() {
  const { t } = useTranslations();

  return (
    <div className="w-full flex items-center gap-3 sm:gap-4 py-2 animate-pulse">
      <div className="w-16 sm:w-20 shrink-0" />
      <div className="w-12 h-12 rounded-full border-2 border-dashed border-amber-500 bg-amber-500/20 z-10 shrink-0 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-amber-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="h-14 sm:h-16 border-2 border-dashed border-amber-500 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400 text-sm sm:text-base px-2">
          {t('timeline.considering')}
        </div>
      </div>
    </div>
  );
}
