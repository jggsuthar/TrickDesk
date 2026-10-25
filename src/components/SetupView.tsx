'use client';

import React, { useState } from 'react';
import { Player } from '@/types/game';
import { Layers, AlertTriangle, Play, Sparkles, Minus, Plus } from 'lucide-react';

interface SetupViewProps {
  players: Player[];
  onStartDealing: (numDecks: number, cardsPerPlayer: number, enableDiscard: boolean) => void;
  onBackToLobby?: () => void;
}

export const SetupView: React.FC<SetupViewProps> = ({
  players,
  onStartDealing,
  onBackToLobby,
}) => {
  const [numDecks, setNumDecks] = useState<number>(1);
  const [cardsPerPlayer, setCardsPerPlayer] = useState<number>(13);
  const [enableDiscard, setEnableDiscard] = useState<boolean>(true);

  const playerCount = Math.max(1, players.length);
  const totalCardsInPool = numDecks * 52;
  const totalCardsNeeded = cardsPerPlayer * playerCount;
  const isOverCapacity = totalCardsNeeded > totalCardsInPool;
  const maxPossiblePerPlayer = Math.floor(totalCardsInPool / playerCount);

  const handleStart = () => {
    if (isOverCapacity || cardsPerPlayer <= 0) return;
    onStartDealing(numDecks, cardsPerPlayer, enableDiscard);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center">
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-4 text-zinc-100 shadow-inner">
          <Layers className="w-6 h-6" />
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white text-center tracking-tight">
          Game & Deck Setup
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 text-center mt-1">
          Configure decks and deal size for this round.
        </p>

        {/* 1. Deck Setup (1 to 4 Standard Decks) */}
        <div className="w-full my-6 flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Number of Decks (1 to 4)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setNumDecks(d)}
                className={`py-3 rounded-xl border text-center transition-all ${
                  numDecks === d
                    ? 'bg-white text-black font-bold border-white shadow-lg'
                    : 'bg-zinc-950/70 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <div className="text-sm sm:text-base font-extrabold">{d}</div>
                <div className="text-[10px] opacity-75">{d * 52} cards</div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Cards Per Player */}
        <div className="w-full mb-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Cards per Player
            </label>
            <span className="text-xs text-zinc-500">
              Max available: {maxPossiblePerPlayer} per player
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-2xl bg-zinc-950/80 border border-zinc-800">
            <button
              type="button"
              onClick={() => setCardsPerPlayer((prev) => Math.max(1, prev - 1))}
              className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 flex items-center justify-center text-zinc-200 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center">
              <span className="text-2xl font-mono font-black text-white">{cardsPerPlayer}</span>
              <span className="text-[10px] text-zinc-400">
                {totalCardsNeeded} of {totalCardsInPool} cards dealt
              </span>
            </div>

            <button
              type="button"
              onClick={() => setCardsPerPlayer((prev) => prev + 1)}
              className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 flex items-center justify-center text-zinc-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Capacity Restriction Error */}
          {isOverCapacity && (
            <div className="mt-2 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 flex items-start gap-2.5 text-xs animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Not enough cards available: </span>
                Dealing {cardsPerPlayer} cards to {playerCount} player{playerCount === 1 ? '' : 's'} requires{' '}
                {totalCardsNeeded} cards, but {numDecks} deck{numDecks === 1 ? '' : 's'} only contains{' '}
                {totalCardsInPool} cards. Reduce cards per player or add more decks.
              </div>
            </div>
          )}
        </div>

        {/* 3. Discard Phase Option */}
        <div className="w-full mb-6 p-3.5 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-zinc-200 block">Enable Discard Phase</span>
            <span className="text-[11px] text-zinc-500 block">
              Allows players to remove unwanted cards before trick-taking begins.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setEnableDiscard((prev) => !prev)}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
              enableDiscard ? 'bg-emerald-600' : 'bg-zinc-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                enableDiscard ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Start Button */}
        <button
          type="button"
          disabled={isOverCapacity || cardsPerPlayer <= 0}
          onClick={handleStart}
          className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
            !isOverCapacity && cardsPerPlayer > 0
              ? 'bg-white text-black hover:bg-zinc-200 cursor-pointer'
              : 'bg-zinc-800/50 text-zinc-500 border border-zinc-800 cursor-not-allowed'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Shuffle Master Pool & Deal</span>
        </button>
      </div>
    </div>
  );
};
