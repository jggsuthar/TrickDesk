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
    // touchAction: 'none' ensures touch drag on mobile immediately interacts with DnD without scrolling
    touchAction: isOrganizeMode ? 'none' : 'auto',
  };

  const isFlashing = flashingCardId === card.id;

  // In standard (non-organize) mode, fanned view uses negative margin overlap
  const fanStyle: React.CSSProperties =
    !isOrganizeMode && viewMode === 'fanned' && index > 0
      ? {
          marginLeft: totalCards > 10 ? '-2.2rem' : totalCards > 6 ? '-1.8rem' : '-1.4rem',
        }
      : {};

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={{ ...style, ...fanStyle }}
        className={`relative ${
          isOrganizeMode
            ? 'w-full aspect-[5/7]'
            : 'w-18 sm:w-24 md:w-28 aspect-[5/7] shrink-0'
        } rounded-xl border-2 border-dashed border-zinc-600/70 bg-zinc-800/30 transition-all duration-200`}
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...fanStyle }}
      className={`relative select-none ${
        isOrganizeMode
          ? 'w-full aspect-[5/7]'
          : `shrink-0 w-18 sm:w-24 md:w-28 ${viewMode === 'fanned' ? 'hover:z-30 hover:-translate-y-1.5' : ''}`
      }`}
      {...(isOrganizeMode ? { ...attributes, ...listeners } : {})}
    >
      <div
        className={`relative w-full h-full ${
          isFlashing ? 'animate-drop-flash rounded-xl' : ''
        } ${isOrganizeMode ? 'cursor-grab active:cursor-grabbing touch-none' : ''}`}
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

        {/* 3-dot accessible options menu */}
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
              className="p-1 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 shadow backdrop-blur-sm transition-colors"
            >
              <MoreVertical className="w-3 h-3" />
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
                  className="w-full px-2.5 py-1.5 text-left flex items-center gap-1.5 hover:bg-zinc-800 disabled:opacity-40 text-zinc-200"
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
                  className="w-full px-2.5 py-1.5 text-left flex items-center gap-1.5 hover:bg-zinc-800 disabled:opacity-40 text-zinc-200"
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
