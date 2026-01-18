import { useEffect, useRef, useCallback } from 'react';

interface UseTurnNotificationOptions {
  isMyTurn: boolean;
  isOnline: boolean;
  notificationTitle?: string;
  notificationBody?: string;
  enabled?: boolean;
}

function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    const playTone = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = audioContext.currentTime;
    playTone(587.33, now, 0.15);
    playTone(880, now + 0.15, 0.2);
  } catch {
    /* AudioContext may fail silently */
  }
}

function vibrate() {
  if ('vibrate' in navigator) {
    navigator.vibrate([100, 50, 100]);
  }
}

async function showBrowserNotification(title: string, body: string) {
  if (document.visibilityState === 'visible') return;

  if (!('Notification' in window)) return;

  const createNotification = () => {
    const notif = new Notification(title, {
      body,
      icon: '/timetune/icons/icon-192.png',
      tag: 'turn-notification',
    });
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  };

  if (Notification.permission === 'granted') {
    createNotification();
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      createNotification();
    }
  }
}

export function useTurnNotification({
  isMyTurn,
  isOnline,
  notificationTitle = 'TimeTune',
  notificationBody = 'Your turn!',
  enabled = true,
}: UseTurnNotificationOptions) {
  const wasMyTurnRef = useRef(isMyTurn);
  const hasNotifiedRef = useRef(false);

  const notify = useCallback(() => {
    if (!enabled || !isOnline) return;

    playNotificationSound();
    vibrate();
    showBrowserNotification(notificationTitle, notificationBody);
  }, [enabled, isOnline, notificationTitle, notificationBody]);

  useEffect(() => {
    if (isMyTurn && !wasMyTurnRef.current && !hasNotifiedRef.current) {
      notify();
      hasNotifiedRef.current = true;
    }

    if (!isMyTurn) {
      hasNotifiedRef.current = false;
    }

    wasMyTurnRef.current = isMyTurn;
  }, [isMyTurn, notify]);

  useEffect(() => {
    if (isOnline && enabled && 'Notification' in window && Notification.permission === 'default') {
      const handleInteraction = () => {
        Notification.requestPermission();
        document.removeEventListener('click', handleInteraction);
      };
      document.addEventListener('click', handleInteraction, { once: true });
      return () => document.removeEventListener('click', handleInteraction);
    }
  }, [isOnline, enabled]);

  return { notify };
}
