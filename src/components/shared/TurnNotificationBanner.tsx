import { useEffect, useState, useRef } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { useTranslations } from '../../i18n';
import { useMotionPreference } from '../../motion';

interface TurnNotificationBannerProps {
  isMyTurn: boolean;
  isOnline: boolean;
}

export function TurnNotificationBanner({ isMyTurn, isOnline }: TurnNotificationBannerProps) {
  const [show, setShow] = useState(false);
  const wasMyTurnRef = useRef(isMyTurn);
  const { t } = useTranslations();
  const { shouldReduceMotion } = useMotionPreference();

  useEffect(() => {
    if (!isOnline) return;

    if (isMyTurn && !wasMyTurnRef.current) {
      const showTimer = setTimeout(() => setShow(true), 0);
      const hideTimer = setTimeout(() => setShow(false), 3000);
      wasMyTurnRef.current = true;
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }

    if (!isMyTurn) {
      wasMyTurnRef.current = false;
    }
  }, [isMyTurn, isOnline]);

  return (
    <AnimatePresence>
      {show && (
        <m.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -50, scale: 0.9 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="bg-primary text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <span className="text-2xl">🎵</span>
            <span className="font-bold text-lg">{t('notification.yourTurnBanner')}</span>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
