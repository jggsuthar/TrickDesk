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

// Authentic Standard Number Card Pip Matrix Layouts
const Pip: React.FC<{ suit: Suit; x: number; y: number; inverted?: boolean }> = ({ suit, x, y, inverted }) => (
  <div
    className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      transform: `translate(-50%, -50%) ${inverted ? 'rotate(180deg)' : ''}`,
    }}
  >
    <SuitIcon suit={suit} className="w-3 h-3 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5" />
  </div>
);

const NumberPips: React.FC<{ rank: string; suit: Suit }> = ({ rank, suit }) => {
  switch (rank) {
    case '2':
      return (
        <>
          <Pip suit={suit} x={50} y={24} />
          <Pip suit={suit} x={50} y={76} inverted />
        </>
      );
    case '3':
      return (
        <>
          <Pip suit={suit} x={50} y={24} />
          <Pip suit={suit} x={50} y={50} />
          <Pip suit={suit} x={50} y={76} inverted />
        </>
      );
    case '4':
      return (
        <>
          <Pip suit={suit} x={32} y={24} />
          <Pip suit={suit} x={68} y={24} />
          <Pip suit={suit} x={32} y={76} inverted />
          <Pip suit={suit} x={68} y={76} inverted />
        </>
      );
    case '5':
      return (
        <>
          <Pip suit={suit} x={32} y={24} />
          <Pip suit={suit} x={68} y={24} />
          <Pip suit={suit} x={50} y={50} />
          <Pip suit={suit} x={32} y={76} inverted />
          <Pip suit={suit} x={68} y={76} inverted />
        </>
      );
    case '6':
      return (
        <>
          <Pip suit={suit} x={32} y={24} />
          <Pip suit={suit} x={68} y={24} />
          <Pip suit={suit} x={32} y={50} />
          <Pip suit={suit} x={68} y={50} />
          <Pip suit={suit} x={32} y={76} inverted />
          <Pip suit={suit} x={68} y={76} inverted />
        </>
      );
    case '7':
      return (
        <>
          <Pip suit={suit} x={32} y={24} />
          <Pip suit={suit} x={68} y={24} />
          <Pip suit={suit} x={50} y={37} />
          <Pip suit={suit} x={32} y={50} />
          <Pip suit={suit} x={68} y={50} />
          <Pip suit={suit} x={32} y={76} inverted />
          <Pip suit={suit} x={68} y={76} inverted />
        </>
      );
    case '8':
      return (
        <>
          <Pip suit={suit} x={32} y={22} />
          <Pip suit={suit} x={68} y={22} />
          <Pip suit={suit} x={50} y={36} />
          <Pip suit={suit} x={32} y={50} />
          <Pip suit={suit} x={68} y={50} />
          <Pip suit={suit} x={50} y={64} inverted />
          <Pip suit={suit} x={32} y={78} inverted />
          <Pip suit={suit} x={68} y={78} inverted />
        </>
      );
    case '9':
      return (
        <>
          <Pip suit={suit} x={32} y={20} />
          <Pip suit={suit} x={68} y={20} />
          <Pip suit={suit} x={32} y={40} />
          <Pip suit={suit} x={68} y={40} />
          <Pip suit={suit} x={50} y={50} />
          <Pip suit={suit} x={32} y={60} inverted />
          <Pip suit={suit} x={68} y={60} inverted />
          <Pip suit={suit} x={32} y={80} inverted />
          <Pip suit={suit} x={68} y={80} inverted />
        </>
      );
    case '10':
      return (
        <>
          <Pip suit={suit} x={32} y={18} />
          <Pip suit={suit} x={68} y={18} />
          <Pip suit={suit} x={50} y={32} />
          <Pip suit={suit} x={32} y={42} />
          <Pip suit={suit} x={68} y={42} />
          <Pip suit={suit} x={32} y={58} inverted />
          <Pip suit={suit} x={68} y={58} inverted />
          <Pip suit={suit} x={50} y={68} inverted />
          <Pip suit={suit} x={32} y={82} inverted />
          <Pip suit={suit} x={68} y={82} inverted />
        </>
      );
    default:
      return null;
  }
};

