'use client';

import React, { useState } from 'react';
import { Card } from '@/types/game';
import { PlayerHand } from './PlayerHand';
import { Trash2, CheckCircle2, Play } from 'lucide-react';

interface DiscardPhaseProps {
  hand: Card[];
  discarded: Card[];
  isHost: boolean;
  onCardsReordered: (cards: Card[]) => void;
  onConfirmDiscard: (cardsToDiscard: Card[]) => void;
  onHostStartPlay: () => void;
  totalPlayersCount: number;
  playersDiscardedCount: number;
}

export const DiscardPhase: React.FC<DiscardPhaseProps> = ({
  hand,
  discarded,
  isHost,
  onCardsReordered,
  onConfirmDiscard,
  onHostStartPlay,
  totalPlayersCount,
  playersDiscardedCount,
}) => {
  const [selectedForDiscard, setSelectedForDiscard] = useState<string[]>([]);
  const [isOrganizeMode, setIsOrganizeMode] = useState(false);
  const hasDiscarded = discarded.length > 0;

  const handleCardClick = (card: Card) => {
    if (hasDiscarded) return;
    setSelectedForDiscard((prev) =>
      prev.includes(card.id) ? prev.filter((id) => id !== card.id) : [...prev, card.id]
    );
  };

  const handleCommitDiscard = () => {
    const cardsToDiscard = hand.filter((c) => selectedForDiscard.includes(c.id));
    onConfirmDiscard(cardsToDiscard);
    setSelectedForDiscard([]);
  };

  return (
    <div className="w-full flex flex-col items-center justify-between min-h-[60vh] p-4">
      {/* Header Info */}
      <div className="w-full max-w-2xl bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 text-center mb-4">
        <h2 className="text-lg font-bold text-zinc-100 flex items-center justify-center gap-2">
          <Trash2 className="w-5 h-5 text-amber-500" />
          Discard Phase
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          {hasDiscarded
            ? `You discarded ${discarded.length} card${discarded.length === 1 ? '' : 's'}. Waiting for the round to begin.`
            : 'Tap cards to select them for removal, or keep your hand as is and confirm.'}
        </p>

        {/* Status bar */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs">
          <span className="text-zinc-400">
            Players finalized:{' '}
            <span className="text-zinc-200 font-mono font-bold">
              {playersDiscardedCount} / {totalPlayersCount}
            </span>
          </span>
          {isHost && (
            <button
              type="button"
              onClick={onHostStartPlay}
              className="px-4 py-1.5 rounded-lg bg-white text-black font-bold hover:bg-zinc-200 transition-colors flex items-center gap-1.5 text-xs shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              Begin Tricks
            </button>
          )}
        </div>
      </div>

      {/* Discard Action Bar */}
      {!hasDiscarded && (
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleCommitDiscard}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg ${
              selectedForDiscard.length > 0
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            {selectedForDiscard.length > 0 ? (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Discard Selected ({selectedForDiscard.length})</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Keep All Cards (No Discard)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Hand Component with DnD kit */}
      <div className="w-full mt-auto">
        <PlayerHand
          cards={hand}
          onCardsReordered={onCardsReordered}
          onCardClick={handleCardClick}
          selectedCardIds={selectedForDiscard}
          phaseLabel={hasDiscarded ? 'Discards finalized' : 'Tap to select discard'}
          isOrganizeMode={isOrganizeMode}
          setIsOrganizeMode={setIsOrganizeMode}
        />
      </div>
    </div>
  );
};
