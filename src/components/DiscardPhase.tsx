'use client';

import React, { useState } from 'react';
import { Card, Player } from '@/types/game';
import { PlayerHand } from './PlayerHand';
import { Trash2, Play, Clock } from 'lucide-react';

interface DiscardPhaseProps {
  hand: Card[];
  discarded: Card[];
  hasDiscarded: boolean;
  cardsToDiscard: number;
  players: Player[];
  isHost: boolean;
  onCardsReordered: (cards: Card[]) => void;
  onConfirmDiscard: (cardsToDiscard: Card[]) => void;
  onHostStartPlay: () => void;
}

export const DiscardPhase: React.FC<DiscardPhaseProps> = ({
  hand,
  discarded,
  hasDiscarded,
  cardsToDiscard,
  players,
  isHost,
  onCardsReordered,
  onConfirmDiscard,
  onHostStartPlay,
}) => {
  const [selectedForDiscard, setSelectedForDiscard] = useState<string[]>([]);
  const [isOrganizeMode, setIsOrganizeMode] = useState(false);

  const totalPlayers = players.length;
  const playersDiscardedCount = players.filter((p) => p.hasDiscarded).length;
  const allPlayersDiscarded = totalPlayers > 0 && playersDiscardedCount === totalPlayers;

  const handleCardClick = (card: Card) => {
    if (hasDiscarded || isOrganizeMode) return;
    setSelectedForDiscard((prev) => {
      if (prev.includes(card.id)) {
        return prev.filter((id) => id !== card.id);
      }
      if (prev.length >= cardsToDiscard) {
        return [...prev.slice(1), card.id];
      }
      return [...prev, card.id];
    });
  };

  const handleCommitDiscard = () => {
    if (selectedForDiscard.length !== cardsToDiscard) return;
    const cards = hand.filter((c) => selectedForDiscard.includes(c.id));
    onConfirmDiscard(cards);
    setSelectedForDiscard([]);
  };

  const remainingToSelect = cardsToDiscard - selectedForDiscard.length;

  return (
    <div className="w-full flex flex-col items-center py-2 px-1 sm:px-3">
      {/* Header Info Banner: Hidden during Organize Mode to maximize grid space */}
      {!isOrganizeMode && (
        <div className="w-full max-w-xl bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 sm:p-4 text-center mb-2 shadow-lg">
          <h2 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4 text-amber-500" />
            Discard Phase — Select {cardsToDiscard} card{cardsToDiscard === 1 ? '' : 's'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {hasDiscarded
              ? `You discarded ${discarded.length} card${discarded.length === 1 ? '' : 's'}. Waiting for table to finish.`
              : `Tap exactly ${cardsToDiscard} card${cardsToDiscard === 1 ? '' : 's'} from your hand to remove from this round.`}
          </p>

          {/* Players Status Chips */}
          <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-center gap-1.5">
            {players.map((p) => (
              <span
                key={p.id}
                className={`px-2 py-0.5 rounded-full border text-[11px] flex items-center gap-1 ${
                  p.hasDiscarded
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    p.hasDiscarded ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                  }`}
                />
                <span className="font-medium">{p.name}</span>
                {p.hasDiscarded ? '✓' : '…'}
              </span>
            ))}
          </div>

          {/* Host Start Playing Button */}
          {isHost && (
            <div className="mt-3 pt-2.5 border-t border-zinc-800/80">
              <button
                type="button"
                disabled={!allPlayersDiscarded}
                onClick={onHostStartPlay}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  allPlayersDiscarded
                    ? 'bg-white text-black hover:bg-zinc-200 shadow-xl cursor-pointer active:scale-95'
                    : 'bg-zinc-800/50 text-zinc-500 border border-zinc-800 cursor-not-allowed'
                }`}
              >
                {allPlayersDiscarded ? (
                  <>
                    <Play className="w-4 h-4 fill-black" />
                    <span>All Discards Complete — Start Tricks</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-zinc-500" />
                    <span>Waiting ({playersDiscardedCount}/{totalPlayers})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Discard Confirm Button: Hidden during Organize Mode */}
      {!isOrganizeMode && !hasDiscarded && (
        <div className="mb-2">
          <button
            type="button"
            disabled={selectedForDiscard.length !== cardsToDiscard}
            onClick={handleCommitDiscard}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg active:scale-95 ${
              selectedForDiscard.length === cardsToDiscard
                ? 'bg-red-600 hover:bg-red-500 text-white cursor-pointer'
                : 'bg-zinc-800/60 text-zinc-500 border border-zinc-800 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>
              {selectedForDiscard.length === cardsToDiscard
                ? `Confirm Discard (${cardsToDiscard})`
                : `Select ${remainingToSelect} more`}
            </span>
          </button>
        </div>
      )}

      {/* Hand with DnD kit */}
      <div className="w-full">
        <PlayerHand
          cards={hand}
          onCardsReordered={onCardsReordered}
          onCardClick={handleCardClick}
          selectedCardIds={selectedForDiscard}
          phaseLabel={
            hasDiscarded
              ? 'Discards submitted'
              : `${selectedForDiscard.length}/${cardsToDiscard} selected`
          }
          isOrganizeMode={isOrganizeMode}
          setIsOrganizeMode={setIsOrganizeMode}
        />
      </div>
    </div>
  );
};
