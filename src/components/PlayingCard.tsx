'use client';

import React from 'react';
import { Card, Suit } from '@/types/game';
import { getCardSvgUrl } from '@/lib/cardImages';

interface PlayingCardProps {
  card: Card;
  className?: string;
  isDimmed?: boolean;
  isJiggling?: boolean;
  isHoverable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  showBack?: boolean;
}

export const SuitIcon: React.FC<{ suit: Suit; className?: string }> = ({ suit, className = 'w-3.5 h-3.5' }) => {
  switch (suit) {
    case '♠':
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-label="Spades">
          <path d="M50,12 C44,28 20,48 20,68 C20,80 30,86 42,84 C44,83 46,78 47,75 L45,88 L34,92 L66,92 L55,88 L53,75 C54,78 56,83 58,84 C70,86 80,80 80,68 C80,48 56,28 50,12 Z" />
        </svg>
      );
    case '♥':
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-label="Hearts">
          <path d="M50,88 C32,72 14,54 14,35 C14,20 25,12 37,12 C44,12 48,16 50,20 C52,16 56,12 63,12 C75,12 86,20 86,35 C86,54 68,72 50,88 Z" />
        </svg>
      );
    case '♦':
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-label="Diamonds">
          <path d="M50,10 L84,50 L50,90 L16,50 Z" />
        </svg>
      );
    case '♣':
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-label="Clubs">
          <path d="M50,15 C42,15 36,22 36,30 C36,36 39,41 43,44 C34,42 22,48 22,60 C22,70 31,76 41,74 C44,73 46,69 47,66 L45,88 L35,92 L65,92 L55,88 L53,66 C54,69 56,73 59,74 C69,76 78,70 78,60 C78,48 66,42 57,44 C61,41 64,36 64,30 C64,22 58,15 50,15 Z" />
        </svg>
      );
    case '★':
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-label="Joker Star">
          <path d="M50 8 L62 38 L94 40 L68 60 L78 92 L50 72 L22 92 L32 60 L6 40 L38 38 Z" />
        </svg>
      );
    default:
      return null;
  }
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  className = '',
  isDimmed = false,
  isJiggling = false,
  isHoverable = false,
  isSelected = false,
  onClick,
  showBack = false,
}) => {
  if (showBack) {
    return (
      <div
        className={`relative w-full h-full aspect-[167/243] rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-900 via-blue-950 to-indigo-950 border-2 border-white shadow-md p-1.5 flex items-center justify-center select-none ${className}`}
      >
        <div className="w-full h-full rounded border border-dashed border-blue-400/40 bg-blue-950/80 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border border-blue-400/60 flex items-center justify-center text-blue-200 font-serif font-bold text-xs shadow-inner">
            TD
          </div>
        </div>
      </div>
    );
  }

  const svgUrl = getCardSvgUrl(card);

  return (
    <div
      onClick={onClick}
      className={`
        relative w-full h-full aspect-[167/243] rounded-lg sm:rounded-xl bg-white select-none
        transition-all duration-150 overflow-hidden
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-900 border-blue-500' : ''}
        ${isHoverable ? 'hover:-translate-y-1 hover:shadow-lg cursor-pointer' : ''}
        ${isDimmed ? 'opacity-30 saturate-50' : 'opacity-100'}
        ${isJiggling ? 'animate-jiggle' : ''}
        ${className}
      `}
      style={{
        boxShadow: isSelected
          ? '0 0 0 2px #3b82f6'
          : '0 1px 3px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.08)',
      }}
    >
      {/* Official SVG Card from SVG-cards-1.3 */}
      <img
        src={svgUrl}
        alt={`${card.rank} of ${card.suit}`}
        className="w-full h-full object-contain pointer-events-none select-none"
        draggable={false}
        loading="eager"
      />
    </div>
  );
};
