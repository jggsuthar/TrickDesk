'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, HandViewMode } from '@/types/game';
import { SortableCard } from './SortableCard';
import { PlayingCard } from './PlayingCard';
import { Layers, AlignJustify, Sparkles, Undo2, Check } from 'lucide-react';
import { saveHandViewMode, loadHandViewMode } from '@/lib/storage';

interface PlayerHandProps {
  cards: Card[];
  onCardsReordered: (cards: Card[]) => void;
  onCardClick: (card: Card) => void;
  selectedCardIds?: string[];
  disabled?: boolean;
  phaseLabel?: string;
  isOrganizeMode: boolean;
  setIsOrganizeMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  onCardsReordered,
  onCardClick,
  selectedCardIds = [],
  disabled = false,
  phaseLabel,
  isOrganizeMode,
  setIsOrganizeMode,
}) => {
  const [viewMode, setViewMode] = useState<HandViewMode>('fanned');
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [flashingCardId, setFlashingCardId] = useState<string | null>(null);
  const [undoState, setUndoState] = useState<Card[] | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const lastOverIdRef = useRef<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load view mode from storage on mount
  useEffect(() => {
    setViewMode(loadHandViewMode());
  }, []);

  const handleToggleViewMode = () => {
    const next = viewMode === 'fanned' ? 'segregated' : 'fanned';
    setViewMode(next);
    saveHandViewMode(next);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag begins
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const triggerHaptic = (ms: number = 15) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch (e) {
        // Haptics not allowed or supported
      }
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCardId(String(event.active.id));
    lastOverIdRef.current = String(event.active.id);
    triggerHaptic(20); // Light pop on pickup
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over ? String(event.over.id) : null;
    if (overId && overId !== lastOverIdRef.current) {
      lastOverIdRef.current = overId;
      triggerHaptic(10); // Tap on crossing slot
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCardId(null);
    lastOverIdRef.current = null;

    if (!over || active.id === over.id) return;

    const oldIndex = cards.findIndex((c) => c.id === active.id);
    const newIndex = cards.findIndex((c) => c.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      // Save for undo
      setUndoState([...cards]);
      const reordered = arrayMove(cards, oldIndex, newIndex);
      onCardsReordered(reordered);

      // Flash dropped card
      setFlashingCardId(String(active.id));
      setTimeout(() => setFlashingCardId(null), 500);

      // Show Undo Toast
      setShowUndoToast(true);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setShowUndoToast(false);
      }, 5000);
    }
  };

  const handleUndoReorder = () => {
    if (undoState) {
      onCardsReordered(undoState);
      setUndoState(null);
      setShowUndoToast(false);
    }
  };

  const handleMoveCard = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= cards.length) return;
    setUndoState([...cards]);
    const reordered = arrayMove(cards, fromIndex, toIndex);
    onCardsReordered(reordered);

    const movedCard = cards[fromIndex];
    if (movedCard) {
      setFlashingCardId(movedCard.id);
      setTimeout(() => setFlashingCardId(null), 500);
    }

    setShowUndoToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setShowUndoToast(false);
    }, 5000);
  };

  const activeCard = activeCardId ? cards.find((c) => c.id === activeCardId) : null;

  return (
    <div className="w-full flex flex-col items-center select-none pb-4 relative">
      {/* Hand Controls Header */}
      <div className="w-full max-w-4xl px-4 py-2 flex items-center justify-between gap-2 border-b border-zinc-800/80 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-zinc-400">
            Your Hand
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
            {cards.length} {cards.length === 1 ? 'card' : 'cards'}
          </span>
          {phaseLabel && (
            <span className="hidden sm:inline-block text-xs text-zinc-500">• {phaseLabel}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle: Segregated vs Fanned */}
          <button
            type="button"
            onClick={handleToggleViewMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-xs text-zinc-300 hover:text-white transition-colors"
            title={`Switch to ${viewMode === 'fanned' ? 'Segregated' : 'Fanned'} View`}
          >
            {viewMode === 'fanned' ? (
              <>
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden xs:inline">Fanned</span>
              </>
            ) : (
              <>
                <AlignJustify className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden xs:inline">Segregated</span>
              </>
            )}
          </button>

          {/* Organize Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsOrganizeMode((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isOrganizeMode
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
            }`}
          >
            {isOrganizeMode ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Done</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Organize</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cards Area with DnD Context */}
      <div className="w-full max-w-5xl overflow-x-auto overflow-y-visible px-4 py-4 scroll-smooth">
        {cards.length === 0 ? (
          <div className="h-28 flex items-center justify-center text-xs text-zinc-500 italic">
            No cards in hand
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={cards.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
              <div
                className={`flex items-center justify-center min-w-max mx-auto py-2 ${
                  viewMode === 'segregated' ? 'gap-2 sm:gap-3' : 'gap-0'
                }`}
              >
                {cards.map((card, idx) => (
                  <SortableCard
                    key={card.id}
                    card={card}
                    index={idx}
                    totalCards={cards.length}
                    isOrganizeMode={isOrganizeMode}
                    isDimmed={Boolean(activeCardId && activeCardId !== card.id)}
                    viewMode={viewMode}
                    flashingCardId={flashingCardId}
                    onCardClick={onCardClick}
                    onMoveCard={handleMoveCard}
                    isSelectedForDiscard={selectedCardIds.includes(card.id)}
                  />
                ))}
              </div>
            </SortableContext>

            {/* Drag Overlay: Micro-interactions with 5% scale, deep shadow, grabbing cursor */}
            <DragOverlay dropAnimation={null}>
              {activeCard ? (
                <div className="w-20 sm:w-28 md:w-32 cursor-grabbing pointer-events-none transform scale-[1.05] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85)] rounded-xl ring-2 ring-zinc-400">
                  <PlayingCard card={activeCard} isHoverable={false} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Reorder Undo Toast Notification */}
      {showUndoToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-zinc-900 border border-zinc-700 text-zinc-200 px-4 py-2.5 rounded-full shadow-2xl text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>Cards reordered.</span>
          <button
            type="button"
            onClick={handleUndoReorder}
            className="flex items-center gap-1 font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 ml-1"
          >
            <Undo2 className="w-3.5 h-3.5" /> Undo
          </button>
        </div>
      )}
    </div>
  );
};
