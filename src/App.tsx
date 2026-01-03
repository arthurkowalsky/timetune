import { useEffect, useState } from 'react';
import { useGameStore } from './store';
import { loadSongs } from './songs';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { RevealScreen } from './components/RevealScreen';
import { EndScreen } from './components/EndScreen';
import { useTranslations } from './i18n';

function App() {
  const { phase } = useGameStore();
  const { t } = useTranslations();
  const [isLoading, setIsLoading] = useState(true);
  const [songCount, setSongCount] = useState(0);

  useEffect(() => {
    loadSongs().then((songs) => {
      setSongCount(songs.length);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🎵</div>
          <p className="text-white text-xl">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  if (songCount === 0) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-white text-xl">{t('app.loadError')}</p>
        </div>
      </div>
    );
  }

  switch (phase) {
    case 'setup':
      return <StartScreen />;
    case 'playing':
    case 'placing':
      return <GameScreen />;
    case 'reveal':
      return <RevealScreen />;
    case 'finished':
      return <EndScreen />;
    default:
      return <StartScreen />;
  }
}

export default App;
