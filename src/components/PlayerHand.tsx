'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
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
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, HandViewMode } from '@/types/game';
import { SortableCard } from './SortableCard';
import { PlayingCard } from './PlayingCard';
import { Layers, AlignJustify, Sparkles, Undo2, Check, GripVertical } from 'lucide-react';
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

  // Custom scroll indicator state for organize mode
  const [scrollThumbTop, setScrollThumbTop] = useState(0);
  const [scrollThumbHeight, setScrollThumbHeight] = useState(0);
  const [showScrollRail, setShowScrollRail] = useState(false);
  const [isDraggingThumb, setIsDraggingThumb] = useState(false);
  const scrollRailRef = useRef<HTMLDivElement>(null);
  const thumbDragStartRef = useRef<{ startY: number; startScrollTop: number } | null>(null);

  useEffect(() => {
    setViewMode(loadHandViewMode());
  }, []);

  // Scroll position tracker for custom scroll indicator during organize mode
  const updateScrollIndicator = useCallback(() => {
    if (!isOrganizeMode) return;
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const scrollHeight = doc.scrollHeight;
    const clientHeight = doc.clientHeight;
    const maxScroll = scrollHeight - clientHeight;

    if (maxScroll <= 0) {
      setShowScrollRail(false);
      return;
    }

    setShowScrollRail(true);

    const railHeight = clientHeight - 120; // Account for sticky header + padding
    const thumbH = Math.max(44, (clientHeight / scrollHeight) * railHeight); // Min 44px for touch
    const thumbT = (scrollTop / maxScroll) * (railHeight - thumbH);

    setScrollThumbHeight(thumbH);
    setScrollThumbTop(thumbT);
  }, [isOrganizeMode]);

  useEffect(() => {
    if (isOrganizeMode) {
      updateScrollIndicator();
      window.addEventListener('scroll', updateScrollIndicator, { passive: true });
      window.addEventListener('resize', updateScrollIndicator, { passive: true });
      return () => {
        window.removeEventListener('scroll', updateScrollIndicator);
        window.removeEventListener('resize', updateScrollIndicator);
      };
    } else {
      setShowScrollRail(false);
    }
  }, [isOrganizeMode, updateScrollIndicator, cards.length]);

  // Custom scroll thumb drag handlers
  const handleThumbPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingThumb(true);
    thumbDragStartRef.current = {
      startY: e.clientY,
      startScrollTop: window.scrollY,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handleThumbPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingThumb || !thumbDragStartRef.current) return;
    e.preventDefault();

    const doc = document.documentElement;
    const clientHeight = doc.clientHeight;
    const scrollHeight = doc.scrollHeight;
    const maxScroll = scrollHeight - clientHeight;
    const railHeight = clientHeight - 120;

    const deltaY = e.clientY - thumbDragStartRef.current.startY;
    const scrollDelta = (deltaY / railHeight) * maxScroll;
    const newScroll = Math.max(0, Math.min(maxScroll, thumbDragStartRef.current.startScrollTop + scrollDelta));

    window.scrollTo({ top: newScroll, behavior: 'auto' });
  }, [isDraggingThumb]);

  const handleThumbPointerUp = useCallback((e: React.PointerEvent) => {
    setIsDraggingThumb(false);
    thumbDragStartRef.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  // Tap on rail to jump scroll position
  const handleRailClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRailRef.current) return;
    const rect = scrollRailRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const railHeight = rect.height;

    const doc = document.documentElement;
    const maxScroll = doc.scrollHeight - doc.clientHeight;
    const ratio = clickY / railHeight;
    window.scrollTo({ top: ratio * maxScroll, behavior: 'smooth' });
  }, []);

  const handleToggleViewMode = () => {
    const next = viewMode === 'fanned' ? 'segregated' : 'fanned';
    setViewMode(next);
    saveHandViewMode(next);
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 50, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const triggerHaptic = (ms: number = 15) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(ms); } catch (e) { /* fallback */ }
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCardId(String(event.active.id));
    lastOverIdRef.current = String(event.active.id);
    triggerHaptic(20);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over ? String(event.over.id) : null;
    if (overId && overId !== lastOverIdRef.current) {
      lastOverIdRef.current = overId;
      triggerHaptic(10);
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
      setUndoState([...cards]);
      const reordered = arrayMove(cards, oldIndex, newIndex);
      onCardsReordered(reordered);

      setFlashingCardId(String(active.id));
      setTimeout(() => setFlashingCardId(null), 500);

      setShowUndoToast(true);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => setShowUndoToast(false), 5000);
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
    toastTimeoutRef.current = setTimeout(() => setShowUndoToast(false), 5000);
  };

  const activeCard = activeCardId ? cards.find((c) => c.id === activeCardId) : null;
  const sortingStrategy = isOrganizeMode ? rectSortingStrategy : horizontalListSortingStrategy;

  return (
    <div className="w-full flex flex-col items-center select-none py-1 relative">
      {/* Hand Controls Header — STICKY during organize mode so it never scrolls away */}
      <div
        className={`w-full max-w-4xl px-3 py-2 flex items-center justify-between gap-2 border-b border-zinc-800/80 bg-zinc-950 z-30 ${
          isOrganizeMode ? 'sticky top-[44px] sm:top-[48px] shadow-lg shadow-black/40' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider uppercase text-zinc-300">
            {isOrganizeMode ? 'Organize Mode' : 'Your Hand'}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-200 font-mono font-medium">
            {cards.length} {cards.length === 1 ? 'card' : 'cards'}
          </span>
          {phaseLabel && !isOrganizeMode && (
            <span className="hidden sm:inline-block text-xs text-zinc-400">• {phaseLabel}</span>
          )}
          {isOrganizeMode && (
            <span className="text-[11px] text-amber-400/80 hidden sm:inline">
              Drag cards to reorder
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle (hidden in organize mode) */}
          {!isOrganizeMode && (
            <button
              type="button"
              onClick={handleToggleViewMode}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-xs text-zinc-300 transition-colors active:scale-95"
            >
              {viewMode === 'fanned' ? (
                <>
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="hidden xs:inline">Fanned</span>
                </>
              ) : (
                <>
                  <AlignJustify className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="hidden xs:inline">Spread</span>
                </>
              )}
            </button>
          )}

          {/* Organize Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsOrganizeMode((prev) => !prev)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              isOrganizeMode
                ? 'bg-amber-400 text-black hover:bg-amber-300 shadow-lg shadow-amber-500/25'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
            }`}
          >
            {isOrganizeMode ? (
              <>
                <Check className="w-4 h-4" />
                <span>Done</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Organize</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cards Area — directly on page, no inner scroll container */}
      <div
        className={`w-full max-w-5xl ${
          isOrganizeMode
            ? 'px-2 sm:px-4 py-4'
            : 'overflow-x-auto overflow-y-visible px-3 py-3 min-h-[125px] sm:min-h-[155px] scroll-smooth'
        }`}
      >
        {cards.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-xs text-zinc-500 italic">
            No cards in hand
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            autoScroll={{
              threshold: { x: 0.05, y: 0.12 },
              acceleration: 2,
              interval: 15,
            }}
          >
            <SortableContext items={cards.map((c) => c.id)} strategy={sortingStrategy}>
              {isOrganizeMode ? (
                /* Organize Mode: Responsive Grid — flows directly on main page */
                <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3 py-1">
                  {cards.map((card, idx) => (
                    <SortableCard
                      key={card.id}
                      card={card}
                      index={idx}
                      totalCards={cards.length}
                      isOrganizeMode={true}
                      isDimmed={Boolean(activeCardId && activeCardId !== card.id)}
                      viewMode="segregated"
                      flashingCardId={flashingCardId}
                      onCardClick={onCardClick}
                      onMoveCard={handleMoveCard}
                      isSelectedForDiscard={selectedCardIds.includes(card.id)}
                    />
                  ))}
                </div>
              ) : (
                /* Normal Mode: Guaranteed height horizontal hand */
                <div
                  className={`flex items-center justify-center min-w-max mx-auto py-1 ${
                    viewMode === 'segregated' ? 'gap-2 sm:gap-3' : 'gap-0'
                  }`}
                >
                  {cards.map((card, idx) => (
                    <SortableCard
                      key={card.id}
                      card={card}
                      index={idx}
                      totalCards={cards.length}
                      isOrganizeMode={false}
                      isDimmed={Boolean(activeCardId && activeCardId !== card.id)}
                      viewMode={viewMode}
                      flashingCardId={flashingCardId}
                      onCardClick={onCardClick}
                      onMoveCard={handleMoveCard}
                      isSelectedForDiscard={selectedCardIds.includes(card.id)}
                    />
                  ))}
                </div>
              )}
            </SortableContext>

            {/* Drag Overlay with 5% scale & deep shadow */}
            <DragOverlay dropAnimation={null}>
              {activeCard ? (
                <div className="w-[76px] h-[106px] sm:w-[94px] sm:h-[131px] md:w-[106px] md:h-[148px] cursor-grabbing pointer-events-none transform scale-[1.05] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.95)] rounded-xl ring-2 ring-amber-400">
                  <PlayingCard card={activeCard} isHoverable={false} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* ══════════ CUSTOM SCROLL RAIL — Big, amber, always visible during organize mode ══════════ */}
      {isOrganizeMode && showScrollRail && (
        <div
          ref={scrollRailRef}
          onClick={handleRailClick}
          className="fixed right-0 top-[100px] bottom-[20px] w-[22px] z-50 flex items-start justify-center cursor-pointer"
          style={{ touchAction: 'none' }}
        >
          {/* Rail track background */}
          <div className="absolute inset-y-0 right-[3px] w-[16px] rounded-full bg-zinc-800/90 border border-zinc-700/60" />

          {/* Thumb — big, amber, always visible, draggable */}
          <div
            onPointerDown={handleThumbPointerDown}
            onPointerMove={handleThumbPointerMove}
            onPointerUp={handleThumbPointerUp}
            onPointerCancel={handleThumbPointerUp}
            className={`absolute right-[3px] w-[16px] rounded-full transition-colors scroll-rail-glow flex items-center justify-center ${
              isDraggingThumb
                ? 'bg-amber-300 scale-x-110'
                : 'bg-amber-500 hover:bg-amber-400'
            }`}
            style={{
              top: `${scrollThumbTop}px`,
              height: `${scrollThumbHeight}px`,
              touchAction: 'none',
              minHeight: '44px',
            }}
          >
            <GripVertical className="w-3 h-3 text-black/50 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Reorder Undo Toast Snackbar */}
      {showUndoToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-zinc-900 border border-zinc-700 text-zinc-200 px-4 py-2.5 rounded-full shadow-2xl text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-2 duration-150">
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
