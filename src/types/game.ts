export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  id: string; // e.g. "d0-♠-A"
  suit: Suit;
  rank: Rank;
  value: number; // 2 to 14
  color: 'red' | 'black';
  deckIndex: number;
}

export interface DeskCard {
  card: Card;
  playerId: string;
  playerName: string;
  playedAt: number;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  connected: boolean;
  isReady: boolean;
  hand: Card[];
  discarded: Card[];
  stacksWonThisRound: number;
}

export type GamePhase = 'LOBBY' | 'SETUP' | 'DISCARD' | 'PLAYING' | 'ROUND_OVER';

export interface RoundScore {
  playerId: string;
  playerName: string;
  stacksWon: number;
}

export interface RoundHistory {
  roundNumber: number;
  scores: RoundScore[];
}

export interface UndoRequest {
  requestId: string;
  playerId: string;
  playerName: string;
  card: Card;
}

export interface GameState {
  roomId: string;
  isLocked: boolean;
  phase: GamePhase;
  numDecks: number;
  cardsPerPlayer: number;
  players: Player[];
  desk: DeskCard[];
  roundNumber: number;
  roundHistory: RoundHistory[];
  pendingUndoRequest: UndoRequest | null;
  lastAwardedWinner: {
    playerId: string;
    playerName: string;
    card: Card;
    deskSnapshot: DeskCard[];
  } | null;
}

export type PeerMessage =
  | { type: 'SYNC_STATE'; state: GameState }
  | { type: 'JOIN_ROOM'; playerId: string; playerName: string }
  | { type: 'RECONNECT'; playerId: string; playerName: string }
  | { type: 'PLAY_CARD'; playerId: string; card: Card }
  | { type: 'REQUEST_UNDO'; playerId: string }
  | { type: 'DISCARD_CARDS'; playerId: string; discardedCards: Card[] }
  | { type: 'PLAYER_READY'; playerId: string; isReady: boolean }
  | { type: 'REJECT_UNDO'; playerId: string; reason?: string };

export type HandViewMode = 'segregated' | 'fanned';
