import { useState, useEffect, startTransition } from 'react';

interface TurnTimerProps {
  turnStartedAt: number | null;
  timeoutSeconds: number | null;
  isActive: boolean;
}

export function TurnTimer({ turnStartedAt, timeoutSeconds, isActive }: TurnTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

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
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [turnStartedAt, timeoutSeconds, isActive]);

  if (remainingSeconds === null) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const isUrgent = remainingSeconds <= 30;

  return (
    <div
      className={`fixed top-4 right-4 z-30 px-3 py-1.5 rounded-lg text-sm font-mono ${
        isUrgent
          ? 'bg-red-600/80 text-white animate-pulse'
          : 'bg-surface/80 text-gray-300'
      }`}
    >
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}
