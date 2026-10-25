'use client';

import React from 'react';
import { Card, Suit } from '@/types/game';

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
  const isRed = card.color === 'red';
  const colorClass = isRed ? 'text-red-600' : 'text-zinc-950';

  if (showBack) {
    return (
      <div
        className={`relative w-full h-full aspect-[5/7] rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-zinc-700/80 shadow-md p-1.5 flex items-center justify-center select-none ${className}`}
      >
        <div className="w-full h-full rounded-lg border border-dashed border-zinc-600/50 bg-zinc-900/60 flex items-center justify-center">
          <div className="w-7 h-7 rounded-full border border-zinc-500/40 flex items-center justify-center text-zinc-400 font-bold text-xs">
            TD
          </div>
        </div>
      </div>
    );
  }

  // Joker Card
  if (card.isJoker) {
    return (
      <div
        onClick={onClick}
        className={`
          relative w-full h-full aspect-[5/7] rounded-xl bg-white select-none
          border transition-all duration-200 overflow-hidden shadow-sm
          ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-900 border-blue-500' : 'border-zinc-300'}
          ${isHoverable ? 'hover:-translate-y-1 hover:shadow-lg cursor-pointer' : ''}
          ${isDimmed ? 'opacity-35 saturate-50' : 'opacity-100'}
          ${isJiggling ? 'animate-jiggle' : ''}
          ${colorClass}
          ${className}
        `}
      >
        <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 flex flex-col items-center leading-none pointer-events-none">
          <span className="font-black text-[9px] sm:text-[11px] tracking-tight">JKR</span>
          <SuitIcon suit="★" className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-0.5" />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-1.5">
          <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-full border border-current flex items-center justify-center mb-0.5">
            <SuitIcon suit="★" className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <span className="text-[9px] sm:text-xs font-black tracking-widest uppercase">
            JOKER
          </span>
        </div>

        <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 flex flex-col items-center leading-none rotate-180 pointer-events-none">
          <span className="font-black text-[9px] sm:text-[11px] tracking-tight">JKR</span>
          <SuitIcon suit="★" className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-0.5" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`
        relative w-full h-full aspect-[5/7] rounded-xl bg-white select-none
        border transition-all duration-200 overflow-hidden shadow-sm
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-900 border-blue-500' : 'border-zinc-300'}
        ${isHoverable ? 'hover:-translate-y-1 hover:shadow-lg cursor-pointer' : ''}
        ${isDimmed ? 'opacity-35 saturate-50' : 'opacity-100'}
        ${isJiggling ? 'animate-jiggle' : ''}
        ${colorClass}
        ${className}
      `}
    >
      {/* Top-Left Corner Rank & Suit */}
      <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 flex flex-col items-center leading-none pointer-events-none">
        <span className="font-black text-xs sm:text-sm md:text-base tracking-tighter">
          {card.rank}
        </span>
        <SuitIcon suit={card.suit} className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 mt-0.5" />
      </div>

      {/* Center Suit or Royal Emblem */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-1.5">
        {['J', 'Q', 'K'].includes(card.rank) ? (
          <div className="flex flex-col items-center justify-center">
            <span className="text-base sm:text-2xl md:text-3xl font-black opacity-90">{card.rank}</span>
            <SuitIcon suit={card.suit} className="w-3.5 h-3.5 sm:w-5 sm:h-5 opacity-85 mt-0.5" />
          </div>
        ) : card.rank === 'A' ? (
          <SuitIcon suit={card.suit} className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 drop-shadow-sm" />
        ) : (
          <div className="flex flex-col items-center gap-0.5 opacity-85">
            <SuitIcon suit={card.suit} className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8" />
          </div>
        )}
      </div>

      {/* Bottom-Right Corner (Inverted 180deg) */}
      <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 flex flex-col items-center leading-none rotate-180 pointer-events-none">
        <span className="font-black text-xs sm:text-sm md:text-base tracking-tighter">
          {card.rank}
        </span>
        <SuitIcon suit={card.suit} className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 mt-0.5" />
      </div>
    </div>
  );
};
