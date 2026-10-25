'use client';

import React from 'react';
import { DeskCard } from '@/types/game';
import { PlayingCard } from './PlayingCard';
import { Trophy, RotateCcw } from 'lucide-react';

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
  const allPlayersHavePlayed = cards.length > 0 && cards.length >= totalPlayersCount;

  return (
    <div className="w-full flex flex-col items-center justify-center px-2 py-1">
      <div className="w-full max-w-4xl rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-inner flex flex-col items-center justify-between p-2.5 sm:p-3 relative backdrop-blur-sm">
        {cards.length === 0 ? (
          /* Compact empty desk — just a short hint, no giant box */
          <div className="flex items-center justify-center gap-3 py-6 sm:py-8 text-zinc-500">
            <div className="w-11 h-16 rounded-lg border-2 border-dashed border-zinc-800 flex items-center justify-center opacity-50">
              <span className="text-sm">🂠</span>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-zinc-400">Desk is empty</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">Tap a card below to play it</p>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 py-2">
            {cards.map((deskCard) => (
              <div
                key={deskCard.card.id}
                className="flex flex-col items-center animate-in zoom-in-95 duration-150"
              >
                <div className="relative w-16 sm:w-24 md:w-28">
                  <PlayingCard card={deskCard.card} isHoverable={false} />

                  {/* Win overlay: ONLY when 100% of players have played */}
                  {isHost && allPlayersHavePlayed && (
                    <button
                      type="button"
                      onClick={() => onAwardWinner(deskCard)}
                      className="absolute inset-x-1.5 bottom-1.5 py-1.5 px-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-lg flex items-center justify-center gap-1 transition-transform active:scale-95 animate-pulse"
                    >
                      <Trophy className="w-3 h-3" />
                      <span>Win</span>
                    </button>
                  )}
                </div>

                {/* Player Name Badge */}
                <div className="mt-1.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-800/90 border border-zinc-700/60 shadow-sm text-[11px] max-w-[120px] truncate">
                  <span className="font-semibold text-zinc-200 truncate">{deskCard.playerName}</span>
                  {deskCard.playerId === currentPlayerId && (
                    <span className="text-[9px] text-zinc-400">(You)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Desk Footer Status & Player Undo */}
        <div className="w-full flex items-center justify-between mt-1.5 pt-1.5 border-t border-zinc-800/40 text-[11px] px-1">
          <div className="text-zinc-500">
            Desk:{' '}
            <span className="text-zinc-300 font-mono font-medium">{cards.length}</span> /{' '}
            <span className="text-zinc-400 font-mono">{totalPlayersCount}</span> played
          </div>

          {canRequestUndo && (
            <button
              type="button"
              disabled={isUndoPending}
              onClick={onRequestUndo}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white transition-all text-[11px] disabled:opacity-50 active:scale-95"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isUndoPending ? 'Requested...' : 'Take Back Card'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
