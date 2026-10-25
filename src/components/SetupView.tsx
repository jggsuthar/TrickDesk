'use client';

import React, { useState } from 'react';
import { Player } from '@/types/game';
import { Play, Minus, Plus, AlertTriangle, Layers, Trash2 } from 'lucide-react';

interface SetupViewProps {
  roundNumber: number;
  players: Player[];
  numDecks: number;
  numJokers: number;
  isHost: boolean;
  onStartDealing: (cardsPerPlayer: number, cardsToDiscard: number) => void;
}

export const SetupView: React.FC<SetupViewProps> = ({
  roundNumber,
  players,
  numDecks,
  numJokers,
  isHost,
  onStartDealing,
}) => {
  const [cardsPerPlayer, setCardsPerPlayer] = useState<number>(10);
  const [cardsToDiscard, setCardsToDiscard] = useState<number>(0);

  const totalPoolSize = numDecks * 52 + numJokers;
  const playerCount = Math.max(1, players.length);
  const totalCardsNeeded = cardsPerPlayer * playerCount;
  const maxPossiblePerPlayer = Math.floor(totalPoolSize / playerCount);
  const isOverCapacity = totalCardsNeeded > totalPoolSize;

  const handleStart = () => {
    if (!isHost) return;
    if (isOverCapacity || cardsPerPlayer <= 0 || cardsToDiscard >= cardsPerPlayer) return;
    onStartDealing(cardsPerPlayer, cardsToDiscard);
  };

  if (!isHost) {
    return (
      <div className="w-full max-w-md mx-auto p-6 text-center">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
          <Layers className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white">Round {roundNumber} Setup</h2>
          <p className="text-xs text-zinc-400 mt-2">
            The Host is configuring card distribution for all players.
          </p>
          <div className="mt-4 p-3 rounded-xl bg-zinc-950 text-xs text-zinc-400 border border-zinc-800">
            Pool: {numDecks} Decks + {numJokers} Jokers ({totalPoolSize} total cards)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center">
        {/* Header */}
        <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-3 text-zinc-100 shadow-inner">
          <Layers className="w-6 h-6 text-white" />
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white text-center tracking-tight">
          Round {roundNumber} Setup
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 text-center mt-1">
          Common Pool: <span className="font-semibold text-zinc-200">{numDecks} {numDecks === 1 ? 'Deck' : 'Decks'}</span>
          {numJokers > 0 ? ` + ${numJokers} Jokers` : ''} ({totalPoolSize} cards)
        </p>

        {/* Configuration #1: How many cards per player */}
        <div className="w-full my-5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              #1. Cards Per Player
            </label>
            <span className="text-xs text-zinc-500">
              Max available: {maxPossiblePerPlayer}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                const next = Math.max(1, cardsPerPlayer - 1);
                setCardsPerPlayer(next);
                if (cardsToDiscard >= next) {
                  setCardsToDiscard(Math.max(0, next - 1));
                }
              }}
              className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 flex items-center justify-center text-zinc-200 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center">
              <span className="text-2xl font-mono font-black text-white">{cardsPerPlayer}</span>
              <span className="text-[11px] text-zinc-400">
                {totalCardsNeeded} cards dealt across {playerCount} player{playerCount === 1 ? '' : 's'}
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

          {isOverCapacity && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 flex items-start gap-2.5 text-xs animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Pool Capacity Exceeded: </span>
                {cardsPerPlayer} cards to {playerCount} player{playerCount === 1 ? '' : 's'} requires{' '}
                {totalCardsNeeded} cards, but common pool only has {totalPoolSize}.
              </div>
            </div>
          )}
        </div>

        {/* Configuration #2: How many cards to be discarded */}
        <div className="w-full mb-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-amber-400" />
              #2. Cards To Be Discarded
            </label>
            <span className="text-xs text-zinc-500">
              {cardsToDiscard === 0 ? 'Disabled' : `Exactly ${cardsToDiscard} per player`}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800">
            <button
              type="button"
              onClick={() => setCardsToDiscard((prev) => Math.max(0, prev - 1))}
              className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 flex items-center justify-center text-zinc-200 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center">
              <span className="text-2xl font-mono font-black text-white">{cardsToDiscard}</span>
              <span className="text-[11px] text-zinc-400">
                {cardsToDiscard === 0
                  ? 'No discard phase (direct trick play)'
                  : `Each player must discard exactly ${cardsToDiscard} card${cardsToDiscard === 1 ? '' : 's'}`}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setCardsToDiscard((prev) => Math.min(cardsPerPlayer - 1, prev + 1))
              }
              className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 flex items-center justify-center text-zinc-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Start Button */}
        <button
          type="button"
          disabled={isOverCapacity || cardsPerPlayer <= 0 || cardsToDiscard >= cardsPerPlayer}
          onClick={handleStart}
          className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
            !isOverCapacity && cardsPerPlayer > 0 && cardsToDiscard < cardsPerPlayer
              ? 'bg-white text-black hover:bg-zinc-200 cursor-pointer'
              : 'bg-zinc-800/50 text-zinc-500 border border-zinc-800 cursor-not-allowed'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Deal Round {roundNumber} from Common Pool</span>
        </button>
      </div>
    </div>
  );
};