// Authentic Double-Headed Royal Court Portrait Illustration
const CourtCardPortrait: React.FC<{ rank: 'J' | 'Q' | 'K'; suit: Suit; isRed: boolean }> = ({ rank, suit, isRed }) => {
  const accentColor = isRed ? '#dc2626' : '#2563eb';
  const goldColor = '#eab308';
  const darkColor = '#18181b';

  return (
    <div className="absolute inset-x-2 sm:inset-x-3 inset-y-2 sm:inset-y-2.5 rounded border border-zinc-400/80 overflow-hidden bg-amber-50/40 pointer-events-none flex flex-col justify-between p-0.5">
      {/* Top Half of Double-Headed Portrait */}
      <div className="relative w-full h-[48%] flex items-center justify-center">
        <svg viewBox="0 0 100 80" className="w-full h-full">
          {/* Royal Crown / Cap */}
          {rank === 'K' && (
            <path
              d="M30 38 L36 20 L50 32 L64 20 L70 38 Z"
              fill={goldColor}
              stroke={darkColor}
              strokeWidth="2"
            />
          )}
          {rank === 'Q' && (
            <path
              d="M34 38 L42 22 L50 30 L58 22 L66 38 Z"
              fill={goldColor}
              stroke={darkColor}
              strokeWidth="2"
            />
          )}
          {rank === 'J' && (
            <path
              d="M32 38 Q50 16 68 38 Z"
              fill={accentColor}
              stroke={darkColor}
              strokeWidth="2"
            />
          )}

          {/* Royal Head & Face */}
          <circle cx="50" cy="46" r="14" fill="#fed7aa" stroke={darkColor} strokeWidth="1.5" />
          {/* Eyes & Mouth */}
          <circle cx="45" cy="44" r="1.5" fill={darkColor} />
          <circle cx="55" cy="44" r="1.5" fill={darkColor} />
          {rank === 'K' ? (
            /* King's Majestic Beard */
            <path d="M42 50 Q50 62 58 50 Z" fill={darkColor} />
          ) : (
            <path d="M46 52 Q50 55 54 52" stroke={darkColor} strokeWidth="1.2" fill="none" />
          )}

          {/* Royal Robes & Shoulders */}
          <path
            d="M20 78 L34 56 L66 56 L80 78 Z"
            fill={accentColor}
            stroke={darkColor}
            strokeWidth="2"
          />
          {/* Gold Collar Trim */}
          <path d="M36 56 L50 70 L64 56" fill={goldColor} stroke={darkColor} strokeWidth="1.5" />
        </svg>

        {/* Small Suit Insignia inside court */}
        <div className="absolute right-1 top-1">
          <SuitIcon suit={suit} className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-90" />
        </div>
      </div>

      {/* Middle Dividing Line */}
      <div className="w-full h-[1.5px] bg-zinc-400 relative flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-white border border-zinc-400 flex items-center justify-center text-[8px] font-serif font-black text-zinc-800">
          {rank}
        </div>
      </div>

      {/* Bottom Half of Double-Headed Portrait (Inverted 180deg) */}
      <div className="relative w-full h-[48%] flex items-center justify-center rotate-180">
        <svg viewBox="0 0 100 80" className="w-full h-full">
          {rank === 'K' && (
            <path
              d="M30 38 L36 20 L50 32 L64 20 L70 38 Z"
              fill={goldColor}
              stroke={darkColor}
              strokeWidth="2"
            />
          )}
          {rank === 'Q' && (
            <path
              d="M34 38 L42 22 L50 30 L58 22 L66 38 Z"
              fill={goldColor}
              stroke={darkColor}
              strokeWidth="2"
            />
          )}
          {rank === 'J' && (
            <path
              d="M32 38 Q50 16 68 38 Z"
              fill={accentColor}
              stroke={darkColor}
              strokeWidth="2"
            />
          )}
          <circle cx="50" cy="46" r="14" fill="#fed7aa" stroke={darkColor} strokeWidth="1.5" />
          <circle cx="45" cy="44" r="1.5" fill={darkColor} />
          <circle cx="55" cy="44" r="1.5" fill={darkColor} />
          {rank === 'K' ? (
            <path d="M42 50 Q50 62 58 50 Z" fill={darkColor} />
          ) : (
            <path d="M46 52 Q50 55 54 52" stroke={darkColor} strokeWidth="1.2" fill="none" />
          )}
          <path
            d="M20 78 L34 56 L66 56 L80 78 Z"
            fill={accentColor}
            stroke={darkColor}
            strokeWidth="2"
          />
          <path d="M36 56 L50 70 L64 56" fill={goldColor} stroke={darkColor} strokeWidth="1.5" />
        </svg>

        <div className="absolute right-1 top-1">
          <SuitIcon suit={suit} className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-90" />
        </div>
      </div>
    </div>
  );
};

// Grand Ornate Ace Centerpiece
const GrandAceCenter: React.FC<{ suit: Suit }> = ({ suit }) => {
  const isSpade = suit === '♠';

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-2">
      <div className="relative flex items-center justify-center">
        {/* Ornate halo for Ace of Spades */}
        {isSpade && (
          <div className="absolute w-14 h-14 sm:w-18 sm:h-18 rounded-full border border-dashed border-zinc-400/50 animate-spin-slow opacity-60" />
        )}
        <SuitIcon
          suit={suit}
          className={`${
            isSpade
              ? 'w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 drop-shadow-md'
              : 'w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 drop-shadow-sm'
          }`}
        />
      </div>
      {isSpade && (
        <span className="text-[7px] sm:text-[9px] font-serif uppercase tracking-widest text-zinc-500 mt-1">
          TRICKDESK
        </span>
      )}
    </div>
  );
};

