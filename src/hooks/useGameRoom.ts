'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card,
  DeskCard,
  GamePhase,
  GameState,
  PeerMessage,
  Player,
  RoundHistory,
  UndoRequest,
} from '@/types/game';
import { createMasterDeck } from '@/lib/deck';
import { P2PNetwork } from '@/lib/network';
import {
  saveSession,
  loadSession,
  saveHostGameState,
  loadHostGameState,
  saveHandOrder,
  loadHandOrder,
  clearSession,
} from '@/lib/storage';
import confetti from 'canvas-confetti';

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function useGameRoom() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(false);
  const [networkStatus, setNetworkStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUndoPending, setIsUndoPending] = useState<boolean>(false);

  const networkRef = useRef<P2PNetwork | null>(null);
  const stateRef = useRef<GameState | null>(null);
  stateRef.current = gameState;

  // Broadcast and persist helper (Host only)
  const broadcastAndSaveState = useCallback((nextState: GameState) => {
    setGameState(nextState);
    if (nextState.roomId) {
      saveHostGameState(nextState.roomId, nextState);
    }
    if (networkRef.current) {
      networkRef.current.broadcastState(nextState);
    }
  }, []);

  // Handle incoming P2P messages
  const handleMessage = useCallback(
    (message: PeerMessage) => {
      if (message.type === 'SYNC_STATE') {
        setGameState((prevState) => {
          if (prevState && playerId) {
            const currentHand = message.state.players.find((p) => p.id === playerId)?.hand || [];
            const savedOrder = loadHandOrder(message.state.roomId);
            if (savedOrder && savedOrder.length > 0) {
              const orderMap = new Map(savedOrder.map((id, idx) => [id, idx]));
              currentHand.sort((a, b) => {
                const aIdx = orderMap.has(a.id) ? orderMap.get(a.id)! : 999;
                const bIdx = orderMap.has(b.id) ? orderMap.get(b.id)! : 999;
                return aIdx - bIdx;
              });
            }
          }
          return message.state;
        });
        return;
      }

      // Actions processed by Host
      const currentState = stateRef.current;
      if (!currentState) return;

      switch (message.type) {
        case 'JOIN_ROOM': {
          if (currentState.isLocked) return;

          const existingPlayerIndex = currentState.players.findIndex((p) => p.id === message.playerId);
          let updatedPlayers: Player[];

          if (existingPlayerIndex >= 0) {
            updatedPlayers = currentState.players.map((p, idx) =>
              idx === existingPlayerIndex
                ? { ...p, name: message.playerName, connected: true }
                : p
            );
          } else {
            const newPlayer: Player = {
              id: message.playerId,
              name: message.playerName,
              isHost: false,
              connected: true,
              isReady: false,
              hasDiscarded: false,
              hand: [],
              discarded: [],
              stacksWonThisRound: 0,
            };
            updatedPlayers = [...currentState.players, newPlayer];
          }

          const next = { ...currentState, players: updatedPlayers };
          broadcastAndSaveState(next);
          break;
        }

        case 'RECONNECT': {
          const updatedPlayers = currentState.players.map((p) =>
            p.id === message.playerId
              ? { ...p, name: message.playerName || p.name, connected: true }
              : p
          );
          const next = { ...currentState, players: updatedPlayers };
          broadcastAndSaveState(next);
          break;
        }

        case 'PLAY_CARD': {
          const player = currentState.players.find((p) => p.id === message.playerId);
          if (!player) return;

          // Check if already played a card in current trick
          const alreadyPlayed = currentState.desk.some((d) => d.playerId === message.playerId);
          if (alreadyPlayed) return;

          const newHand = player.hand.filter((c) => c.id !== message.card.id);
          const updatedPlayers = currentState.players.map((p) =>
            p.id === message.playerId ? { ...p, hand: newHand } : p
          );

          const newDeskCard: DeskCard = {
            card: message.card,
            playerId: message.playerId,
            playerName: player.name,
            playedAt: Date.now(),
          };

          const next: GameState = {
            ...currentState,
            players: updatedPlayers,
            desk: [...currentState.desk, newDeskCard],
          };
          broadcastAndSaveState(next);
          break;
        }

        case 'REQUEST_UNDO': {
          const desk = currentState.desk;
          if (desk.length === 0) return;
          const lastCard = desk[desk.length - 1];

          if (lastCard.playerId === message.playerId) {
            const undoReq: UndoRequest = {
              requestId: Math.random().toString(36).substring(2, 9),
              playerId: message.playerId,
              playerName: lastCard.playerName,
              card: lastCard.card,
            };
            const next = { ...currentState, pendingUndoRequest: undoReq };
            broadcastAndSaveState(next);
          }
          break;
        }

        case 'DISCARD_CARDS': {
          const updatedPlayers = currentState.players.map((p) => {
            if (p.id === message.playerId) {
              const discardIds = new Set(message.discardedCards.map((c) => c.id));
              const remainingHand = p.hand.filter((c) => !discardIds.has(c.id));
              return {
                ...p,
                hand: remainingHand,
                discarded: [...p.discarded, ...message.discardedCards],
                hasDiscarded: true,
              };
            }
            return p;
          });
          const next = { ...currentState, players: updatedPlayers };
          broadcastAndSaveState(next);
          break;
        }

        case 'PLAYER_READY': {
          const updatedPlayers = currentState.players.map((p) =>
            p.id === message.playerId ? { ...p, isReady: message.isReady } : p
          );
          const next = { ...currentState, players: updatedPlayers };
          broadcastAndSaveState(next);
          break;
        }
      }
    },
    [broadcastAndSaveState, playerId]
  );

  // Initialize P2P Network instance
  const getNetwork = useCallback(() => {
    if (!networkRef.current) {
      networkRef.current = new P2PNetwork({
        onPeerOpen: () => {
          setNetworkStatus('connected');
          setErrorMessage(null);
        },
        onPlayerConnected: (conn) => {
          if (stateRef.current) {
            conn.send({ type: 'SYNC_STATE', state: stateRef.current });
          }
        },
        onPlayerDisconnected: (disconnectedPeerId) => {
          if (stateRef.current) {
            const updated = stateRef.current.players.map((p) =>
              disconnectedPeerId.includes(p.id) ? { ...p, connected: false } : p
            );
            broadcastAndSaveState({ ...stateRef.current, players: updated });
          }
        },
        onMessageReceived: (message) => {
          handleMessage(message);
        },
        onError: (err) => {
          console.error('P2P Network error:', err);
          setErrorMessage(err.message || 'Network issue');
        },
      });
    }
    return networkRef.current;
  }, [broadcastAndSaveState, handleMessage]);

  // Create room as Host
  const createRoom = useCallback(
    async (hostName: string, customRoomId?: string) => {
      const room = customRoomId || generateRoomId();
      const myId = playerId || 'host_' + Math.random().toString(36).substring(2, 9);
      setPlayerId(myId);
      setPlayerName(hostName);
      setIsHost(true);
      setNetworkStatus('connecting');

      const existing = loadHostGameState(room);
      let initial: GameState;

      if (existing) {
        initial = existing;
      } else {
        const hostPlayer: Player = {
          id: myId,
          name: hostName,
          isHost: true,
          connected: true,
          isReady: false,
          hasDiscarded: false,
          hand: [],
          discarded: [],
          stacksWonThisRound: 0,
        };

        initial = {
          roomId: room,
          isLocked: false,
          phase: 'LOBBY',
          numDecks: 1,
          numJokers: 0,
          cardsPerPlayer: 10,
          cardsToDiscard: 0,
          players: [hostPlayer],
          desk: [],
          roundNumber: 1,
          roundHistory: [],
          pendingUndoRequest: null,
          lastAwardedWinner: null,
        };
      }

      setGameState(initial);
      saveSession({ playerId: myId, playerName: hostName, roomId: room, isHost: true });
      saveHostGameState(room, initial);

      const net = getNetwork();
      await net.initHost(room, myId);
    },
    [playerId, getNetwork]
  );

  // Join room as Player
  const joinRoom = useCallback(
    async (roomIdToJoin: string, name: string, isReconnect: boolean = false) => {
      const normalizedRoom = roomIdToJoin.trim().toUpperCase();
      const myId = playerId || 'player_' + Math.random().toString(36).substring(2, 9);
      setPlayerId(myId);
      setPlayerName(name);
      setIsHost(false);
      setNetworkStatus('connecting');

      saveSession({ playerId: myId, playerName: name, roomId: normalizedRoom, isHost: false });

      const net = getNetwork();
      await net.initClient(normalizedRoom, myId, name, isReconnect);
    },
    [playerId, getNetwork]
  );

  // Auto-recovery from localStorage on initial page load
  useEffect(() => {
    const saved = loadSession();
    if (saved && saved.roomId) {
      setPlayerId(saved.playerId);
      setPlayerName(saved.playerName);
      setIsHost(saved.isHost);

      if (saved.isHost) {
        const existingState = loadHostGameState(saved.roomId);
        if (existingState) {
          setGameState(existingState);
        }
        createRoom(saved.playerName, saved.roomId);
      } else {
        joinRoom(saved.roomId, saved.playerName, true);
      }
    }
  }, []);

  // Host Action: Update Room Pool Config (Done ONCE for the room)
  const updateRoomPoolConfig = useCallback(
    (decks: number, jokers: number) => {
      if (!isHost || !gameState) return;
      const next: GameState = {
        ...gameState,
        numDecks: Math.max(1, Math.min(4, decks)),
        numJokers: Math.max(0, Math.min(8, jokers)),
      };
      broadcastAndSaveState(next);
    },
    [isHost, gameState, broadcastAndSaveState]
  );

  // Host Action: Toggle room lock
  const toggleRoomLock = useCallback(() => {
    if (!isHost || !gameState) return;
    const next = { ...gameState, isLocked: !gameState.isLocked };
    broadcastAndSaveState(next);
  }, [isHost, gameState, broadcastAndSaveState]);

  // Host Action: Proceed to Setup
  const proceedToSetup = useCallback(() => {
    if (!isHost || !gameState) return;
    const next: GameState = { ...gameState, phase: 'SETUP' };
    broadcastAndSaveState(next);
  }, [isHost, gameState, broadcastAndSaveState]);

  // Host Action: Deal round from Common Pool (using 2 configs: cardsPerPlayer, cardsToDiscard)
  const startDealing = useCallback(
    (cardsPerPlayer: number, cardsToDiscard: number) => {
      if (!isHost || !gameState) return;

      const masterDeck = createMasterDeck(gameState.numDecks, gameState.numJokers);
      let deckPtr = 0;

      const updatedPlayers = gameState.players.map((player) => {
        const playerHand = masterDeck.slice(deckPtr, deckPtr + cardsPerPlayer);
        deckPtr += cardsPerPlayer;
        return {
          ...player,
          hand: playerHand,
          discarded: [],
          hasDiscarded: cardsToDiscard === 0, // already true if no discard phase
          stacksWonThisRound: 0,
          isReady: false,
        };
      });

      const nextPhase: GamePhase = cardsToDiscard > 0 ? 'DISCARD' : 'PLAYING';

      const next: GameState = {
        ...gameState,
        cardsPerPlayer,
        cardsToDiscard,
        players: updatedPlayers,
        desk: [],
        phase: nextPhase,
        pendingUndoRequest: null,
        lastAwardedWinner: null,
      };

      broadcastAndSaveState(next);
    },
    [isHost, gameState, broadcastAndSaveState]
  );

  // Host Action: Advance from Discard to Playing
  const hostStartPlaying = useCallback(() => {
    if (!isHost || !gameState) return;
    const next: GameState = { ...gameState, phase: 'PLAYING' };
    broadcastAndSaveState(next);
  }, [isHost, gameState, broadcastAndSaveState]);

  // Player / Host: Play card to desk
  const playCard = useCallback(
    (card: Card) => {
      if (!gameState) return;

      if (isHost) {
        const hostPlayer = gameState.players.find((p) => p.id === playerId);
        if (!hostPlayer) return;

        const alreadyPlayed = gameState.desk.some((d) => d.playerId === playerId);
        if (alreadyPlayed) return;

        const newHand = hostPlayer.hand.filter((c) => c.id !== card.id);
        const updatedPlayers = gameState.players.map((p) =>
          p.id === playerId ? { ...p, hand: newHand } : p
        );

        const newDeskCard: DeskCard = {
          card,
          playerId,
          playerName: hostPlayer.name,
          playedAt: Date.now(),
        };

        const next: GameState = {
          ...gameState,
          players: updatedPlayers,
          desk: [...gameState.desk, newDeskCard],
        };
        broadcastAndSaveState(next);
      } else {
        if (networkRef.current) {
          networkRef.current.sendToHost({
            type: 'PLAY_CARD',
            playerId,
            card,
          });
        }
      }
    },
    [gameState, isHost, playerId, broadcastAndSaveState]
  );

  // Reverse order undo request
  const requestUndo = useCallback(() => {
    if (!gameState) return;
    const desk = gameState.desk;
    if (desk.length === 0) return;
    const lastCard = desk[desk.length - 1];

    if (lastCard.playerId !== playerId) return;

    if (isHost) {
      const hostPlayer = gameState.players.find((p) => p.id === playerId);
      if (!hostPlayer) return;

      const updatedDesk = desk.slice(0, desk.length - 1);
      const updatedPlayers = gameState.players.map((p) =>
        p.id === playerId ? { ...p, hand: [...p.hand, lastCard.card] } : p
      );
      const next: GameState = {
        ...gameState,
        desk: updatedDesk,
        players: updatedPlayers,
      };
      broadcastAndSaveState(next);
    } else {
      setIsUndoPending(true);
      if (networkRef.current) {
        networkRef.current.sendToHost({
          type: 'REQUEST_UNDO',
          playerId,
        });
      }
      setTimeout(() => setIsUndoPending(false), 5000);
    }
  }, [gameState, playerId, isHost, broadcastAndSaveState]);

  // Host Action: Approve Undo Request
  const approveUndoRequest = useCallback(
    (request: UndoRequest) => {
      if (!isHost || !gameState) return;
      const desk = gameState.desk;
      const updatedDesk = desk.filter((d) => d.card.id !== request.card.id);

      const updatedPlayers = gameState.players.map((p) =>
        p.id === request.playerId ? { ...p, hand: [...p.hand, request.card] } : p
      );

      const next: GameState = {
        ...gameState,
        desk: updatedDesk,
        players: updatedPlayers,
        pendingUndoRequest: null,
      };
      broadcastAndSaveState(next);
    },
    [isHost, gameState, broadcastAndSaveState]
  );

  // Host Action: Reject Undo Request
  const rejectUndoRequest = useCallback(() => {
    if (!isHost || !gameState) return;
    const next: GameState = { ...gameState, pendingUndoRequest: null };
    broadcastAndSaveState(next);
  }, [isHost, gameState, broadcastAndSaveState]);

  // Host Action: Award trick winner
  const awardTrickWinner = useCallback(
    (winningCard: DeskCard) => {
      if (!isHost || !gameState) return;

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Confetti fallback
      }

      const updatedPlayers = gameState.players.map((p) =>
        p.id === winningCard.playerId
          ? { ...p, stacksWonThisRound: p.stacksWonThisRound + 1 }
          : p
      );

      const allHandsEmpty = updatedPlayers.every((p) => p.hand.length === 0);

      let nextPhase: GamePhase = gameState.phase;
      let nextHistory = [...gameState.roundHistory];

      if (allHandsEmpty) {
        nextPhase = 'ROUND_OVER';
        const roundScoreRecord: RoundHistory = {
          roundNumber: gameState.roundNumber,
          scores: updatedPlayers.map((p) => ({
            playerId: p.id,
            playerName: p.name,
            stacksWon: p.stacksWonThisRound,
          })),
        };
        nextHistory.push(roundScoreRecord);
      }

      const next: GameState = {
        ...gameState,
        players: updatedPlayers,
        desk: [],
        phase: nextPhase,
        roundHistory: nextHistory,
        lastAwardedWinner: {
          playerId: winningCard.playerId,
          playerName: winningCard.playerName,
          card: winningCard.card,
          deskSnapshot: [...gameState.desk],
        },
      };

      broadcastAndSaveState(next);
    },
    [isHost, gameState, broadcastAndSaveState]
  );

  // Host Universal Undo: revert trick award or last card played
  const hostUniversalUndo = useCallback(() => {
    if (!isHost || !gameState) return;

    if (gameState.desk.length === 0 && gameState.lastAwardedWinner) {
      const { playerId: winnerId, deskSnapshot } = gameState.lastAwardedWinner;
      const updatedPlayers = gameState.players.map((p) =>
        p.id === winnerId
          ? { ...p, stacksWonThisRound: Math.max(0, p.stacksWonThisRound - 1) }
          : p
      );

      let nextHistory = gameState.roundHistory;
      if (gameState.phase === 'ROUND_OVER') {
        nextHistory = nextHistory.slice(0, nextHistory.length - 1);
      }

      const next: GameState = {
        ...gameState,
        phase: 'PLAYING',
        players: updatedPlayers,
        desk: deskSnapshot,
        roundHistory: nextHistory,
        lastAwardedWinner: null,
      };
      broadcastAndSaveState(next);
      return;
    }

    if (gameState.desk.length > 0) {
      const lastDeskCard = gameState.desk[gameState.desk.length - 1];
      const updatedDesk = gameState.desk.slice(0, gameState.desk.length - 1);
      const updatedPlayers = gameState.players.map((p) =>
        p.id === lastDeskCard.playerId
          ? { ...p, hand: [...p.hand, lastDeskCard.card] }
          : p
      );

      const next: GameState = {
        ...gameState,
        desk: updatedDesk,
        players: updatedPlayers,
      };
      broadcastAndSaveState(next);
    }
  }, [isHost, gameState, broadcastAndSaveState]);

  // Player / Host: Discard cards (exact count enforced)
  const confirmDiscard = useCallback(
    (discardedCards: Card[]) => {
      if (!gameState) return;

      if (isHost) {
        const updatedPlayers = gameState.players.map((p) => {
          if (p.id === playerId) {
            const discardIds = new Set(discardedCards.map((c) => c.id));
            const remaining = p.hand.filter((c) => !discardIds.has(c.id));
            return {
              ...p,
              hand: remaining,
              discarded: [...p.discarded, ...discardedCards],
              hasDiscarded: true,
            };
          }
          return p;
        });
        const next = { ...gameState, players: updatedPlayers };
        broadcastAndSaveState(next);
      } else {
        if (networkRef.current) {
          networkRef.current.sendToHost({
            type: 'DISCARD_CARDS',
            playerId,
            discardedCards,
          });
        }
      }
    },
    [gameState, isHost, playerId, broadcastAndSaveState]
  );

  // Player / Host: Toggle Ready in Round Over
  const toggleReady = useCallback(
    (isReady: boolean) => {
      if (!gameState) return;

      if (isHost) {
        const updatedPlayers = gameState.players.map((p) =>
          p.id === playerId ? { ...p, isReady } : p
        );
        const next = { ...gameState, players: updatedPlayers };
        broadcastAndSaveState(next);
      } else {
        if (networkRef.current) {
          networkRef.current.sendToHost({
            type: 'PLAYER_READY',
            playerId,
            isReady,
          });
        }
      }
    },
    [gameState, isHost, playerId, broadcastAndSaveState]
  );

  // Host Action: Initiate next round setup (strictly gated by 100% ready)
  const hostNextRound = useCallback(() => {
    if (!isHost || !gameState) return;

    const allReady = gameState.players.every((p) => p.isReady);
    if (!allReady) return;

    const resetPlayers = gameState.players.map((p) => ({
      ...p,
      isReady: false,
      hasDiscarded: false,
      hand: [],
      discarded: [],
      stacksWonThisRound: 0,
    }));

    // Moves to SETUP phase where Host chooses ONLY the 2 configs (#1 cards, #2 discards)
    const next: GameState = {
      ...gameState,
      roundNumber: gameState.roundNumber + 1,
      phase: 'SETUP',
      players: resetPlayers,
      desk: [],
      pendingUndoRequest: null,
      lastAwardedWinner: null,
    };

    broadcastAndSaveState(next);
  }, [isHost, gameState, broadcastAndSaveState]);

  // Update local hand reordering
  const updateHandOrder = useCallback(
    (reorderedHand: Card[]) => {
      if (!gameState) return;
      saveHandOrder(
        gameState.roomId,
        reorderedHand.map((c) => c.id)
      );

      const updatedPlayers = gameState.players.map((p) =>
        p.id === playerId ? { ...p, hand: reorderedHand } : p
      );

      const next = { ...gameState, players: updatedPlayers };
      setGameState(next);

      if (isHost) {
        broadcastAndSaveState(next);
      }
    },
    [gameState, playerId, isHost, broadcastAndSaveState]
  );

  const leaveRoom = useCallback(() => {
    clearSession();
    if (networkRef.current) {
      networkRef.current.destroy();
    }
    setGameState(null);
    setNetworkStatus('idle');
  }, []);

  return {
    gameState,
    playerId,
    playerName,
    isHost,
    networkStatus,
    errorMessage,
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
  };
}
