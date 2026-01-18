import { m } from 'motion/react';
import { useTranslations } from '../../i18n';
import {
  useMotionPreference,
  screenSlideUp,
  slideIn,
  staggerContainer,
  staggerItem
} from '../../motion';

interface ModeSelectorProps {
  onSelectLocal: () => void;
  onSelectOnline: () => void;
}

export function ModeSelector({ onSelectLocal, onSelectOnline }: ModeSelectorProps) {
  const { t, locale, toggleLocale } = useTranslations();
  const { getVariants } = useMotionPreference();

  return (
    <m.div
      className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 relative"
      variants={getVariants(screenSlideUp)}
      initial="hidden"
      animate="visible"
    >
      <m.button
        onClick={toggleLocale}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-4 left-4 text-3xl"
        aria-label={locale === 'pl' ? 'Switch to English' : 'Przełącz na polski'}
      >
        {locale === 'pl' ? '🇵🇱' : '🇺🇸'}
      </m.button>

      <m.div
        className="max-w-md w-full"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <m.div className="text-center mb-8" variants={getVariants(slideIn)}>
          <h1 className="text-5xl font-black text-white mb-2">
            🎵 {t('app.name').toUpperCase()}
          </h1>
          <p className="text-gray-400 text-lg">{t('app.subtitle')}</p>
        </m.div>

        <div className="space-y-4">
          <m.button
            onClick={onSelectLocal}
            variants={staggerItem}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-surface hover:bg-surface-light rounded-xl p-6 text-left transition-colors group"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">📱</span>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                  {t('mode.local')}
                </h3>
                <p className="text-gray-400 text-sm">
                  {t('mode.localDescription')}
                </p>
              </div>
            </div>
          </m.button>

          <m.button
            onClick={onSelectOnline}
            variants={staggerItem}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-surface hover:bg-surface-light rounded-xl p-6 text-left transition-colors group"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">🌐</span>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                  {t('mode.online')}
                </h3>
                <p className="text-gray-400 text-sm">
                  {t('mode.onlineDescription')}
                </p>
              </div>
            </div>
          </m.button>
        </div>

        <m.div className="mt-8 text-center text-gray-500 text-sm" variants={staggerItem}>
          <p className="mb-2">📋 {t('start.rulesTitle')}</p>
          <p>{t('start.rulesDescription')}</p>
        </m.div>
      </m.div>
    </m.div>
  );
}
