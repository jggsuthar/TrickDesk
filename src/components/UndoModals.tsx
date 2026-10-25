'use client';

import React from 'react';
import { UndoRequest } from '@/types/game';
import { PlayingCard } from './PlayingCard';
import { ShieldAlert, Check, X } from 'lucide-react';

interface UndoRequestModalProps {
  request: UndoRequest;
  onApprove: (request: UndoRequest) => void;
  onReject: (request: UndoRequest) => void;
}

export const UndoRequestModal: React.FC<UndoRequestModalProps> = ({
  request,
  onApprove,
  onReject,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl p-5 flex flex-col items-center text-center">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
          <ShieldAlert className="w-5 h-5" />
        </div>

        <h3 className="text-base font-bold text-zinc-100">Undo Request</h3>
        <p className="text-xs text-zinc-400 mt-1">
          <span className="font-semibold text-zinc-200">{request.playerName}</span> wants to take back their played card:
        </p>

        <div className="w-20 my-3">
          <PlayingCard card={request.card} isHoverable={false} />
        </div>

        <div className="w-full grid grid-cols-2 gap-3 mt-2">
          <button
            type="button"
            onClick={() => onReject(request)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition-colors"
          >
            <X className="w-4 h-4" />
            Deny
          </button>
          <button
            type="button"
            onClick={() => onApprove(request)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-900/30"
          >
            <Check className="w-4 h-4" />
            Approve Undo
          </button>
        </div>
      </div>
    </div>
  );
};
