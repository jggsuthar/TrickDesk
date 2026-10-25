'use client';

import React, { useState } from 'react';
import { Player, RoundHistory } from '@/types/game';
import { Trophy, History, CheckCircle, ArrowRight, Clock } from 'lucide-react';
import { HistoryModal } from './HistoryModal';

interface RoundSummaryModalProps {
  roundNumber: number;
  players: Player[];
  currentPlayerId: string;
  isHost: boolean;
  history: RoundHistory[];
  onToggleReady: (isReady: boolean) => void;
  onHostNextRound: () => void;
}

export const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({
  roundNumber,
  players,
  currentPlayerId,
  isHost,
  history,
  onToggleReady,
  onHostNextRound,
}) => {
  const [showHistory, setShowHistory] = useState(false);

  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const isCurrentPlayerReady = currentPlayer?.isReady ?? false;

  const totalPlayers = players.length;
  const readyPlayersCount = players.filter((p) => p.isReady).length;
  const allReady = totalPlayers > 0 && readyPlayersCount === totalPlayers;

  // Find winner(s) of this specific round
  const maxStacks = Math.max(...players.map((p) => p.stacksWonThisRound), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 sm:p-8 flex flex-col items-center">
        {/* Round Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          Round {roundNumber} Complete
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white text-center">
          Round {roundNumber} Results
        </h2>
        <p className="text-xs text-zinc-400 text-center mt-1">
          Stacks won in this round
        </p>

        {/* Scores Table (ONLY this specific round) */}
        <div className="w-full my-6 divide-y divide-zinc-800/80 rounded-2xl bg-zinc-950/70 border border-zinc-800 p-2">
          {players.map((player) => {
            const isTop = player.stacksWonThisRound === maxStacks && maxStacks > 0;
            const isMe = player.id === currentPlayerId;
            return (
              <div
                key={player.id}
                className="flex items-center justify-between py-3 px-3 sm:px-4"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      player.isReady ? 'bg-emerald-500' : 'bg-zinc-600'
                    }`}
                    title={player.isReady ? 'Ready' : 'Not ready'}
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm sm:text-base text-zinc-100">
                        {player.name}
                      </span>
                      {isMe && <span className="text-xs text-zinc-500">(You)</span>}
                      {player.isHost && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                          Host
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-500">
                      {player.isReady ? 'Ready for next round' : 'Reviewing scores'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isTop && (
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                      Top
                    </span>
                  )}
                  <span className="font-mono text-base sm:text-lg font-bold text-white">
                    {player.stacksWonThisRound}{' '}
                    <span className="text-xs font-normal text-zinc-400">
                      {player.stacksWonThisRound === 1 ? 'stack' : 'stacks'}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ready Status & Strict Next Round Gate */}
        <div className="w-full flex flex-col items-center gap-3">
          <div className="flex items-center justify-between w-full text-xs text-zinc-400 px-1">
            <span>
              Players Ready:{' '}
              <span className="font-bold font-mono text-zinc-200">
                {readyPlayersCount} / {totalPlayers}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1 text-zinc-400 hover:text-white underline underline-offset-2 transition-colors"
            >
              <History className="w-3.5 h-3.5" /> History
            </button>
          </div>

          {/* Player Ready Toggle */}
          <button
            type="button"
            onClick={() => onToggleReady(!isCurrentPlayerReady)}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
              isCurrentPlayerReady
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isCurrentPlayerReady ? 'You Are Ready!' : 'Click When Ready'}</span>
          </button>

          {/* Host Next Round Initiation Button (Strictly Gated by 100% Ready) */}
          {isHost && (
            <div className="w-full mt-1">
              <button
                type="button"
                disabled={!allReady}
                onClick={onHostNextRound}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  allReady
                    ? 'bg-white text-black hover:bg-zinc-200 shadow-xl cursor-pointer'
                    : 'bg-zinc-800/60 text-zinc-500 border border-zinc-800 cursor-not-allowed'
                }`}
              >
                {allReady ? (
                  <>
                    <span>Proceed to Next Round Setup</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-zinc-600" />
                    <span>Waiting for 100% of Players to be Ready</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {showHistory && (
        <HistoryModal history={history} onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
};
