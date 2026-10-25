'use client';

import React, { useState } from 'react';
import { Player } from '@/types/game';
import {
  Copy,
  Check,
  Lock,
  Unlock,
  Users,
  Shield,
  ArrowRight,
  Share2,
  Layers,
  Sparkles,
  Minus,
  Plus,
} from 'lucide-react';

interface LobbyViewProps {
  roomId: string;
  isHost: boolean;
  isLocked: boolean;
  players: Player[];
  currentPlayerId: string;
  numDecks: number;
  numJokers: number;
  onUpdateRoomPoolConfig: (decks: number, jokers: number) => void;
  onToggleLock: () => void;
  onProceedToSetup: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  roomId,
  isHost,
  isLocked,
  players,
  currentPlayerId,
  numDecks,
  numJokers,
  onUpdateRoomPoolConfig,
  onToggleLock,
  onProceedToSetup,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const totalPoolCards = numDecks * 52 + numJokers;

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}?room=${roomId}`
      : `?room=${roomId}`;

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyCode = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(roomId);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col items-center">
        {/* Title */}
        <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-3 text-zinc-100 shadow-inner">
          <Users className="w-6 h-6" />
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white text-center tracking-tight">
          Game Lobby
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 text-center mt-1">
          Share room code or link to assemble your table.
        </p>

        {/* Room Code & Share Link Card */}
        <div className="w-full my-5 p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-zinc-500">
              Room Code
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="text-xs flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-white tracking-widest text-center py-1">
            {roomId}
          </div>

          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
            <span className="text-xs text-zinc-400 truncate max-w-[220px] sm:max-w-[320px]">
              {shareUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Room Master Pool Configuration (SET ONCE FOR THE ROOM BY HOST ONLY) */}
        <div className="w-full mb-5 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Room Master Card Pool
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {totalPoolCards} Total Cards
            </span>
          </div>

          {isHost ? (
            <div className="space-y-3 mt-3">
              {/* Decks selection (1-4) */}
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                  <span>Number of Decks (52 cards each)</span>
                  <span className="font-bold text-zinc-200">{numDecks} {numDecks === 1 ? 'Deck' : 'Decks'}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => onUpdateRoomPoolConfig(d, numJokers)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        numDecks === d
                          ? 'bg-white text-black border-white shadow-md'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {d} {d === 1 ? 'Deck' : 'Decks'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Jokers selection (0 to 12, all odd and even numbers) */}
              <div>
                <div className="flex justify-between items-center text-xs text-zinc-400 mb-1.5">
                  <span>Joker Cards in Master Pool (0–12)</span>
                  <span className="font-bold text-zinc-200">
                    {numJokers === 0 ? 'No Jokers' : `${numJokers} Joker${numJokers === 1 ? '' : 's'}`}
                  </span>
                </div>

                {/* Stepper control */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-zinc-800 mb-2">
                  <button
                    type="button"
                    disabled={numJokers <= 0}
                    onClick={() => onUpdateRoomPoolConfig(numDecks, Math.max(0, numJokers - 1))}
                    className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-zinc-200 transition-colors"
                    title="Decrease Jokers"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-mono font-bold text-white">{numJokers}</span>
                    <span className="text-xs text-zinc-400">Jokers</span>
                  </div>

                  <button
                    type="button"
                    disabled={numJokers >= 12}
                    onClick={() => onUpdateRoomPoolConfig(numDecks, Math.min(12, numJokers + 1))}
                    className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-zinc-200 transition-colors"
                    title="Increase Jokers"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick select buttons for all 13 values: 0 to 12 */}
                <div className="grid grid-cols-7 gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => onUpdateRoomPoolConfig(numDecks, j)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        numJokers === j
                          ? 'bg-white text-black border-white shadow-md scale-105'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60'
                      }`}
                    >
                      {j === 0 ? '0' : j}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-zinc-500 pt-1">
                * Configured once by Host for the room. All rounds draw from this common pool.
              </p>
            </div>
          ) : (
            <div className="mt-2 text-xs text-zinc-400 flex flex-col gap-1 bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800/60">
              <div className="flex justify-between">
                <span>Decks:</span>
                <span className="font-bold text-zinc-200">{numDecks} ({numDecks * 52} cards)</span>
              </div>
              <div className="flex justify-between">
                <span>Jokers:</span>
                <span className="font-bold text-zinc-200">
                  {numJokers === 0 ? 'None' : `${numJokers} Joker${numJokers === 1 ? '' : 's'}`}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 italic mt-0.5">
                Configured by Host. Same for all players in this table.
              </span>
            </div>
          )}
        </div>

        {/* Players Roster */}
        <div className="w-full mb-5">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Players Joined ({players.length})
            </span>
            <span className="text-[11px] text-zinc-500">Min 2 recommended</span>
          </div>

          <div className="divide-y divide-zinc-800 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 overflow-hidden">
            {players.map((p) => {
              const isMe = p.id === currentPlayerId;
              return (
                <div
                  key={p.id}
                  className="px-4 py-2.5 flex items-center justify-between text-sm hover:bg-zinc-900/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        p.connected ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                      title={p.connected ? 'Connected' : 'Disconnected'}
                    />
                    <span className="font-semibold text-zinc-200">{p.name}</span>
                    {isMe && <span className="text-xs text-zinc-500">(You)</span>}
                  </div>
                  {p.isHost && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 font-medium flex items-center gap-1">
                      <Shield className="w-3 h-3 text-amber-400" /> Host
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Host Controls: Locking Room & Proceeding */}
        {isHost ? (
          <div className="w-full flex flex-col gap-3">
            <button
              type="button"
              onClick={onToggleLock}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                isLocked
                  ? 'bg-amber-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-600/30'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
              }`}
            >
              {isLocked ? (
                <>
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Room is Locked (No new joins)</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 text-zinc-400" />
                  <span>Room is Unlocked (Click to Lock)</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={!isLocked || players.length === 0}
              onClick={onProceedToSetup}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                isLocked && players.length > 0
                  ? 'bg-white text-black hover:bg-zinc-200 shadow-xl cursor-pointer'
                  : 'bg-zinc-800/50 text-zinc-500 border border-zinc-800 cursor-not-allowed'
              }`}
            >
              <span>Setup Round 1</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {!isLocked && (
              <p className="text-[11px] text-amber-400/90 text-center">
                * The Host must Lock the room before any rounds can start.
              </p>
            )}
          </div>
        ) : (
          <div className="w-full text-center py-3 px-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400">
            {isLocked
              ? 'Room is locked by Host. Waiting for round setup...'
              : 'Waiting for Host to configure pool, lock room and start...'}
          </div>
        )}
      </div>
    </div>
  );
};
