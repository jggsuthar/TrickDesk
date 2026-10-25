import { GameState, HandViewMode } from '@/types/game';

const KEYS = {
  SESSION: 'trickdesk_session',
  STATE_PREFIX: 'trickdesk_state_',
  VIEW_MODE: 'trickdesk_view_mode',
  HAND_ORDER_PREFIX: 'trickdesk_hand_order_',
};

export interface LocalSession {
  playerId: string;
  playerName: string;
  roomId: string;
  isHost: boolean;
}

export function saveSession(session: LocalSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save session:', e);
  }
}

export function loadSession(): LocalSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEYS.SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed to load session:', e);
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEYS.SESSION);
  } catch (e) {
    console.error('Failed to clear session:', e);
  }
}

export function saveLastGameState(roomId: string, state: GameState): void {
  if (typeof window === 'undefined' || !roomId) return;
  try {
    localStorage.setItem(KEYS.STATE_PREFIX + roomId, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save game state:', e);
  }
}

export function loadLastGameState(roomId: string): GameState | null {
  if (typeof window === 'undefined' || !roomId) return null;
  try {
    const raw = localStorage.getItem(KEYS.STATE_PREFIX + roomId);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed to load game state:', e);
    return null;
  }
}

// Alias for backward compatibility
export const saveHostGameState = saveLastGameState;
export const loadHostGameState = loadLastGameState;

export function saveHandViewMode(mode: HandViewMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS.VIEW_MODE, mode);
  } catch (e) {
    console.error('Failed to save view mode:', e);
  }
}

export function loadHandViewMode(): HandViewMode {
  if (typeof window === 'undefined') return 'fanned';
  try {
    const mode = localStorage.getItem(KEYS.VIEW_MODE);
    return mode === 'segregated' ? 'segregated' : 'fanned';
  } catch (e) {
    return 'fanned';
  }
}

export function saveHandOrder(roomId: string, cardIds: string[]): void {
  if (typeof window === 'undefined' || !roomId) return;
  try {
    localStorage.setItem(KEYS.HAND_ORDER_PREFIX + roomId, JSON.stringify(cardIds));
  } catch (e) {
    console.error('Failed to save hand order:', e);
  }
}

export function loadHandOrder(roomId: string): string[] | null {
  if (typeof window === 'undefined' || !roomId) return null;
  try {
    const raw = localStorage.getItem(KEYS.HAND_ORDER_PREFIX + roomId);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
