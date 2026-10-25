'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/types/game';
import { PlayingCard } from './PlayingCard';
import { MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';

interface SortableCardProps {
  card: Card;
  index: number;
  totalCards: number;
  isOrganizeMode: boolean;
  isDimmed: boolean;
  viewMode: 'segregated' | 'fanned';
  flashingCardId: string | null;
  onCardClick: (card: Card) => void;
  onMoveCard: (fromIndex: number, toIndex: number) => void;
  isSelectedForDiscard?: boolean;
}

export const SortableCard: React.FC<SortableCardProps> = ({
  card,
  index,
  totalCards,
  isOrganizeMode,
  isDimmed,
  viewMode,
  flashingCardId,
  onCardClick,
  onMoveCard,
  isSelectedForDiscard = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled: !isOrganizeMode,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 250ms cubic-bezier(0.2, 0, 0, 1)',
  };

  const isFlashing = flashingCardId === card.id;

  // Staggered overlap for fanned view
  // On mobile, hands can have up to ~15 cards, so dynamic fanning spacing is needed.
  const fanStyle: React.CSSProperties =
    viewMode === 'fanned' && index > 0
      ? {
          marginLeft: totalCards > 10 ? '-2.5rem' : totalCards > 6 ? '-2rem' : '-1.5rem',
        }
      : {};

  if (isDragging) {
    // Ghost placeholder rendering for the landing spot
    return (
      <div
        ref={setNodeRef}
        style={{ ...style, ...fanStyle }}
        className="relative shrink-0 w-20 sm:w-28 md:w-32 aspect-[5/7] rounded-xl border-2 border-dashed border-zinc-600/70 bg-zinc-800/30 transition-all duration-200"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...fanStyle }}
      className={`relative shrink-0 w-20 sm:w-28 md:w-32 group select-none ${
        viewMode === 'fanned' ? 'hover:z-30 hover:-translate-y-2' : ''
      }`}
      {...(isOrganizeMode ? { ...attributes, ...listeners } : {})}
    >
      <div
        className={`relative ${
          isFlashing ? 'animate-drop-flash rounded-xl' : ''
        } ${isOrganizeMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
        onClick={() => {
          if (!isOrganizeMode) {
            onCardClick(card);
          }
        }}
      >
        <PlayingCard
          card={card}
          isDimmed={isDimmed}
          isJiggling={isOrganizeMode}
          isHoverable={!isOrganizeMode}
          isSelected={isSelectedForDiscard}
        />

        {/* 3-dot accessible menu button for keyboard / precise screen reader navigation */}
        {isOrganizeMode && (
          <div
            className="absolute top-1 right-1 z-20"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Card options"
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-1 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 shadow backdrop-blur-sm transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl py-1 z-50 text-xs">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => {
                    onMoveCard(index, index - 1);
                    setShowMenu(false);
                  }}
                  className="w-full px-2.5 py-1.5 text-left flex items-center gap-1.5 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent text-zinc-200"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Move Left
                </button>
                <button
                  type="button"
                  disabled={index === totalCards - 1}
                  onClick={() => {
                    onMoveCard(index, index + 1);
                    setShowMenu(false);
                  }}
                  className="w-full px-2.5 py-1.5 text-left flex items-center gap-1.5 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent text-zinc-200"
                >
                  <ChevronRight className="w-3.5 h-3.5" /> Move Right
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
