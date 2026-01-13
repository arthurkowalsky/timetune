import type { SongEra } from '../../types';
import { useTranslations } from '../../i18n';

interface EraOption {
  id: SongEra;
  icon: string;
  labelKey: string;
  subtitle: string;
}

const ERAS: EraOption[] = [
  { id: 'all', icon: '🎵', labelKey: 'era.all', subtitle: '1950–2025' },
  { id: 'oldSchool', icon: '📻', labelKey: 'era.oldSchool', subtitle: '–1989' },
  { id: 'newSchool', icon: '🔥', labelKey: 'era.newSchool', subtitle: '1990+' },
];

interface EraSelectorProps {
  selected: SongEra;
  onChange: (era: SongEra) => void;
  eraCounts: Record<SongEra, number>;
  isEditable?: boolean;
}

export function EraSelector({
  selected,
  onChange,
  eraCounts,
  isEditable = true,
}: EraSelectorProps) {
  const { t } = useTranslations();

  return (
    <div className="bg-surface rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-3">
        {t('era.title')}
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {ERAS.map((era) => {
          const isSelected = selected === era.id;
          const count = eraCounts[era.id];

          return (
            <button
              key={era.id}
              onClick={() => isEditable && onChange(era.id)}
              disabled={!isEditable}
              className={`
                relative flex flex-col items-center justify-center
                py-3 px-2 rounded-lg border-2 transition-all duration-200
                ${!isEditable ? 'cursor-default' : ''}
                ${isSelected
                  ? 'bg-primary/20 border-primary shadow-lg shadow-primary/20'
                  : isEditable
                    ? 'bg-surface-light border-transparent hover:border-surface-light hover:bg-surface'
                    : 'bg-surface-light border-transparent'
                }
              `}
            >
              <span className="text-2xl mb-1">{era.icon}</span>
              <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                {t(era.labelKey)}
              </span>
              <span className={`text-xs ${isSelected ? 'text-primary-light' : 'text-gray-500'}`}>
                {era.subtitle} ({count})
              </span>
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
