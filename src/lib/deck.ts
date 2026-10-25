import { Card, Rank, Suit } from '@/types/game';

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const RANK_VALUES: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14,
};

export function createMasterDeck(numDecks: number = 1): Card[] {
  const deck: Card[] = [];
  const safeDecks = Math.max(1, Math.min(4, numDecks));

  for (let d = 0; d < safeDecks; d++) {
    for (const suit of SUITS) {
      const color: 'red' | 'black' = suit === '♥' || suit === '♦' ? 'red' : 'black';
      for (const rank of RANKS) {
        deck.push({
          id: `d${d}-${suit}-${rank}-${Math.random().toString(36).substring(2, 7)}`,
          suit,
          rank,
          value: RANK_VALUES[rank],
          color,
          deckIndex: d,
        });
      }
    }
  }

  return shuffleDeck(deck);
}

export function shuffleDeck<T>(deck: T[]): T[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
