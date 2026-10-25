'use client';

import React, { useState, useEffect } from 'react';
import { Layers, ArrowRight, PlusCircle, Users } from 'lucide-react';

interface JoinCreateScreenProps {
  initialRoomId?: string;
  onCreateRoom: (hostName: string) => void;
  onJoinRoom: (roomId: string, playerName: string) => void;
  isLoading?: boolean;
}

export const JoinCreateScreen: React.FC<JoinCreateScreenProps> = ({
  initialRoomId = '',
  onCreateRoom,
  onJoinRoom,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState(initialRoomId);
  const [activeTab, setActiveTab] = useState<'create' | 'join'>(
    initialRoomId ? 'join' : 'create'
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialRoomId) {
      setRoomId(initialRoomId);
      setActiveTab('join');
    }
    const savedName = localStorage.getItem('trickdesk_saved_name');
    if (savedName) setName(savedName);
  }, [initialRoomId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please enter your display name');
      return;
    }
    localStorage.setItem('trickdesk_saved_name', cleanName);

    if (activeTab === 'create') {
      onCreateRoom(cleanName);
    } else {
      const cleanRoom = roomId.trim().toUpperCase();
      if (!cleanRoom) {
        setError('Please enter a room code');
        return;
      }
      onJoinRoom(cleanRoom, cleanName);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center">
        {/* Brand Icon */}
        <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-5 text-white shadow-inner">
          <Layers className="w-7 h-7" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white text-center tracking-tight">
          TrickDesk
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 text-center mt-1 mb-6">
          Real-time, peer-to-peer digital trick-taking sandbox.
        </p>

        {/* Tab Switcher */}
        <div className="w-full grid grid-cols-2 p-1 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('create');
              setError('');
            }}
            className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Host Game</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('join');
              setError('');
            }}
            className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'join'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Join Room</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              required
              maxLength={20}
              placeholder="e.g. Alice"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-zinc-500 text-white placeholder-zinc-600 text-sm outline-none transition-colors"
            />
          </div>

          {activeTab === 'join' && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Room Code
              </label>
              <input
                type="text"
                required
                maxLength={8}
                placeholder="e.g. TD7K9"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value.toUpperCase());
                  setError('');
                }}
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-zinc-500 text-white placeholder-zinc-600 font-mono tracking-wider text-sm outline-none transition-colors uppercase"
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-red-400 text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50 cursor-pointer"
          >
            <span>{activeTab === 'create' ? 'Create Table as Host' : 'Join Table'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center text-[11px] text-zinc-500">
          Peer-to-peer WebRTC • Zero database • Real-time Host dealer control
        </div>
      </div>
    </div>
  );
};