// Authentic Jester Centerpiece for Joker
const JokerCenter: React.FC<{ isRed: boolean }> = ({ isRed }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-2">
      <svg viewBox="0 0 100 100" className="w-12 h-12 sm:w-16 sm:h-16">
        {/* Jester Cap with 3 points and bells */}
        <path
          d="M26 44 C12 28 20 12 36 24 C44 14 56 14 64 24 C80 12 88 28 74 44 Z"
          fill={isRed ? '#dc2626' : '#7c3aed'}
          stroke="#18181b"
          strokeWidth="2"
        />
        {/* Gold Bells on cap tips */}
        <circle cx="20" cy="18" r="4" fill="#eab308" stroke="#18181b" strokeWidth="1.5" />
        <circle cx="50" cy="14" r="4" fill="#eab308" stroke="#18181b" strokeWidth="1.5" />
        <circle cx="80" cy="18" r="4" fill="#eab308" stroke="#18181b" strokeWidth="1.5" />

        {/* Jester Face */}
        <circle cx="50" cy="50" r="16" fill="#fed7aa" stroke="#18181b" strokeWidth="1.5" />
        {/* Smiling Mask */}
        <circle cx="44" cy="48" r="2" fill="#18181b" />
        <circle cx="56" cy="48" r="2" fill="#18181b" />
        <path d="M40 56 Q50 68 60 56" stroke="#dc2626" strokeWidth="2.5" fill="none" />

        {/* Ruffled Collar */}
        <path
          d="M30 68 L36 78 L44 70 L50 82 L56 70 L64 78 L70 68 Z"
          fill="#eab308"
          stroke="#18181b"
          strokeWidth="1.5"
        />
      </svg>
      <span className="text-[9px] sm:text-[11px] font-serif font-black tracking-widest uppercase mt-0.5">
        JOKER
      </span>
    </div>
  );
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
  // Authentic rich casino red or deep carbon black
  const colorClass = isRed ? 'text-[#c62828]' : 'text-[#18181b]';
  const isCourt = ['J', 'Q', 'K'].includes(card.rank);
  const isAce = card.rank === 'A';
  const isNumber = !isCourt && !isAce && !card.isJoker;

  if (showBack) {
    return (
      <div
        className={`relative w-full h-full aspect-[5/7] rounded-lg bg-gradient-to-br from-blue-900 to-indigo-950 border-2 border-white shadow-md p-1.5 flex items-center justify-center select-none ${className}`}
      >
        <div className="w-full h-full rounded border border-dashed border-blue-400/40 bg-blue-950/80 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border border-blue-400/60 flex items-center justify-center text-blue-200 font-serif font-bold text-xs shadow-inner">
            TD
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`
        relative w-full h-full aspect-[5/7] rounded-lg sm:rounded-xl bg-white select-none
        border transition-all duration-150 overflow-hidden shadow-sm
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-900 border-blue-500' : 'border-zinc-300'}
        ${isHoverable ? 'hover:-translate-y-1 hover:shadow-lg cursor-pointer' : ''}
        ${isDimmed ? 'opacity-30 saturate-50' : 'opacity-100'}
        ${isJiggling ? 'animate-jiggle' : ''}
        ${colorClass}
        ${className}
      `}
      style={{
        boxShadow: isSelected
          ? '0 0 0 2px #3b82f6'
          : '0 1px 3px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.08)',
      }}
    >
      {/* Subtle authentic playing card inner line */}
      <div className="absolute inset-1 rounded sm:rounded-lg border border-zinc-200/60 pointer-events-none" />

      {/* Top-Left Corner Index (Classic Serif Playing Card Typography) */}
      <div className="absolute top-1 left-1.5 sm:top-1.5 sm:left-2 flex flex-col items-center leading-none pointer-events-none z-10">
        <span className="font-serif font-black text-xs sm:text-sm md:text-base tracking-tighter">
          {card.isJoker ? 'JKR' : card.rank}
        </span>
        <SuitIcon suit={card.suit} className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 mt-0.5" />
      </div>

      {/* Centerpiece Layout based on Card Type */}
      {card.isJoker ? (
        <JokerCenter isRed={isRed} />
      ) : isCourt ? (
        <CourtCardPortrait rank={card.rank as 'J' | 'Q' | 'K'} suit={card.suit} isRed={isRed} />
      ) : isAce ? (
        <GrandAceCenter suit={card.suit} />
      ) : isNumber ? (
        <NumberPips rank={card.rank} suit={card.suit} />
      ) : null}

      {/* Bottom-Right Corner Index (Inverted 180deg) */}
      <div className="absolute bottom-1 right-1.5 sm:bottom-1.5 sm:right-2 flex flex-col items-center leading-none rotate-180 pointer-events-none z-10">
        <span className="font-serif font-black text-xs sm:text-sm md:text-base tracking-tighter">
          {card.isJoker ? 'JKR' : card.rank}
        </span>
        <SuitIcon suit={card.suit} className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 mt-0.5" />
      </div>
    </div>
  );
};
