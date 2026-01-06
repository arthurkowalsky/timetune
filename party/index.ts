import type * as Party from 'partykit/server';
import type {
  RoomState,
  OnlinePlayer,
  OnlineGameState,
  ClientMessage,
  ServerMessage,
  ErrorCode,
} from '../src/multiplayer/types';
import type { Song } from '../src/types';

const ROOM_CONFIG = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 8,
  TURN_TIMEOUT_MS: 60_000,
  RECONNECT_TIMEOUT_MS: 60_000,
};

function generateUUID(): string {
  return crypto.randomUUID();
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default class TimeTuneRoom implements Party.Server {
  constructor(readonly room: Party.Room) {}

  roomState: RoomState | null = null;
  connections: Map<string, { playerId: string; lastHeartbeat: number }> =
    new Map();
  turnTimeoutId: ReturnType<typeof setTimeout> | null = null;
  disconnectTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();
  pendingDeck: Song[] | null = null;

  async onStart() {
    const stored = await this.room.storage.get<RoomState>('state');
    if (stored) {
      this.roomState = stored;
    }
  }

  async onConnect(conn: Party.Connection) {
    this.connections.set(conn.id, { playerId: '', lastHeartbeat: Date.now() });
  }

  async onClose(conn: Party.Connection) {
    const connectionInfo = this.connections.get(conn.id);
    if (!connectionInfo?.playerId || !this.roomState) {
      this.connections.delete(conn.id);
      return;
    }

    const player = this.roomState.gameState.players.find(
      (p) => p.id === connectionInfo.playerId
    );

    if (player) {
      player.isConnected = false;
      player.lastSeen = Date.now();

      this.broadcast({
        type: 'PLAYER_DISCONNECTED',
        payload: { playerId: player.id },
      });

      const timeout = setTimeout(() => {
        this.handlePlayerTimeout(player.id);
      }, ROOM_CONFIG.RECONNECT_TIMEOUT_MS);

      this.disconnectTimeouts.set(player.id, timeout);
      await this.persistState();
    }

    this.connections.delete(conn.id);
  }

  async onMessage(message: string, sender: Party.Connection) {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(message);
    } catch {
      return;
    }

    switch (msg.type) {
      case 'CREATE_ROOM':
        await this.handleCreateRoom(sender, msg.payload);
        break;
      case 'JOIN_ROOM':
        await this.handleJoinRoom(sender, msg.payload);
        break;
      case 'RECONNECT':
        await this.handleReconnect(sender, msg.payload);
        break;
      case 'LEAVE_ROOM':
        await this.handleLeaveRoom(sender);
        break;
      case 'KICK_PLAYER':
        await this.handleKickPlayer(sender, msg.payload);
        break;
      case 'SET_READY':
        await this.handleSetReady(sender, msg.payload);
        break;
      case 'START_GAME':
        await this.handleStartGame(sender);
        break;
      case 'UPDATE_SETTINGS':
        await this.handleUpdateSettings(sender, msg.payload);
        break;
      case 'DRAW_CARD':
        await this.handleDrawCard(sender);
        break;
      case 'PLACE_SONG':
        await this.handlePlaceSong(sender, msg.payload);
        break;
      case 'CLAIM_BONUS':
        await this.handleClaimBonus(sender);
        break;
      case 'NEXT_TURN':
        await this.handleNextTurn(sender);
        break;
      case 'HEARTBEAT':
        this.handleHeartbeat(sender);
        break;
      case 'REQUEST_SYNC':
        this.handleRequestSync(sender);
        break;
      case 'POSITION_PREVIEW':
        await this.handlePositionPreview(sender, msg.payload);
        break;
      case 'MUSIC_STARTED':
        await this.handleMusicStarted(sender);
        break;
    }
  }

  private async handleCreateRoom(
    conn: Party.Connection,
    payload: { playerName: string }
  ) {
    const roomCode = this.room.id.toUpperCase();
    const playerId = generateUUID();

    const player: OnlinePlayer = {
      id: playerId,
      name: payload.playerName,
      timeline: [],
      bonusPoints: 0,
      connectionId: conn.id,
      isHost: true,
      isConnected: true,
      lastSeen: Date.now(),
      isReady: true,
    };

    const gameState: OnlineGameState = {
      players: [player],
      currentPlayerIndex: 0,
      deck: [],
      currentSong: null,
      phase: 'setup',
      lastGuessCorrect: null,
      targetScore: 10,
      turnStartedAt: null,
      turnTimeout: 300,
      previewPosition: null,
      autoPlayOnDraw: false,
    };

    this.roomState = {
      roomId: this.room.id,
      roomCode,
      hostId: conn.id,
      createdAt: Date.now(),
      maxPlayers: ROOM_CONFIG.MAX_PLAYERS,
      isPrivate: false,
      roomPhase: 'waiting',
      gameState,
      version: 1,
      lastUpdated: Date.now(),
    };

    this.connections.set(conn.id, { playerId, lastHeartbeat: Date.now() });

    const response: ServerMessage = {
      type: 'ROOM_CREATED',
      payload: {
        roomCode,
        playerId,
        roomState: this.roomState,
      },
    };
    conn.send(JSON.stringify(response));

    await this.persistState();
  }

  private async handleJoinRoom(
    conn: Party.Connection,
    payload: { playerName: string }
  ) {
    if (!this.roomState) {
      this.sendError(conn, 'ROOM_NOT_FOUND', 'Room not found');
      return;
    }

    if (this.roomState.roomPhase !== 'waiting') {
      this.sendError(conn, 'GAME_ALREADY_STARTED', 'Game already in progress');
      return;
    }

    if (
      this.roomState.gameState.players.length >= this.roomState.maxPlayers
    ) {
      this.sendError(conn, 'ROOM_FULL', 'Room is full');
      return;
    }

    const nameTaken = this.roomState.gameState.players.some(
      (p) => p.name.toLowerCase() === payload.playerName.toLowerCase()
    );
    if (nameTaken) {
      this.sendError(conn, 'PLAYER_NAME_TAKEN', 'Name already taken');
      return;
    }

    const playerId = generateUUID();
    const player: OnlinePlayer = {
      id: playerId,
      name: payload.playerName,
      timeline: [],
      bonusPoints: 0,
      connectionId: conn.id,
      isHost: false,
      isConnected: true,
      lastSeen: Date.now(),
      isReady: false,
    };

    this.roomState.gameState.players.push(player);
    this.roomState.version++;
    this.roomState.lastUpdated = Date.now();

    this.connections.set(conn.id, { playerId, lastHeartbeat: Date.now() });

    const joinResponse: ServerMessage = {
      type: 'ROOM_JOINED',
      payload: { playerId, roomState: this.roomState },
    };
    conn.send(JSON.stringify(joinResponse));

    this.broadcastExcept(conn.id, {
      type: 'PLAYER_JOINED',
      payload: { player },
    });

    await this.persistState();
  }

  private async handleReconnect(
    conn: Party.Connection,
    payload: { playerId: string }
  ) {
    if (!this.roomState) {
      this.sendError(conn, 'ROOM_NOT_FOUND', 'Room not found');
      return;
    }

    const player = this.roomState.gameState.players.find(
      (p) => p.id === payload.playerId
    );
    if (!player) {
      this.sendError(conn, 'ROOM_NOT_FOUND', 'Player not found in room');
      return;
    }

    const existingTimeout = this.disconnectTimeouts.get(player.id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.disconnectTimeouts.delete(player.id);
    }

    player.connectionId = conn.id;
    player.isConnected = true;
    player.lastSeen = Date.now();

    if (player.isHost) {
      this.roomState.hostId = conn.id;
    }

    this.connections.set(conn.id, {
      playerId: player.id,
      lastHeartbeat: Date.now(),
    });

    const response: ServerMessage = {
      type: 'ROOM_JOINED',
      payload: { playerId: player.id, roomState: this.roomState },
    };
    conn.send(JSON.stringify(response));

    this.broadcastExcept(conn.id, {
      type: 'PLAYER_RECONNECTED',
      payload: { playerId: player.id },
    });

    await this.persistState();
  }

  private async handleLeaveRoom(conn: Party.Connection) {
    if (!this.roomState) return;

    const connectionInfo = this.connections.get(conn.id);
    if (!connectionInfo?.playerId) return;

    const playerIndex = this.roomState.gameState.players.findIndex(
      (p) => p.id === connectionInfo.playerId
    );
    if (playerIndex === -1) return;

    const player = this.roomState.gameState.players[playerIndex];
    const wasHost = player.isHost;
    const wasCurrentPlayer =
      playerIndex === this.roomState.gameState.currentPlayerIndex;

    this.roomState.gameState.players.splice(playerIndex, 1);

    if (this.roomState.gameState.players.length === 0) {
      await this.room.storage.delete('state');
      this.roomState = null;
      return;
    }

    if (wasHost && this.roomState.gameState.players.length > 0) {
      const newHost = this.roomState.gameState.players[0];
      newHost.isHost = true;
      newHost.isReady = true;
      this.roomState.hostId = newHost.connectionId;

      this.broadcast({
        type: 'HOST_CHANGED',
        payload: {
          newHostId: newHost.connectionId,
          newHostPlayerId: newHost.id,
        },
      });
    }

    if (
      wasCurrentPlayer &&
      this.roomState.roomPhase === 'playing'
    ) {
      this.roomState.gameState.currentPlayerIndex =
        this.roomState.gameState.currentPlayerIndex %
        this.roomState.gameState.players.length;
      this.roomState.gameState.phase = 'playing';
      this.roomState.gameState.currentSong = null;
    }

    this.broadcast({
      type: 'PLAYER_LEFT',
      payload: { playerId: connectionInfo.playerId, reason: 'left' },
    });

    this.connections.delete(conn.id);
    await this.persistState();
  }

  private async handleKickPlayer(
    conn: Party.Connection,
    payload: { playerId: string }
  ) {
    if (!this.roomState) return;

    if (this.roomState.hostId !== conn.id) {
      this.sendError(conn, 'NOT_HOST', 'Only host can kick players');
      return;
    }

    const playerIndex = this.roomState.gameState.players.findIndex(
      (p) => p.id === payload.playerId
    );
    if (playerIndex === -1) return;

    const player = this.roomState.gameState.players[playerIndex];
    if (player.isHost) return;

    this.roomState.gameState.players.splice(playerIndex, 1);

    for (const [connId, info] of this.connections) {
      if (info.playerId === payload.playerId) {
        const kickedConn = [...this.room.getConnections()].find(
          (c) => c.id === connId
        );
        if (kickedConn) {
          this.sendError(
            kickedConn,
            'ROOM_NOT_FOUND',
            'You have been kicked from the room'
          );
          kickedConn.close();
        }
        this.connections.delete(connId);
        break;
      }
    }

    this.broadcast({
      type: 'PLAYER_LEFT',
      payload: { playerId: payload.playerId, reason: 'kicked' },
    });

    await this.persistState();
  }

  private async handleSetReady(
    conn: Party.Connection,
    payload: { isReady: boolean }
  ) {
    if (!this.roomState) return;

    const connectionInfo = this.connections.get(conn.id);
    if (!connectionInfo?.playerId) return;

    const player = this.roomState.gameState.players.find(
      (p) => p.id === connectionInfo.playerId
    );
    if (!player || player.isHost) return;

    player.isReady = payload.isReady;
    this.roomState.version++;
    this.roomState.lastUpdated = Date.now();

    this.broadcast({
      type: 'PLAYER_READY_CHANGED',
      payload: { playerId: player.id, isReady: payload.isReady },
    });

    await this.persistState();
  }

  private async handleStartGame(conn: Party.Connection) {
    if (!this.roomState) return;

    if (this.roomState.hostId !== conn.id) {
      this.sendError(conn, 'NOT_HOST', 'Only host can start the game');
      return;
    }

    const players = this.roomState.gameState.players;
    if (players.length < ROOM_CONFIG.MIN_PLAYERS) {
      this.sendError(
        conn,
        'NOT_ENOUGH_PLAYERS',
        `Need at least ${ROOM_CONFIG.MIN_PLAYERS} players`
      );
      return;
    }

    const allReady = players.every((p) => p.isReady || p.isHost);
    if (!allReady) {
      this.sendError(conn, 'PLAYERS_NOT_READY', 'Not all players are ready');
      return;
    }

    if (!this.pendingDeck || this.pendingDeck.length === 0) {
      this.sendError(conn, 'INVALID_ACTION', 'No songs provided');
      return;
    }

    const shuffledDeck = shuffleArray(this.pendingDeck);

    const playersWithCards = players.map((player) => ({
      ...player,
      timeline: [shuffledDeck.pop()!],
      bonusPoints: 0,
    }));

    this.roomState.gameState = {
      ...this.roomState.gameState,
      players: playersWithCards,
      deck: shuffledDeck,
      phase: 'playing',
      currentPlayerIndex: 0,
      currentSong: null,
      lastGuessCorrect: null,
      turnStartedAt: Date.now(),
    };
    this.roomState.roomPhase = 'playing';
    this.roomState.version++;
    this.roomState.lastUpdated = Date.now();

    this.pendingDeck = null;

    this.broadcast({
      type: 'GAME_STARTED',
      payload: { gameState: this.roomState.gameState },
    });

    await this.persistState();
    await this.startTurnTimeout();
  }

  private async handleUpdateSettings(
    conn: Party.Connection,
    payload: { targetScore?: number; maxPlayers?: number; deck?: Song[]; turnTimeout?: number | null; autoPlayOnDraw?: boolean }
  ) {
    if (!this.roomState) return;

    if (this.roomState.hostId !== conn.id) {
      this.sendError(conn, 'NOT_HOST', 'Only host can update settings');
      return;
    }

    if (payload.targetScore !== undefined) {
      this.roomState.gameState.targetScore = payload.targetScore;
    }
    if (payload.maxPlayers !== undefined) {
      this.roomState.maxPlayers = payload.maxPlayers;
    }
    if (payload.deck !== undefined) {
      this.pendingDeck = payload.deck;
    }
    if (payload.turnTimeout !== undefined) {
      this.roomState.gameState.turnTimeout = payload.turnTimeout;
    }
    if (payload.autoPlayOnDraw !== undefined) {
      this.roomState.gameState.autoPlayOnDraw = payload.autoPlayOnDraw;
    }

    this.roomState.version++;
    this.roomState.lastUpdated = Date.now();

    if (payload.targetScore !== undefined || payload.maxPlayers !== undefined || payload.turnTimeout !== undefined || payload.autoPlayOnDraw !== undefined) {
      this.broadcast({
        type: 'SETTINGS_UPDATED',
        payload: {
          targetScore: this.roomState.gameState.targetScore,
          maxPlayers: this.roomState.maxPlayers,
          turnTimeout: this.roomState.gameState.turnTimeout,
          autoPlayOnDraw: this.roomState.gameState.autoPlayOnDraw,
        },
      });
    }

    await this.persistState();
  }

  private async handleDrawCard(conn: Party.Connection) {
    if (!this.roomState) return;

    const connectionInfo = this.connections.get(conn.id);
    const currentPlayer =
      this.roomState.gameState.players[
        this.roomState.gameState.currentPlayerIndex
      ];

    if (connectionInfo?.playerId !== currentPlayer.id) {
      this.sendError(conn, 'NOT_YOUR_TURN', 'Not your turn');
      return;
    }

    if (this.roomState.gameState.phase !== 'playing') {
      this.sendError(conn, 'INVALID_ACTION', 'Cannot draw card now');
      return;
    }

    const deck = this.roomState.gameState.deck;
    if (deck.length === 0) {
      await this.handleGameFinished();
      return;
    }

    const [nextCard, ...remainingDeck] = deck;

    this.roomState.gameState.currentSong = nextCard;
    this.roomState.gameState.deck = remainingDeck;
    this.roomState.gameState.phase = 'placing';
    this.roomState.version++;
    this.roomState.lastUpdated = Date.now();

    this.broadcast({
      type: 'CARD_DRAWN',
      payload: {
        playerId: currentPlayer.id,
        song: nextCard,
      },
    });

    this.clearTurnTimeout();
    await this.persistState();
  }

  private async handlePlaceSong(
    conn: Party.Connection,
    payload: { position: number }
  ) {
    if (!this.roomState) return;

    const connectionInfo = this.connections.get(conn.id);
    const { currentPlayerIndex, currentSong, players } =
      this.roomState.gameState;
    const currentPlayer = players[currentPlayerIndex];

    if (connectionInfo?.playerId !== currentPlayer.id) {
      this.sendError(conn, 'NOT_YOUR_TURN', 'Not your turn');
      return;
    }

    if (this.roomState.gameState.phase !== 'placing' || !currentSong) {
      this.sendError(conn, 'INVALID_ACTION', 'Cannot place song now');
      return;
    }

    const timeline = [...currentPlayer.timeline];
    const isCorrect = this.isPlacementCorrect(
      timeline,
      currentSong,
      payload.position
    );

    let updatedTimeline = timeline;
    if (isCorrect) {
      timeline.splice(payload.position, 0, currentSong);
      timeline.sort((a, b) => a.year - b.year);
      updatedTimeline = timeline;

      this.roomState.gameState.players[currentPlayerIndex] = {
        ...currentPlayer,
        timeline,
      };
    }

    this.roomState.gameState.lastGuessCorrect = isCorrect;
    this.roomState.gameState.phase = 'reveal';
    this.roomState.gameState.previewPosition = null;
    this.roomState.version++;
    this.roomState.lastUpdated = Date.now();

    this.clearTurnTimeout();

    this.broadcast({
      type: 'SONG_PLACED',
      payload: {
        playerId: currentPlayer.id,
        position: payload.position,
        isCorrect,
        song: currentSong,
        updatedTimeline,
      },
    });

    await this.persistState();
  }

  private async handleClaimBonus(conn: Party.Connection) {
    if (!this.roomState) return;

    const connectionInfo = this.connections.get(conn.id);
    const { currentPlayerIndex, players, lastGuessCorrect } =
      this.roomState.gameState;
    const currentPlayer = players[currentPlayerIndex];

    if (connectionInfo?.playerId !== currentPlayer.id) {
      this.sendError(conn, 'NOT_YOUR_TURN', 'Not your turn');
      return;
    }

    if (this.roomState.gameState.phase !== 'reveal' || !lastGuessCorrect) {
      this.sendError(conn, 'INVALID_ACTION', 'Cannot claim bonus now');
      return;
    }

    currentPlayer.bonusPoints++;
    this.roomState.version++;
    this.roomState.lastUpdated = Date.now();

    this.broadcast({
      type: 'BONUS_CLAIMED',
      payload: {
        playerId: currentPlayer.id,
        newBonusPoints: currentPlayer.bonusPoints,
      },
    });

    await this.persistState();
  }

  private async handleNextTurn(conn: Party.Connection) {
    if (!this.roomState) return;

    const connectionInfo = this.connections.get(conn.id);
    const { currentPlayerIndex, players } = this.roomState.gameState;
    const currentPlayer = players[currentPlayerIndex];

    if (connectionInfo?.playerId !== currentPlayer.id) {
      this.sendError(conn, 'NOT_YOUR_TURN', 'Not your turn');
      return;
    }

    if (this.roomState.gameState.phase !== 'reveal') {
      this.sendError(conn, 'INVALID_ACTION', 'Cannot proceed to next turn now');
      return;
    }

    const winner = this.checkForWinner();
    if (winner) {
      await this.handleGameFinished();
      return;
    }

    this.roomState.gameState.currentPlayerIndex =
      (currentPlayerIndex + 1) % players.length;
    this.roomState.gameState.phase = 'playing';
    this.roomState.gameState.currentSong = null;
    this.roomState.gameState.lastGuessCorrect = null;
    this.roomState.gameState.turnStartedAt = Date.now();
    this.roomState.gameState.previewPosition = null;
    this.roomState.version++;
    this.roomState.lastUpdated = Date.now();

    this.broadcast({
      type: 'TURN_CHANGED',
      payload: {
        currentPlayerIndex: this.roomState.gameState.currentPlayerIndex,
        phase: 'playing',
        turnStartedAt: this.roomState.gameState.turnStartedAt!,
      },
    });

    await this.persistState();
    await this.startTurnTimeout();
  }

  private handleHeartbeat(conn: Party.Connection) {
    const connectionInfo = this.connections.get(conn.id);
    if (connectionInfo) {
      connectionInfo.lastHeartbeat = Date.now();
    }
  }

  private handleRequestSync(conn: Party.Connection) {
    if (!this.roomState) {
      this.sendError(conn, 'ROOM_NOT_FOUND', 'Room not found');
      return;
    }

    const response: ServerMessage = {
      type: 'STATE_SYNC',
      payload: { roomState: this.roomState },
    };
    conn.send(JSON.stringify(response));
  }

  private handlePositionPreview(
    conn: Party.Connection,
    payload: { position: number | null }
  ) {
    if (!this.roomState) return;

    const connectionInfo = this.connections.get(conn.id);
    const currentPlayer =
      this.roomState.gameState.players[
        this.roomState.gameState.currentPlayerIndex
      ];

    if (connectionInfo?.playerId !== currentPlayer.id) return;
    if (this.roomState.gameState.phase !== 'placing') return;

    this.roomState.gameState.previewPosition = payload.position;

    this.broadcastExcept(conn.id, {
      type: 'POSITION_PREVIEW',
      payload: {
        playerId: currentPlayer.id,
        position: payload.position,
      },
    });
  }

  private async handleMusicStarted(conn: Party.Connection) {
    if (!this.roomState) return;

    const connectionInfo = this.connections.get(conn.id);
    const currentPlayer =
      this.roomState.gameState.players[
        this.roomState.gameState.currentPlayerIndex
      ];

    if (connectionInfo?.playerId !== currentPlayer.id) return;
    if (this.roomState.gameState.phase !== 'placing') return;

    this.roomState.gameState.turnStartedAt = Date.now();

    this.broadcast({
      type: 'TURN_TIMER_STARTED',
      payload: {
        turnStartedAt: this.roomState.gameState.turnStartedAt,
      },
    });

    await this.startTurnTimeout();
  }

  private async handlePlayerTimeout(playerId: string) {
    if (!this.roomState) return;

    const playerIndex = this.roomState.gameState.players.findIndex(
      (p) => p.id === playerId
    );
    if (playerIndex === -1) return;

    const player = this.roomState.gameState.players[playerIndex];
    if (player.isConnected) return;

    const isCurrentPlayer =
      playerIndex === this.roomState.gameState.currentPlayerIndex;

    if (
      isCurrentPlayer &&
      this.roomState.roomPhase === 'playing' &&
      (this.roomState.gameState.phase === 'playing' ||
        this.roomState.gameState.phase === 'placing')
    ) {
      await this.skipToNextPlayer(playerId, 'disconnected');
    }

    this.disconnectTimeouts.delete(playerId);
  }

  private checkForWinner(): OnlinePlayer | null {
    if (!this.roomState) return null;

    const { players, targetScore } = this.roomState.gameState;

    for (const player of players) {
      const score = player.timeline.length + player.bonusPoints;
      if (score >= targetScore) {
        return player;
      }
    }

    return null;
  }

  private async handleGameFinished() {
    if (!this.roomState) return;

    const { players } = this.roomState.gameState;

    const standings = players
      .map((p) => ({
        playerId: p.id,
        playerName: p.name,
        score: p.timeline.length + p.bonusPoints,
        timelineLength: p.timeline.length,
        bonusPoints: p.bonusPoints,
      }))
      .sort((a, b) => b.score - a.score);

    this.roomState.gameState.phase = 'finished';
    this.roomState.roomPhase = 'finished';
    this.roomState.version++;
    this.roomState.lastUpdated = Date.now();

    this.clearTurnTimeout();

    this.broadcast({
      type: 'GAME_FINISHED',
      payload: {
        winnerId: standings[0].playerId,
        finalStandings: standings,
      },
    });

    await this.persistState();
  }

  private isPlacementCorrect(
    timeline: Song[],
    newSong: Song,
    position: number
  ): boolean {
    if (timeline.length === 0) return true;

    const sortedTimeline = [...timeline].sort((a, b) => a.year - b.year);
    const beforeSong = position > 0 ? sortedTimeline[position - 1] : null;
    const afterSong =
      position < sortedTimeline.length ? sortedTimeline[position] : null;

    if (beforeSong && newSong.year < beforeSong.year) return false;
    if (afterSong && newSong.year > afterSong.year) return false;

    return true;
  }

  private async startTurnTimeout() {
    this.clearTurnTimeout();

    if (!this.roomState || this.roomState.roomPhase !== 'playing') return;

    const { currentPlayerIndex, players, phase } = this.roomState.gameState;
    const currentPlayer = players[currentPlayerIndex];

    if (!currentPlayer.isConnected && (phase === 'playing' || phase === 'placing')) {
      await this.skipToNextPlayer(currentPlayer.id, 'disconnected');
      return;
    }

    const turnTimeout = this.roomState.gameState.turnTimeout;
    if (turnTimeout === null) return;

    const timeoutMs = turnTimeout * 1000;

    this.turnTimeoutId = setTimeout(async () => {
      if (!this.roomState || this.roomState.roomPhase !== 'playing') return;

      const { currentPlayerIndex: idx, players: ps, phase: ph } = this.roomState.gameState;
      const cp = ps[idx];

      if (ph === 'playing' || ph === 'placing') {
        await this.skipToNextPlayer(cp.id, 'timeout');
      }
    }, timeoutMs);
  }

  private async skipToNextPlayer(skippedPlayerId: string, reason: 'timeout' | 'disconnected') {
    if (!this.roomState) return;

    const { currentPlayerIndex, players } = this.roomState.gameState;
    const nextIndex = (currentPlayerIndex + 1) % players.length;

    this.roomState.gameState.currentPlayerIndex = nextIndex;
    this.roomState.gameState.phase = 'playing';
    this.roomState.gameState.currentSong = null;
    this.roomState.gameState.turnStartedAt = null;
    this.roomState.gameState.previewPosition = null;
    this.roomState.version++;
    this.roomState.lastUpdated = Date.now();

    this.broadcast({
      type: 'TURN_SKIPPED',
      payload: {
        skippedPlayerId,
        reason,
        newCurrentPlayerIndex: nextIndex,
        turnStartedAt: null,
      },
    });

    await this.persistState();
  }

  private clearTurnTimeout() {
    if (this.turnTimeoutId) {
      clearTimeout(this.turnTimeoutId);
      this.turnTimeoutId = null;
    }
  }

  private broadcast(message: ServerMessage) {
    this.room.broadcast(JSON.stringify(message));
  }

  private broadcastExcept(excludeConnId: string, message: ServerMessage) {
    for (const conn of this.room.getConnections()) {
      if (conn.id !== excludeConnId) {
        conn.send(JSON.stringify(message));
      }
    }
  }

  private sendError(
    conn: Party.Connection,
    code: ErrorCode,
    message: string
  ) {
    const response: ServerMessage = {
      type: 'ERROR',
      payload: { code, message },
    };
    conn.send(JSON.stringify(response));
  }

  private async persistState() {
    if (this.roomState) {
      await this.room.storage.put('state', this.roomState);
    }
  }
}
