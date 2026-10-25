import Peer, { DataConnection } from 'peerjs';
import { GameState, PeerMessage } from '@/types/game';

export interface NetworkCallbacks {
  onPeerOpen: (peerId: string) => void;
  onPlayerConnected: (conn: DataConnection) => void;
  onPlayerDisconnected: (playerId: string) => void;
  onMessageReceived: (message: PeerMessage, conn: DataConnection) => void;
  onError: (error: Error) => void;
}

export class P2PNetwork {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private hostConnection: DataConnection | null = null;
  private isHost: boolean = false;
  private roomId: string = '';
  private playerId: string = '';
  private callbacks: NetworkCallbacks;
  private pendingQueue: PeerMessage[] = [];
  private isReconnecting: boolean = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private clientParams: { roomId: string; playerId: string; playerName: string } | null = null;

  constructor(callbacks: NetworkCallbacks) {
    this.callbacks = callbacks;
  }

  public initHost(roomId: string, playerId: string): Promise<string> {
    this.isHost = true;
    this.roomId = roomId;
    this.playerId = playerId;
    this.clientParams = null;
    const hostPeerId = `td-host-${roomId}`;

    return new Promise((resolve, reject) => {
      this.destroy();

      try {
        this.peer = new Peer(hostPeerId, {
          debug: 1,
        });

        this.peer.on('open', (id) => {
          this.callbacks.onPeerOpen(id);
          resolve(id);
        });

        this.peer.on('connection', (conn) => {
          conn.on('open', () => {
            this.connections.set(conn.peer, conn);
            this.callbacks.onPlayerConnected(conn);
          });

          conn.on('data', (data) => {
            try {
              const message = data as PeerMessage;
              this.callbacks.onMessageReceived(message, conn);
            } catch (err) {
              console.error('Error parsing incoming message:', err);
            }
          });

          conn.on('close', () => {
            this.connections.delete(conn.peer);
            this.callbacks.onPlayerDisconnected(conn.peer);
          });

          conn.on('error', (err) => {
            console.error('Connection error with peer:', conn.peer, err);
          });
        });

        this.peer.on('error', (err: any) => {
          // If ID is already taken (e.g. host refreshed and peer server hasn't expired old peer yet)
          if (err.type === 'unavailable-id') {
            console.warn('Host ID already taken, reconnecting...');
          }
          this.callbacks.onError(err);
          reject(err);
        });
      } catch (e: any) {
        reject(e);
      }
    });
  }

  public initClient(roomId: string, playerId: string, playerName: string, isReconnect: boolean = false): Promise<string> {
    this.isHost = false;
    this.roomId = roomId;
    this.playerId = playerId;
    this.clientParams = { roomId, playerId, playerName };
    const hostPeerId = `td-host-${roomId}`;
    const clientPeerId = `td-client-${playerId}`;

    return new Promise((resolve, reject) => {
      this.destroy();
      this.clientParams = { roomId, playerId, playerName };

      try {
        this.peer = new Peer(clientPeerId, {
          debug: 1,
        });

        this.peer.on('open', (id) => {
          this.callbacks.onPeerOpen(id);

          // Connect to Host
          const conn = this.peer!.connect(hostPeerId, {
            reliable: true,
          });

          this.setupHostConnectionHandlers(conn, isReconnect);
          resolve(id);
        });

        this.peer.on('error', (err: any) => {
          this.callbacks.onError(err);
          reject(err);
        });
      } catch (e: any) {
        reject(e);
      }
    });
  }

  private setupHostConnectionHandlers(conn: DataConnection, isInitialReconnect: boolean = false): void {
    conn.on('open', () => {
      this.hostConnection = conn;
      this.isReconnecting = false;

      // Send initial handshake
      if (this.clientParams) {
        const handshakeMsg: PeerMessage = isInitialReconnect
          ? { type: 'RECONNECT', playerId: this.clientParams.playerId, playerName: this.clientParams.playerName }
          : { type: 'JOIN_ROOM', playerId: this.clientParams.playerId, playerName: this.clientParams.playerName };
        conn.send(handshakeMsg);
      }

      // Flush any queued messages
      this.flushPendingQueue();
    });

    conn.on('data', (data) => {
      try {
        const message = data as PeerMessage;
        this.callbacks.onMessageReceived(message, conn);
      } catch (err) {
        console.error('Error parsing incoming message:', err);
      }
    });

    conn.on('close', () => {
      this.hostConnection = null;
      this.isReconnecting = false;
      this.callbacks.onPlayerDisconnected('host');

      // Attempt auto-reconnection if client is still active
      if (!this.peer?.destroyed && this.clientParams && !this.isHost) {
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = setTimeout(() => {
          this.ensureHostConnection();
        }, 1500);
      }
    });

    conn.on('error', (err) => {
      console.error('Error on host connection:', err);
      this.callbacks.onError(err);
      this.isReconnecting = false;
    });
  }

  private flushPendingQueue(): void {
    if (!this.hostConnection || !this.hostConnection.open) return;
    while (this.pendingQueue.length > 0) {
      const msg = this.pendingQueue.shift();
      if (msg) {
        try {
          this.hostConnection.send(msg);
          console.log('[P2PNetwork] Successfully sent queued message to host:', msg.type);
        } catch (err) {
          console.error('[P2PNetwork] Error sending queued message to host:', err);
          this.pendingQueue.unshift(msg);
          break;
        }
      }
    }
  }

  private ensureHostConnection(): void {
    if (this.isHost || !this.clientParams) return;
    if (this.hostConnection && this.hostConnection.open) {
      this.flushPendingQueue();
      return;
    }
    if (this.isReconnecting) return;
    if (!this.peer || this.peer.destroyed) return;

    this.isReconnecting = true;
    const hostPeerId = `td-host-${this.clientParams.roomId}`;
    try {
      console.log('[P2PNetwork] Reconnecting to host:', hostPeerId);
      const conn = this.peer.connect(hostPeerId, { reliable: true });
      this.setupHostConnectionHandlers(conn, true);
    } catch (err) {
      console.error('[P2PNetwork] Failed to trigger reconnection to host:', err);
      this.isReconnecting = false;
    }
  }

  // Host broadcasts GameState to all connected players
  public broadcastState(state: GameState): void {
    if (!this.isHost) return;
    const msg: PeerMessage = { type: 'SYNC_STATE', state };
    this.connections.forEach((conn) => {
      if (conn.open) {
        try {
          conn.send(msg);
        } catch (err) {
          console.error('Failed to send state to peer:', conn.peer, err);
        }
      }
    });
  }

  // Player sends message to Host
  public sendToHost(message: PeerMessage): void {
    if (this.hostConnection && this.hostConnection.open) {
      try {
        this.hostConnection.send(message);
        return;
      } catch (err) {
        console.warn('[P2PNetwork] Failed to send to host, adding to queue:', err);
      }
    }

    // Connection not currently open - queue message and reconnect
    this.pendingQueue.push(message);
    console.warn(`[P2PNetwork] Host connection not open. Queued message (${message.type}). Queue length: ${this.pendingQueue.length}`);
    this.ensureHostConnection();
  }

  public destroy(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.pendingQueue = [];
    this.clientParams = null;
    this.isReconnecting = false;

    if (this.hostConnection) {
      this.hostConnection.close();
      this.hostConnection = null;
    }
    this.connections.forEach((conn) => conn.close());
    this.connections.clear();

    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}
