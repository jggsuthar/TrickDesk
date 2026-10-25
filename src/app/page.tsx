'use client';

import React, { useState, useEffect } from 'react';
import { useGameRoom } from '@/hooks/useGameRoom';
import { JoinCreateScreen } from '@/components/JoinCreateScreen';
import { LobbyView } from '@/components/LobbyView';
import { SetupView } from '@/components/SetupView';
import { DiscardPhase } from '@/components/DiscardPhase';
import { Desk } from '@/components/Desk';
import { PlayerHand } from '@/components/PlayerHand';
import { UndoRequestModal } from '@/components/UndoModals';
import { RoundSummaryModal } from '@/components/RoundSummaryModal';
import { HistoryModal } from '@/components/HistoryModal';
import {
  RotateCcw,
  LogOut,
  History,
  Shield,
  Wifi,
  WifiOff,
  Copy,
  Check,
} from 'lucide-react';

export default function Home() {
  const {
    gameState,
    playerId,
    isHost,
    networkStatus,
    isUndoPending,
    createRoom,
    joinRoom,
    leaveRoom,
    updateRoomPoolConfig,
    toggleRoomLock,
    proceedToSetup,
    startDealing,
    hostStartPlaying,
    playCard,
    requestUndo,
    approveUndoRequest,
    rejectUndoRequest,
    awardTrickWinner,
    hostUniversalUndo,
    confirmDiscard,
    toggleReady,
    hostNextRound,
    updateHandOrder,
  } = useGameRoom();

  const [initialRoomParam, setInitialRoomParam] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isOrganizeMode, setIsOrganizeMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) {
        setInitialRoomParam(roomParam.toUpperCase());
      }
    }
  }, []);

  const handleCopyRoomCode = () => {
    if (gameState?.roomId && navigator?.clipboard) {
      navigator.clipboard.writeText(gameState.roomId);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // If no room is active, render Join / Create screen
  if (!gameState) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center">
        <JoinCreateScreen
          initialRoomId={initialRoomParam}
          onCreateRoom={(hostName) => createRoom(hostName)}
          onJoinRoom={(roomIdToJoin, name) => joinRoom(roomIdToJoin, name)}
          isLoading={networkStatus === 'connecting'}
        />
      </main>
    );
  }

  const currentPlayer = gameState.players.find((p) => p.id === playerId);
  const currentHand = currentPlayer?.hand || [];
  const currentDiscarded = currentPlayer?.discarded || [];
  const hasDiscarded = currentPlayer?.hasDiscarded || false;

  // Reverse order undo check
  const lastDeskCard =
    gameState.desk.length > 0 ? gameState.desk[gameState.desk.length - 1] : null;
  const canRequestUndo =
    gameState.phase === 'PLAYING' &&
    lastDeskCard !== null &&
    lastDeskCard.playerId === playerId;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-zinc-800 selection:text-white">
      {/* Top Header Navigation */}
      <header className="w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Room Code */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-black text-sm sm:text-base tracking-tight text-white">
              TrickDesk
            </span>

            <button
              type="button"
              onClick={handleCopyRoomCode}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 font-mono transition-colors"
              title="Click to copy Room Code"
            >
              <span>{gameState.roomId}</span>
              {copiedCode ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-zinc-500" />
              )}
            </button>

            {isHost && (
              <span className="hidden xs:flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Shield className="w-3 h-3" /> Host
              </span>
            )}
          </div>

          {/* Center Info / Phase */}
          <div className="flex items-center gap-2 text-xs">
            {gameState.phase === 'PLAYING' && (
              <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium text-xs">
                Round {gameState.roundNumber}
              </span>
            )}
            <span className="text-zinc-500 hidden md:inline">
              {networkStatus === 'connected' ? (
                <span className="flex items-center gap-1 text-emerald-500 text-xs">
                  <Wifi className="w-3 h-3" /> P2P Live
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-500 text-xs">
                  <WifiOff className="w-3 h-3" /> Connecting
                </span>
              )}
            </span>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Host Universal Undo Button */}
            {isHost && gameState.phase === 'PLAYING' && (
              <button
                type="button"
                onClick={hostUniversalUndo}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
                title="Universal Host Undo: Revert last played card or trick winner"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Host Undo</span>
              </button>
            )}

            {/* History Modal Trigger */}
            {gameState.roundHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title="View Score History"
              >
                <History className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Leave Room Button */}
            <button
              type="button"
              onClick={leaveRoom}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 transition-colors"
              title="Leave Room"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Phase Content */}
      <main className="flex-1 flex flex-col items-center justify-between w-full max-w-6xl mx-auto px-1 sm:px-2">
        {gameState.phase === 'LOBBY' && (
          <LobbyView
            roomId={gameState.roomId}
            isHost={isHost}
            isLocked={gameState.isLocked}
            players={gameState.players}
            currentPlayerId={playerId}
            numDecks={gameState.numDecks}
            numJokers={gameState.numJokers}
            onUpdateRoomPoolConfig={updateRoomPoolConfig}
            onToggleLock={toggleRoomLock}
            onProceedToSetup={proceedToSetup}
          />
        )}

        {gameState.phase === 'SETUP' && (
          <SetupView
            roundNumber={gameState.roundNumber}
            players={gameState.players}
            numDecks={gameState.numDecks}
            numJokers={gameState.numJokers}
            isHost={isHost}
            onStartDealing={startDealing}
          />
        )}

        {gameState.phase === 'DISCARD' && (
          <DiscardPhase
            hand={currentHand}
            discarded={currentDiscarded}
            hasDiscarded={hasDiscarded}
            cardsToDiscard={gameState.cardsToDiscard}
            players={gameState.players}
            isHost={isHost}
            onCardsReordered={updateHandOrder}
            onConfirmDiscard={confirmDiscard}
            onHostStartPlay={hostStartPlaying}
          />
        )}

        {gameState.phase === 'PLAYING' && (
          <div className="w-full flex-1 flex flex-col justify-between py-1 gap-1">
            {/* The Central Desk: HIDDEN during Organize Mode */}
            {!isOrganizeMode && (
              <Desk
                cards={gameState.desk}
                isHost={isHost}
                currentPlayerId={playerId}
                totalPlayersCount={gameState.players.length}
                onAwardWinner={awardTrickWinner}
                onRequestUndo={requestUndo}
                canRequestUndo={canRequestUndo}
                isUndoPending={isUndoPending}
              />
            )}

            {/* Player Hand with DnD Kit (expands to full screen grid when Organize is active) */}
            <div className={`w-full ${isOrganizeMode ? 'flex-1 my-auto' : 'mt-auto'}`}>
              <PlayerHand
                cards={currentHand}
                onCardsReordered={updateHandOrder}
                onCardClick={(card) => {
                  playCard(card);
                }}
                isOrganizeMode={isOrganizeMode}
                setIsOrganizeMode={setIsOrganizeMode}
              />
            </div>
          </div>
        )}

        {/* Round Completion & Scoring Modal */}
        {gameState.phase === 'ROUND_OVER' && (
          <RoundSummaryModal
            roundNumber={gameState.roundNumber}
            players={gameState.players}
            currentPlayerId={playerId}
            isHost={isHost}
            history={gameState.roundHistory}
            onToggleReady={toggleReady}
            onHostNextRound={hostNextRound}
          />
        )}
      </main>

      {/* Host Undo Approval Modal */}
      {isHost && gameState.pendingUndoRequest && (
        <UndoRequestModal
          request={gameState.pendingUndoRequest}
          onApprove={approveUndoRequest}
          onReject={rejectUndoRequest}
        />
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <HistoryModal
          history={gameState.roundHistory}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
}
