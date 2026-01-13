import { useEffect, useCallback } from 'react';
import PartySocket from 'partysocket';
import { useMultiplayerStore } from './multiplayerStore';
import type { ClientMessage, ServerMessage } from './types';
import { PARTYKIT_HOST } from './config';

let globalSocket: PartySocket | null = null;
let messageQueue: ClientMessage[] = [];

export function usePartySocket() {
  const {
    roomCode,
    myPlayerId,
    handleServerMessage,
    setConnected,
    setConnecting,
    setConnectionError,
  } = useMultiplayerStore();

  const connect = useCallback((roomId: string) => {
    if (globalSocket) {
      globalSocket.close();
    }

    setConnecting(true);
    setConnectionError(null);
    messageQueue = [];

    globalSocket = new PartySocket({
      host: PARTYKIT_HOST,
      room: roomId.toLowerCase(),
    });

    globalSocket.addEventListener('open', () => {
      setConnected(true);
      setConnecting(false);
      while (messageQueue.length > 0) {
        const msg = messageQueue.shift()!;
        globalSocket?.send(JSON.stringify(msg));
      }
    });

    globalSocket.addEventListener('message', (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);
        handleServerMessage(message);
      } catch (e) {
        console.error('Failed to parse server message:', e);
      }
    });

    globalSocket.addEventListener('close', () => {
      setConnected(false);
    });

    globalSocket.addEventListener('error', () => {
      setConnectionError('error.connectionError');
    });
  }, [handleServerMessage, setConnected, setConnecting, setConnectionError]);

  const send = useCallback((message: ClientMessage) => {
    if (globalSocket?.readyState === WebSocket.OPEN) {
      globalSocket.send(JSON.stringify(message));
    } else {
      messageQueue.push(message);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (globalSocket) {
      globalSocket.close();
      globalSocket = null;
    }
    messageQueue = [];
    setConnected(false);
    setConnecting(false);
  }, [setConnected, setConnecting]);

  const reconnect = useCallback(() => {
    if (roomCode && myPlayerId) {
      connect(roomCode);
      setTimeout(() => {
        send({
          type: 'RECONNECT',
          payload: { playerId: myPlayerId },
        });
      }, 100);
    }
  }, [roomCode, myPlayerId, connect, send]);

  useEffect(() => {
    return () => {};
  }, []);

  return { connect, send, disconnect, reconnect };
}
