import { useEffect, useState, useRef, startTransition } from 'react';
import { useGameStore } from './store';
import { loadSongs } from './songs';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { RecordingScreen } from './components/RecordingScreen';
import { RevealScreen } from './components/RevealScreen';
import { EndScreen } from './components/EndScreen';
import { useTranslations } from './i18n';
import { useMultiplayerStore, usePartySocket } from './multiplayer';
import {
  ModeSelector,
  OnlineMenu,
  CreateRoomForm,
  JoinRoomForm,
  Lobby,
  ConnectionStatus,
  DisconnectOverlay,
} from './components/multiplayer';
import { LocalGameProvider, OnlineGameProvider } from './contexts';
import { FloatingFullscreenButton } from './components/shared/FloatingFullscreenButton';
import { useFullscreen } from './hooks/useFullscreen';
import { MotionProvider } from './motion';

type OnlineStep = 'menu' | 'create' | 'join' | 'lobby';
type LocalStep = 'mode-select' | 'setup';

function AppContent() {
  const { phase, resetGame } = useGameStore();
  const { mode, setMode, roomState, roomCode, myPlayerId, reset: resetMultiplayer } = useMultiplayerStore();
  const { t } = useTranslations();
  const { reconnect } = usePartySocket();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const [isLoading, setIsLoading] = useState(true);
  const [songCount, setSongCount] = useState(0);
  const [onlineStep, setOnlineStep] = useState<OnlineStep>('menu');
  const [localStep, setLocalStep] = useState<LocalStep>('mode-select');
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectFailed, setReconnectFailed] = useState(false);
  const [pendingRoomCode, setPendingRoomCode] = useState<string | null>(null);
  const reconnectAttemptedRef = useRef(false);

  const isInActiveGame =
    (mode === 'local' && phase !== 'setup') ||
    (mode === 'online' && (roomState?.roomPhase === 'playing' || roomState?.roomPhase === 'finished'));

  useEffect(() => {
    loadSongs().then((songs) => {
      setSongCount(songs.length);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode && /^[A-Z0-9]{6}$/i.test(joinCode)) {
      const roomCode = joinCode.toUpperCase();
      startTransition(() => {
        setMode('online');
        setOnlineStep('join');
        setPendingRoomCode(roomCode);
      });
      window.history.replaceState({}, '', '/timetune/');
    }
  }, [setMode]);

  useEffect(() => {
    if (
      !isLoading &&
      mode === 'online' &&
      roomCode &&
      myPlayerId &&
      !roomState &&
      !reconnectAttemptedRef.current
    ) {
      reconnectAttemptedRef.current = true;
      startTransition(() => {
        setIsReconnecting(true);
        setReconnectFailed(false);
      });
      reconnect();

      const timeout = setTimeout(() => {
        const currentState = useMultiplayerStore.getState();
        if (!currentState.roomState) {
          setReconnectFailed(true);
        }
        setIsReconnecting(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [isLoading, mode, roomCode, myPlayerId, roomState, reconnect]);

  useEffect(() => {
    if (roomState) {
      startTransition(() => {
        setIsReconnecting(false);
        setReconnectFailed(false);
      });
    }
  }, [roomState]);

  if (isLoading) {
    return (
      <>
        {!isInActiveGame && <FloatingFullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />}
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">🎵</div>
            <p className="text-white text-xl">{t('app.loading')}</p>
          </div>
        </div>
      </>
    );
  }

  if (songCount === 0) {
    return (
      <>
        {!isInActiveGame && <FloatingFullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />}
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-white text-xl">{t('app.loadError')}</p>
          </div>
        </div>
      </>
    );
  }

  const handleSelectLocal = () => {
    resetGame();
    setMode('local');
    resetMultiplayer();
    setLocalStep('setup');
  };

  const handleSelectOnline = () => {
    setMode('online');
    setOnlineStep('menu');
  };

  const handleBackToModeSelect = () => {
    setMode('local');
    resetMultiplayer();
    setOnlineStep('menu');
    setLocalStep('mode-select');
    resetGame();
  };

  const handleBackToOnlineMenu = () => {
    setOnlineStep('menu');
  };

  const handleRoomCreatedOrJoined = () => {
    setOnlineStep('lobby');
  };

  const handleLeaveRoom = () => {
    resetMultiplayer();
    setOnlineStep('menu');
  };

  if (mode === 'local') {
    if (localStep === 'mode-select') {
      return (
        <>
          {!isInActiveGame && <FloatingFullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />}
          <ModeSelector
            onSelectLocal={handleSelectLocal}
            onSelectOnline={handleSelectOnline}
          />
        </>
      );
    }

    if (phase === 'setup') {
      return (
        <>
          {!isInActiveGame && <FloatingFullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />}
          <StartScreen onBack={handleBackToModeSelect} />
        </>
      );
    }

    return (
      <>
        {!isInActiveGame && <FloatingFullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />}
        <LocalGameProvider onExit={handleBackToModeSelect}>
          {(phase === 'playing' || phase === 'placing') && <GameScreen />}
          {phase === 'reveal' && <RevealScreen />}
          {phase === 'finished' && <EndScreen />}
        </LocalGameProvider>
      </>
    );
  }

  if (mode === 'online') {
    if (isReconnecting || reconnectFailed) {
      return (
        <>
          {!isInActiveGame && <FloatingFullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />}
          <div className="min-h-screen bg-bg flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              {isReconnecting ? (
                <>
                  <div className="text-6xl mb-4 animate-pulse">🔄</div>
                  <p className="text-white text-xl mb-2">{t('connection.reconnecting')}</p>
                  <p className="text-gray-400 text-sm">
                    {t('online.roomCode')}: <span className="font-mono text-primary">{roomCode}</span>
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">😔</div>
                  <p className="text-white text-xl mb-2">{t('error.reconnectFailed')}</p>
                  <p className="text-gray-400 text-sm mb-6">{t('error.roomMayNotExist')}</p>
                  <button
                    onClick={() => {
                      resetMultiplayer();
                      reconnectAttemptedRef.current = false;
                      setReconnectFailed(false);
                    }}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold transition-colors"
                  >
                    {t('common.back')}
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      );
    }

    const onlinePhase = roomState?.gameState.phase;
    const roomPhase = roomState?.roomPhase;

    if (roomPhase === 'playing' || roomPhase === 'finished') {
      return (
        <>
          {!isInActiveGame && <FloatingFullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />}
          <OnlineGameProvider onLeave={handleLeaveRoom}>
            <DisconnectOverlay />
            {(onlinePhase === 'playing' || onlinePhase === 'placing') && <GameScreen />}
            {onlinePhase === 'recording' && <RecordingScreen />}
            {onlinePhase === 'reveal' && <RevealScreen />}
            {onlinePhase === 'finished' && <EndScreen />}
          </OnlineGameProvider>
        </>
      );
    }

    if (roomState && roomPhase === 'waiting') {
      return (
        <>
          {!isInActiveGame && <FloatingFullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />}
          <ConnectionStatus />
          <DisconnectOverlay />
          <Lobby onLeave={handleLeaveRoom} />
        </>
      );
    }

    switch (onlineStep) {
      case 'menu':
        return (
          <>
            {!isInActiveGame && <FloatingFullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />}
            <OnlineMenu
              onCreateRoom={() => setOnlineStep('create')}
              onJoinRoom={() => setOnlineStep('join')}
              onBack={handleBackToModeSelect}
            />
          </>
        );
      case 'create':
        return (
          <>
            {!isInActiveGame && <FloatingFullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />}
            <ConnectionStatus />
            <CreateRoomForm
              onBack={handleBackToOnlineMenu}
              onRoomCreated={handleRoomCreatedOrJoined}
            />
          </>
        );
      case 'join':
        return (
          <>
            {!isInActiveGame && <FloatingFullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />}
            <ConnectionStatus />
            <JoinRoomForm
              onBack={handleBackToOnlineMenu}
              onRoomJoined={handleRoomCreatedOrJoined}
              initialRoomCode={pendingRoomCode}
            />
          </>
        );
      case 'lobby':
        return (
          <>
            {!isInActiveGame && <FloatingFullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />}
            <ConnectionStatus />
            <DisconnectOverlay />
            <Lobby onLeave={handleLeaveRoom} />
          </>
        );
      default:
        return (
          <>
            {!isInActiveGame && <FloatingFullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />}
            <OnlineMenu
              onCreateRoom={() => setOnlineStep('create')}
              onJoinRoom={() => setOnlineStep('join')}
              onBack={handleBackToModeSelect}
            />
          </>
        );
    }
  }

  return (
    <>
      {!isInActiveGame && <FloatingFullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />}
      <ModeSelector
        onSelectLocal={handleSelectLocal}
        onSelectOnline={handleSelectOnline}
      />
    </>
  );
}

function App() {
  return (
    <MotionProvider>
      <AppContent />
    </MotionProvider>
  );
}

export default App;
