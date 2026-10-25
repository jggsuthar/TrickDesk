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

  constructor(callbacks: NetworkCallbacks) {
    this.callbacks = callbacks;
  }

  public initHost(roomId: string, playerId: string): Promise<string> {
    this.isHost = true;
    this.roomId = roomId;
    this.playerId = playerId;
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
    const hostPeerId = `td-host-${roomId}`;
    const clientPeerId = `td-client-${playerId}`;

    return new Promise((resolve, reject) => {
      this.destroy();

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

          conn.on('open', () => {
            this.hostConnection = conn;
            // Send join or reconnect handshake
            const handshakeMsg: PeerMessage = isReconnect
              ? { type: 'RECONNECT', playerId, playerName }
              : { type: 'JOIN_ROOM', playerId, playerName };
            conn.send(handshakeMsg);
            resolve(id);
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
            this.callbacks.onPlayerDisconnected('host');
          });

          conn.on('error', (err) => {
            console.error('Error on host connection:', err);
            this.callbacks.onError(err);
          });
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
      this.hostConnection.send(message);
    } else {
      console.warn('Cannot send message, host connection is not open');
    }
  }

  public destroy(): void {
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
