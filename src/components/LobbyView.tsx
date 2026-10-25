'use client';

import React, { useState } from 'react';
import { Player } from '@/types/game';
import { Copy, Check, Lock, Unlock, Users, Shield, ArrowRight, Share2 } from 'lucide-react';

interface LobbyViewProps {
  roomId: string;
  isHost: boolean;
  isLocked: boolean;
  players: Player[];
  currentPlayerId: string;
  onToggleLock: () => void;
  onProceedToSetup: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  roomId,
  isHost,
  isLocked,
  players,
  currentPlayerId,
  onToggleLock,
  onProceedToSetup,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

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
      <div className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center">
        {/* Title */}
        <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-4 text-zinc-100 shadow-inner">
          <Users className="w-6 h-6" />
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white text-center tracking-tight">
          Game Lobby
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 text-center mt-1">
          Share room code or link to assemble your table.
        </p>

        {/* Room Code Card */}
        <div className="w-full my-6 p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex flex-col gap-3">
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

          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
            <span className="text-xs text-zinc-400 truncate max-w-[240px] sm:max-w-[320px]">
              {shareUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Players Roster */}
        <div className="w-full mb-6">
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
                  className="px-4 py-3 flex items-center justify-between text-sm hover:bg-zinc-900/30 transition-colors"
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
              <span>Configure Deck & Dealing</span>
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
              ? 'Room is locked by Host. Waiting for game setup...'
              : 'Waiting for Host to lock room and start the game...'}
          </div>
        )}
      </div>
    </div>
  );
};
