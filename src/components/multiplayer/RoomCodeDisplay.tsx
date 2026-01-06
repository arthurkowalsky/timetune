import { useState } from 'react';
import { useTranslations } from '../../i18n';

interface RoomCodeDisplayProps {
  code: string;
}

export function RoomCodeDisplay({ code }: RoomCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslations();

  const handleCopy = async () => {
    try {
      const shareUrl = `${window.location.origin}/timetune/join/${code}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="text-center mb-8">
      <p className="text-gray-400 mb-2">{t('lobby.roomCode')}</p>
      <button
        onClick={handleCopy}
        className="bg-surface px-8 py-4 rounded-xl group hover:bg-surface-light transition-colors"
      >
        <span className="text-4xl font-mono font-bold text-primary tracking-widest">
          {code}
        </span>
        <span className="block text-sm text-gray-500 mt-2 group-hover:text-primary transition-colors">
          {copied ? `✓ ${t('lobby.copied')}` : t('lobby.tapToCopy')}
        </span>
      </button>
    </div>
  );
}
