'use client';

import React from 'react';
import { DeskCard, Card } from '@/types/game';
import { PlayingCard } from './PlayingCard';
import { Trophy, RotateCcw, ShieldAlert } from 'lucide-react';

interface DeskProps {
  cards: DeskCard[];
  isHost: boolean;
  currentPlayerId: string;
  totalPlayersCount: number;
  onAwardWinner: (winningCard: DeskCard) => void;
  onRequestUndo: () => void;
  canRequestUndo: boolean;
  isUndoPending?: boolean;
}

export const Desk: React.FC<DeskProps> = ({
  cards,
  isHost,
  currentPlayerId,
  totalPlayersCount,
  onAwardWinner,
  onRequestUndo,
  canRequestUndo,
  isUndoPending = false,
}) => {
  // Win overlay/button must ONLY appear on desk cards AFTER every single player has played
  const allPlayersHavePlayed = cards.length > 0 && cards.length >= totalPlayersCount;

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      {/* Central Desk Mat */}
      <div className="w-full max-w-4xl min-h-[260px] sm:min-h-[300px] rounded-3xl bg-zinc-900/60 border border-zinc-800/80 shadow-inner flex flex-col items-center justify-center p-4 relative backdrop-blur-sm">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 text-zinc-500">
            <div className="w-16 h-24 rounded-xl border-2 border-dashed border-zinc-800 flex items-center justify-center mb-3">
              <span className="text-xl">🂠</span>
            </div>
            <p className="text-sm font-medium text-zinc-400">Desk is clear</p>
            <p className="text-xs text-zinc-600 mt-0.5">Tap a card in your hand to play it</p>
          </div>
        ) : (
          <div className="w-full flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-2">
            {cards.map((deskCard, idx) => {
              const isLastPlayed = idx === cards.length - 1;
              return (
                <div
                  key={deskCard.card.id}
                  className="flex flex-col items-center animate-in zoom-in-95 duration-200"
                >
                  <div className="relative w-20 sm:w-28 md:w-32">
                    <PlayingCard card={deskCard.card} isHoverable={false} />

                    {/* Win overlay: ONLY shown to Host when 100% of players have played their card for this trick */}
                    {isHost && allPlayersHavePlayed && (
                      <button
                        type="button"
                        onClick={() => onAwardWinner(deskCard)}
                        className="absolute inset-x-2 bottom-2 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1 transition-transform active:scale-95 animate-pulse"
                      >
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Win</span>
                      </button>
                    )}
                  </div>

                  {/* Player Name Badge */}
                  <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/90 border border-zinc-700/60 shadow-sm text-xs max-w-[130px] truncate">
                    <span className="font-semibold text-zinc-200 truncate">{deskCard.playerName}</span>
                    {deskCard.playerId === currentPlayerId && (
                      <span className="text-[10px] text-zinc-400">(You)</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Desk Footer Status & Player Undo Button */}
        <div className="w-full flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/50 text-xs px-2">
          <div className="text-zinc-500">
            Played: <span className="text-zinc-300 font-mono font-medium">{cards.length}</span> /{' '}
            <span className="text-zinc-400 font-mono">{totalPlayersCount}</span>
          </div>

          {/* Reverse order undo button for the last player who played */}
          {canRequestUndo && (
            <button
              type="button"
              disabled={isUndoPending}
              onClick={onRequestUndo}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white transition-all text-xs disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isUndoPending ? 'Undo Requested...' : 'Take Back Card'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
