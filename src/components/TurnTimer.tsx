import { useState, useEffect, startTransition } from 'react';
import { m } from 'motion/react';
import { useMotionPreference } from '../motion';

interface TurnTimerProps {
  turnStartedAt: number | null;
  timeoutSeconds: number | null;
  isActive: boolean;
}

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getTimerColor(progress: number): string {
  if (progress > 0.3) return '#3B82F6';
  if (progress > 0.15) return '#F59E0B';
  return '#EF4444';
}

export function TurnTimer({ turnStartedAt, timeoutSeconds, isActive }: TurnTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const { shouldReduceMotion } = useMotionPreference();

  useEffect(() => {
    if (!isActive || !turnStartedAt || timeoutSeconds === null) {
      startTransition(() => {
        setRemainingSeconds(null);
      });
      return;
    }

    const updateRemaining = () => {
      const elapsed = Math.floor((Date.now() - turnStartedAt) / 1000);
      const remaining = Math.max(0, timeoutSeconds - elapsed);
      setRemainingSeconds(remaining);
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 100);
    return () => clearInterval(interval);
  }, [turnStartedAt, timeoutSeconds, isActive]);

  if (remainingSeconds === null || timeoutSeconds === null) {
    return <div className="w-10 h-10" />;
  }

  const progress = remainingSeconds / timeoutSeconds;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const color = getTimerColor(progress);
  const isUrgent = remainingSeconds <= 10;

  return (
    <m.div
      className="relative w-10 h-10"
      animate={isUrgent && !shouldReduceMotion ? {
        scale: [1, 1.1, 1],
      } : {}}
      transition={{
        duration: 0.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        className="drop-shadow-md"
      >
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="rgba(15, 23, 42, 0.9)"
          stroke="#374151"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            transition: shouldReduceMotion ? 'none' : 'stroke-dashoffset 0.1s linear, stroke 0.3s ease'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-xs font-bold tabular-nums"
          style={{ color }}
        >
          {remainingSeconds}
        </span>
      </div>
    </m.div>
  );
}
