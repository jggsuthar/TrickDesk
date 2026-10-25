import { Card, Suit } from '@/types/game';

const SUIT_NAMES: Record<Suit, string> = {
  '♠': 'spades',
  '♥': 'hearts',
  '♦': 'diamonds',
  '♣': 'clubs',
  '★': 'joker',
};

export function getCardSvgUrl(card: Card): string {
  if (card.isJoker || card.rank === 'JOKER' || card.suit === '★') {
    return card.color === 'red' ? '/cards/red_joker.svg' : '/cards/black_joker.svg';
  }

  const suitName = SUIT_NAMES[card.suit] || 'spades';

  switch (card.rank) {
    case 'A':
      return `/cards/ace_of_${suitName}.svg`;
    case 'K':
      return `/cards/king_of_${suitName}2.svg`;
    case 'Q':
      return `/cards/queen_of_${suitName}2.svg`;
    case 'J':
      return `/cards/jack_of_${suitName}2.svg`;
    default:
      // Numbers '2' through '10'
      return `/cards/${card.rank}_of_${suitName}.svg`;
  }
}
