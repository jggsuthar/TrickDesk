export type Suit = '♠' | '♥' | '♦' | '♣' | '★';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' | 'JOKER';

export interface Card {
  id: string; // e.g. "d0-♠-A-xyz" or "joker-0-xyz"
  suit: Suit;
  rank: Rank;
  value: number; // 2 to 14, Jokers = 15
  color: 'red' | 'black';
  deckIndex: number;
  isJoker?: boolean;
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
  hasDiscarded: boolean;
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
  // Permanent Room Pool Configuration (set once in Lobby by Host)
  numDecks: number; // 1 to 4
  numJokers: number; // 0 to 12
  // Per-Round Configuration (set each round by Host)
  cardsPerPlayer: number;
  cardsToDiscard: number; // 0 = no discard phase, > 0 = exact cards every player must discard
  // Game session
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
