import type { SongCategory } from '../../types';
import { useTranslations } from '../../i18n';

interface CategoryOption {
  id: SongCategory;
  icon: string;
  labelKey: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'all', icon: '🎵', labelKey: 'category.all' },
  { id: 'polish', icon: '🇵🇱', labelKey: 'category.polish' },
  { id: 'international', icon: '🌍', labelKey: 'category.international' },
];

interface SongCategorySelectorProps {
  selected: SongCategory;
  onChange: (category: SongCategory) => void;
  songCounts: Record<SongCategory, number>;
  isEditable?: boolean;
}

export function SongCategorySelector({
  selected,
  onChange,
  songCounts,
  isEditable = true,
}: SongCategorySelectorProps) {
  const { t } = useTranslations();

  return (
    <div className="bg-surface rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-3">
        {t('category.title')}
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {CATEGORIES.map((category) => {
          const isSelected = selected === category.id;
          const count = songCounts[category.id];

          return (
            <button
              key={category.id}
              onClick={() => isEditable && onChange(category.id)}
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
              <span className="text-2xl mb-1">{category.icon}</span>
              <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                {t(category.labelKey)}
              </span>
              <span className={`text-xs ${isSelected ? 'text-primary-light' : 'text-gray-500'}`}>
                {count}
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
