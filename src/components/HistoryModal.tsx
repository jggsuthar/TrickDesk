'use client';

import React from 'react';
import { RoundHistory } from '@/types/game';
import { History, X } from 'lucide-react';

interface HistoryModalProps {
  history: RoundHistory[];
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ history, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-zinc-400" />
            <h2 className="text-base font-bold text-zinc-100">Score History</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-4 pr-1">
          {history.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-6">No previous rounds recorded yet.</p>
          ) : (
            history.map((record) => (
              <div
                key={record.roundNumber}
                className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-3.5"
              >
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Round {record.roundNumber}
                </div>
                <div className="space-y-1.5">
                  {record.scores.map((score) => (
                    <div
                      key={score.playerId}
                      className="flex items-center justify-between text-xs sm:text-sm py-1 px-2 rounded-lg bg-zinc-900/50"
                    >
                      <span className="font-medium text-zinc-200">{score.playerName}</span>
                      <span className="font-mono font-bold text-zinc-300">
                        {score.stacksWon} {score.stacksWon === 1 ? 'stack' : 'stacks'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
