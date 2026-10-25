'use client';

import React from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

interface LeaveRoomModalProps {
  isOpen: boolean;
  roomId: string;
  isHost: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LeaveRoomModal: React.FC<LeaveRoomModalProps> = ({
  isOpen,
  roomId,
  isHost,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-2xl p-5 flex flex-col items-center text-center animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-3">
          {isHost ? <AlertTriangle className="w-6 h-6 text-amber-400" /> : <LogOut className="w-6 h-6" />}
        </div>

        <h3 className="text-base font-bold text-zinc-100">
          Leave Room {roomId}?
        </h3>

        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
          {isHost ? (
            <>
              You are the <span className="text-amber-400 font-semibold">Host</span> of this room. Leaving will interrupt table controls for connected players.
            </>
          ) : (
            <>
              Are you sure you want to exit? Your hand and connection to this table will be closed.
            </>
          )}
        </p>

        <div className="w-full grid grid-cols-2 gap-2.5 mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 font-semibold text-xs transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
            Stay in Room
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs transition-all shadow-lg shadow-red-950/40 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Yes, Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};
