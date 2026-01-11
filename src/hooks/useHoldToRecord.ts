import { useState, useCallback, useRef, useEffect } from 'react';

interface UseHoldToRecordOptions {
  maxDuration?: number;
  onComplete: (audioData: string) => void;
  onCancel?: () => void;
}

interface UseHoldToRecordReturn {
  isRecording: boolean;
  duration: number;
  progress: number;
  audioLevel: number;
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    onMouseLeave: () => void;
  };
  isSupported: boolean;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unknown';
  error: string | null;
}

const DEFAULT_MAX_DURATION = 10000;

export function useHoldToRecord(options: UseHoldToRecordOptions): UseHoldToRecordReturn {
  const { maxDuration = DEFAULT_MAX_DURATION, onComplete, onCancel } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const maxDurationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCancelledRef = useRef(false);
  const buttonRectRef = useRef<DOMRect | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onCancelRef.current = onCancel;
  }, [onComplete, onCancel]);

  const isSupported = typeof MediaRecorder !== 'undefined' && typeof navigator.mediaDevices !== 'undefined';

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (maxDurationTimeoutRef.current) {
      clearTimeout(maxDurationTimeoutRef.current);
      maxDurationTimeoutRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setDuration(0);
    setAudioLevel(0);
  }, []);

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setAudioLevel(Math.min(100, average * 1.5));

    animationFrameRef.current = requestAnimationFrame(() => {
      // Use the function reference from the current closure
      if (analyserRef.current) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAudioLevel(Math.min(100, avg * 1.5));
        animationFrameRef.current = requestAnimationFrame(arguments.callee as FrameRequestCallback);
      }
    });
  }, []);

  const startRecording = useCallback(async (buttonElement: HTMLElement | null): Promise<boolean> => {
    if (!isSupported) {
      setError('Recording not supported');
      return false;
    }

    try {
      setError(null);
      isCancelledRef.current = false;

      if (buttonElement) {
        buttonRectRef.current = buttonElement.getBoundingClientRect();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionState('granted');

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);

        if (isCancelledRef.current) {
          cleanup();
          onCancelRef.current?.();
          return;
        }

        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          cleanup();
          onCompleteRef.current(base64);
        };
        reader.onerror = () => {
          cleanup();
          setError('Failed to process recording');
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      startTimeRef.current = Date.now();

      updateAudioLevel();

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDuration(Math.min(maxDuration, elapsed));
      }, 50);

      maxDurationTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, maxDuration);

      return true;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setPermissionState('denied');
        setError('Microphone access denied');
      } else {
        setError('Failed to start recording');
      }
      cleanup();
      return false;
    }
  }, [isSupported, cleanup, updateAudioLevel, maxDuration]);

  const stopRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  }, []);

  const cancelRecording = useCallback(() => {
    isCancelledRef.current = true;
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    } else {
      cleanup();
    }
  }, [cleanup]);

  const isOutsideButton = useCallback((clientX: number, clientY: number): boolean => {
    if (!buttonRectRef.current) return false;
    const rect = buttonRectRef.current;
    const margin = 50;
    return (
      clientX < rect.left - margin ||
      clientX > rect.right + margin ||
      clientY < rect.top - margin ||
      clientY > rect.bottom + margin
    );
  }, []);

  const handlers = {
    onTouchStart: useCallback((e: React.TouchEvent) => {
      e.preventDefault();
      startRecording(e.currentTarget as HTMLElement);
    }, [startRecording]),

    onTouchEnd: useCallback((e: React.TouchEvent) => {
      e.preventDefault();
      if (!isCancelledRef.current) {
        stopRecording();
      }
    }, [stopRecording]),

    onTouchMove: useCallback((e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (touch && isOutsideButton(touch.clientX, touch.clientY)) {
        cancelRecording();
      }
    }, [isOutsideButton, cancelRecording]),

    onMouseDown: useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      startRecording(e.currentTarget as HTMLElement);
    }, [startRecording]),

    onMouseUp: useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      if (!isCancelledRef.current) {
        stopRecording();
      }
    }, [stopRecording]),

    onMouseLeave: useCallback(() => {
      if (isRecording) {
        cancelRecording();
      }
    }, [isRecording, cancelRecording]),
  };

  const progress = (duration / maxDuration) * 100;

  return {
    isRecording,
    duration,
    progress,
    audioLevel,
    handlers,
    isSupported,
    permissionState,
    error,
  };
}
