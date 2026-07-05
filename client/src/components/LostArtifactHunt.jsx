import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { Send, Users, ShieldAlert, Gem, Coins, LogOut, X, MessageSquare, Clock, Sparkles } from 'lucide-react';

const TILE_SIZE = 32; // px per grid cell
const MOVE_COOLDOWN_MS = 130;

const KEY_TO_DELTA = {
  ArrowUp: [-1, 0], w: [-1, 0], W: [-1, 0],
  ArrowDown: [1, 0], s: [1, 0], S: [1, 0],
  ArrowLeft: [0, -1], a: [0, -1], A: [0, -1],
  ArrowRight: [0, 1], d: [0, 1], D: [0, 1],
};

const LostArtifactHunt = ({ onBackToDashboard }) => {
  const socket = useContext(SocketContext);
  const { user, refreshUser } = useContext(AuthContext);

  const [inputCode, setInputCode] = useState('');
  const [room, setRoom] = useState(null);
  const [playerRole, setPlayerRole] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Exploration state
  const [mapGrid, setMapGrid] = useState(null);
  const [timer, setTimer] = useState(0);
  const [livePositions, setLivePositions] = useState({}); // id -> { row, col }

  // Voting state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [hasVoted, setHasVoted] = useState(false);

  // Final results
  const [finalResults, setFinalResults] = useState(null);

  const chatEndRef = useRef(null);
  const lastMoveRef = useRef(0);
  const roomRef = useRef(null); // avoid stale closures inside the keydown handler
  roomRef.current = room;

  useEffect(() => {
    if (!socket) return;

    socket.on('roomCreated', (roomData) => {
      setRoom(roomData);
      setErrorMsg('');
      setShowJoinModal(false);
    });

    socket.on('roomUpdated', (roomData) => {
      if (!roomData) return;
      setRoom(roomData);
      
      if (roomData.gameState === 'LOBBY') {
        setFinalResults(null);
      }
      
      if (roomData.gameState === 'RESULTS' && roomData.finalResults) {
        setFinalResults(roomData.finalResults);
      }

      // Full sync is authoritative: rebuild live positions from it.
      const positions = {};
      (roomData.players || []).forEach(p => { positions[p.id] = { row: p.row, col: p.col }; });
      setLivePositions(positions);
      setErrorMsg('');
      setShowJoinModal(false);
    });

    socket.on('roleAssigned', ({ role }) => {
      setPlayerRole(role);
      setFinalResults(null);
      setHasVoted(false);
      setChatMessages([]);
    });

    socket.on('explorationStarted', ({ grid, timerVal }) => {
      setMapGrid(grid);
      setTimer(timerVal);
    });

    socket.on('playerMoved', ({ id, row, col }) => {
      setLivePositions(prev => ({ ...prev, [id]: { row, col } }));
    });

    socket.on('timerUpdate', (time) => {
      setTimer(time);
    });

    socket.on('votingStarted', ({ timerVal }) => {
      setTimer(timerVal);
      setHasVoted(false);
    });

    socket.on('messageReceived', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    socket.on('gameEnded', ({ sipahiWin, votedOutName, chorName, playersResults, reason }) => {
      setFinalResults({ sipahiWin, votedOutName, chorName, playersResults, reason });
      refreshUser();
    });

    socket.on('kickedFromRoom', () => {
      setErrorMsg('You have been kicked from the room.');
      setRoom(null);
      setPlayerRole(null);
    });

    socket.on('errorMsg', (msg) => {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    });

    return () => {
      socket.off('roomCreated');
      socket.off('roomUpdated');
      socket.off('roleAssigned');
      socket.off('explorationStarted');
      socket.off('playerMoved');
      socket.off('timerUpdate');
      socket.off('votingStarted');
      socket.off('messageReceived');
      socket.off('gameEnded');
      socket.off('kickedFromRoom');
      socket.off('errorMsg');
    };
  }, [socket, refreshUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, room?.gameState]);

  // ---------------------------------------------------------------------
  // Movement + collection
  // ---------------------------------------------------------------------
  const isWalkable = useCallback((row, col) => {
    if (!mapGrid) return false;
    if (row < 0 || row >= mapGrid.length || col < 0 || col >= mapGrid[0].length) return false;
    return mapGrid[row][col] === 0;
  }, [mapGrid]);

  const attemptCollectAt = useCallback((row, col) => {
    const currentRoom = roomRef.current;
    if (!currentRoom || !socket) return;

    const artifact = (currentRoom.artifacts || []).find(
      a => !a.collected && !a.stolen && a.row === row && a.col === col
    );
    if (artifact) {
      socket.emit('collectItem', { roomCode: currentRoom.roomCode, itemType: 'artifact', itemId: artifact.id });
      return;
    }
    const coin = (currentRoom.coins || []).find(c => !c.collected && c.row === row && c.col === col);
    if (coin) {
      socket.emit('collectItem', { roomCode: currentRoom.roomCode, itemType: 'coin', itemId: coin.id });
      return;
    }
    const clue = (currentRoom.clues || []).find(c => !c.collected && c.row === row && c.col === col);
    if (clue) {
      socket.emit('collectItem', { roomCode: currentRoom.roomCode, itemType: 'clue', itemId: clue.id });
    }
  }, [socket]);

  const livePositionsRef = useRef(livePositions);
  livePositionsRef.current = livePositions;

  useEffect(() => {
    const handleKeyDown = (e) => {
      const currentRoom = roomRef.current;
      if (!currentRoom || currentRoom.gameState !== 'PLAYING' || !socket) return;
      const delta = KEY_TO_DELTA[e.key];
      if (!delta) return;

      const now = Date.now();
      if (now - lastMoveRef.current < MOVE_COOLDOWN_MS) return;

      const me = currentRoom.players.find(p => p.id === socket.id);
      if (!me) return;
      const pos = livePositionsRef.current[socket.id] || { row: me.row, col: me.col };
      const newRow = pos.row + delta[0];
      const newCol = pos.col + delta[1];

      if (!isWalkable(newRow, newCol)) return;

      lastMoveRef.current = now;
      setLivePositions(prev => ({ ...prev, [socket.id]: { row: newRow, col: newCol } }));
      socket.emit('playerMoved', { roomCode: currentRoom.roomCode, row: newRow, col: newCol });
      attemptCollectAt(newRow, newCol);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [socket, isWalkable, attemptCollectAt]);

  // ---------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------
  const handleCreateRoom = () => {
    if (!socket || !user) return;
    socket.emit('createRoom', { userId: user._id, name: user.name });
  };

  const handleJoinRoom = () => {
    if (!socket || !user || !inputCode) return;
    socket.emit('joinRoom', { roomCode: inputCode.trim().toUpperCase(), userId: user._id, name: user.name });
  };

  const handleStartMatch = () => {
    if (!socket || !room) return;
    socket.emit('startGame', { roomCode: room.roomCode });
  };

  const handleAddBot = () => {
    if (!socket || !room) return;
    socket.emit('addBot', { roomCode: room.roomCode });
  };

  const handleKickPlayer = (playerId) => {
    if (!socket || !room) return;
    socket.emit('kickPlayer', { roomCode: room.roomCode, playerId });
  };

  const handleCastVote = (targetPlayerId) => {
    if (!socket || !room || hasVoted) return;
    setHasVoted(true);
    socket.emit('castVote', { roomCode: room.roomCode, targetId: targetPlayerId });
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!socket || !room || !chatInput.trim()) return;
    socket.emit('sendMessage', { roomCode: room.roomCode, message: chatInput.trim() });
    setChatInput('');
  };

  const getPos = (playerId, fallback) => livePositions[playerId] || fallback;

  const totalArtifacts = room?.artifacts?.length || 0;
  const resolvedArtifacts = room?.artifacts?.filter(a => a.collected || a.stolen).length || 0;
  const me = room?.players?.find(p => p.id === socket?.id);

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[80vh] w-full max-w-5xl mx-auto">
      {errorMsg && (
        <div className="bg-red-900 border border-red-500 text-red-200 px-4 py-2 rounded mb-4 text-sm font-semibold animate-shake">
          {errorMsg}
        </div>
      )}

      {/* 1. LOBBY ENTRY (Join or Create Room) */}
      {!room && (
        <div className="heritage-card p-8 rounded-lg w-full max-w-md border gold-border text-center">
          <h2 className="text-3xl text-gold font-display mb-1">Lost Artifact Hunt</h2>
          <p className="text-xs text-parchment-dark mb-6">Multiplayer Deduction & Exploration (3-6 players)</p>

          <div className="flex flex-col gap-4 mb-6">
            <button onClick={handleCreateRoom} className="btn-heritage py-3 w-full">
              Create New Room
            </button>
            <div className="flex items-center my-2 text-parchment-dark text-xs font-display">
              <div className="flex-1 h-px bg-royal-blue-light"></div>
              <span className="px-3">OR JOIN ROOM</span>
              <div className="flex-1 h-px bg-royal-blue-light"></div>
            </div>
            <button onClick={() => setShowJoinModal(true)} className="btn-heritage-outline py-3 w-full">
              Join Existing Room
            </button>
          </div>

          <button onClick={onBackToDashboard} className="text-xs text-parchment-dark hover:text-gold transition-all">
            Back to Dashboard
          </button>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-royal-blue-dark border-2 border-gold p-6 rounded-lg w-full max-w-sm text-center relative shadow-2xl animate-fade-in">
            <button
              onClick={() => { setShowJoinModal(false); setInputCode(''); }}
              className="absolute top-3 right-3 text-parchment-dark hover:text-gold transition-all cursor-pointer border border-transparent hover:border-gold/20 hover:bg-gold/5 p-1 rounded"
            >
              <X size={16} />
            </button>
            <h3 className="text-xl text-gold font-display mb-2">Join Existing Room</h3>
            <p className="text-xs text-parchment-dark mb-4">Enter the 6-character room code to join the lobby.</p>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                maxLength={6}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="ROOM CODE"
                className="bg-maroon-dark/50 border border-royal-blue-light text-center text-gold font-bold font-display uppercase tracking-widest rounded px-4 py-2.5 outline-none focus:border-gold text-lg"
              />
              <button
                onClick={handleJoinRoom}
                disabled={inputCode.length < 6}
                className="btn-heritage py-3 font-semibold text-xs tracking-wider disabled:opacity-50"
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ROOM SCREEN (Waiting in Lobby) */}
      {room && room.gameState === 'LOBBY' && (
        <div className="heritage-card p-6 rounded-lg w-full max-w-lg border gold-border">
          <div className="flex justify-between items-center border-b border-royal-blue-light pb-3 mb-4">
            <div>
              <h3 className="text-xl text-gold font-display">Room Lobby</h3>
              <p className="text-xs text-parchment-dark">Waiting for players to join...</p>
            </div>
            <div className="bg-royal-blue-dark border border-gold px-4 py-1.5 rounded text-center">
              <span className="text-[10px] text-parchment-dark block font-display leading-none">Code:</span>
              <span className="text-lg text-gold font-bold font-display uppercase tracking-wider">{room.roomCode}</span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-display text-gold flex items-center gap-1.5">
                <Users size={16} /> Players ({room.players.length}/6)
              </h4>
              {room.hostId === socket.id && room.players.length < 6 && (
                <button onClick={handleAddBot} className="px-2.5 py-1 bg-royal-blue border border-gold/30 hover:border-gold text-[10px] text-gold rounded font-display transition-all cursor-pointer">
                  + Add Bot
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {room.players.map((player) => {
                const isHost = player.id === room.hostId;
                const isYou = player.id === socket.id;
                return (
                  <div key={player.id} className={`p-3 rounded border flex items-center justify-between text-sm ${isYou ? 'bg-royal-blue border-gold text-gold font-semibold' : 'bg-royal-blue-dark border-royal-blue-light text-parchment'}`}>
                    <div className="flex items-center gap-1.5">
                      <span>{player.name} {isYou && '(You)'}</span>
                      {isHost && <span className="text-[10px] bg-gold/20 text-gold border border-gold/40 px-1 rounded">Host</span>}
                    </div>
                    {room.hostId === socket.id && !isYou && (
                      <button onClick={() => handleKickPlayer(player.id)} className="text-red-400 hover:text-red-500 font-semibold text-xs ml-2 cursor-pointer transition-all border border-red-500/20 hover:border-red-500/50 bg-red-950/20 px-1.5 py-0.5 rounded flex items-center gap-0.5" title="Kick player/bot">
                        <X size={10} /> Kick
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-maroon-dark/50 border border-maroon-light p-3 rounded text-xs text-parchment-dark mb-6 leading-relaxed">
            <strong className="text-gold block mb-1">How to Play:</strong>
            - Explore the ruins of Nalanda. One player is secretly the <strong className="text-red-500">Chor (Thief)</strong>, the rest are <strong className="text-cyan-400">Sipahis (Guards)</strong>.
            - Move with WASD or Arrow Keys. Walk onto coins and artifacts to collect them.
            - Sipahis secure artifacts safely. The Chor secretly steals them, leaving a clue behind each time.
            - When time runs out, discuss and vote out who you think the Chor is.
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => { socket.disconnect(); setRoom(null); setPlayerRole(null); }}
              className="flex-1 btn-heritage-outline py-2 flex items-center justify-center gap-1.5"
            >
              <LogOut size={14} /> Leave Lobby
            </button>
            {room.hostId === socket.id ? (
              <button disabled={room.players.length < 3} onClick={handleStartMatch} className="flex-1 btn-heritage py-2 disabled:opacity-50">
                Start Match
              </button>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-gold animate-pulse font-display">
                Waiting for host to start...
              </div>
            )}
          </div>
          {room.hostId === socket.id && room.players.length < 3 && (
            <p className="text-[10px] text-center text-red-400 mt-2">Need at least 3 players to start.</p>
          )}
        </div>
      )}

      {/* 3. EXPLORATION SCREEN (PLAYING) */}
      {room && room.gameState === 'PLAYING' && mapGrid && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Map Panel */}
          <div className="md:col-span-2 heritage-card p-4 rounded-lg border gold-border flex flex-col items-center">
            <div className="flex justify-between items-center w-full border-b border-royal-blue-light pb-2 mb-3">
              <span className="text-xs text-gold font-display uppercase tracking-wider">
                Artifacts Resolved: {resolvedArtifacts} / {totalArtifacts}
              </span>
              <span className={`text-sm font-bold font-display px-2 py-0.5 rounded flex items-center gap-1 ${timer <= 10 ? 'text-red-500 animate-bounce' : 'text-gold'}`}>
                <Clock size={14} /> {timer}s
              </span>
            </div>

            <div
              className="relative bg-maroon-dark border border-royal-blue-light rounded overflow-hidden"
              style={{ width: mapGrid[0].length * TILE_SIZE, height: mapGrid.length * TILE_SIZE }}
            >
              {/* Tiles */}
              {mapGrid.map((rowArr, r) =>
                rowArr.map((tile, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={tile === 1 ? 'absolute bg-royal-blue-dark border border-royal-blue-light/40' : 'absolute bg-maroon-dark/40'}
                    style={{ top: r * TILE_SIZE, left: c * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}
                  />
                ))
              )}

              {/* Coins */}
              {(room.coins || []).filter(c => !c.collected).map(coin => (
                <div key={coin.id} className="absolute flex items-center justify-center text-gold" style={{ top: coin.row * TILE_SIZE, left: coin.col * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}>
                  <Coins size={14} />
                </div>
              ))}

              {/* Artifacts still on the map */}
              {(room.artifacts || []).filter(a => !a.collected && !a.stolen).map(artifact => (
                <div key={artifact.id} className="absolute flex items-center justify-center text-cyan-300" style={{ top: artifact.row * TILE_SIZE, left: artifact.col * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}>
                  <Sparkles size={16} />
                </div>
              ))}

              {/* Clues left behind by thefts */}
              {(room.clues || []).filter(c => !c.collected).map(clue => (
                <div key={clue.id} className="absolute flex items-center justify-center text-red-400 animate-pulse" style={{ top: clue.row * TILE_SIZE, left: clue.col * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}>
                  <ShieldAlert size={14} />
                </div>
              ))}

              {/* Players */}
              {room.players.filter(p => !p.disconnected).map(p => {
                const pos = getPos(p.id, { row: p.row, col: p.col });
                const isYou = p.id === socket.id;
                return (
                  <div
                    key={p.id}
                    className={`absolute rounded-full flex items-center justify-center text-[9px] font-bold font-display transition-all duration-100 ${isYou ? 'bg-gold text-maroon-dark border-2 border-white z-10' : 'bg-royal-blue text-parchment border border-gold/50'}`}
                    style={{ top: pos.row * TILE_SIZE + 3, left: pos.col * TILE_SIZE + 3, width: TILE_SIZE - 6, height: TILE_SIZE - 6 }}
                    title={p.name}
                  >
                    {p.name.charAt(0)}
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-parchment-dark mt-3">Move with WASD or Arrow Keys. Walk onto items to collect them.</p>
          </div>

          {/* HUD Sidebar */}
          <div className="heritage-card p-4 rounded-lg border gold-border flex flex-col gap-4">
            <div>
              <h4 className="text-sm font-display text-gold mb-2 border-b border-royal-blue-light pb-2">Your Status</h4>
              <div className="text-xs text-parchment-dark font-display mb-1">
                Role: <strong className={playerRole === 'CHOR' ? 'text-red-500' : 'text-cyan-400'}>{playerRole}</strong>
              </div>
              {playerRole === 'CHOR' ? (
                <div className="text-xs text-parchment-dark">Artifacts stolen: <strong className="text-red-400">{me?.artifactsStolen || 0}</strong> / {room.requiredStolenToWin}</div>
              ) : (
                <div className="text-xs text-parchment-dark">Artifacts secured: <strong className="text-cyan-300">{me?.artifactsSecured || 0}</strong></div>
              )}
              <div className="text-xs text-parchment-dark">Coins collected: <strong className="text-gold">{me?.coinsCollected || 0}</strong></div>
            </div>

            <div>
              <h4 className="text-sm font-display text-gold mb-2 border-b border-royal-blue-light pb-2">Players</h4>
              <div className="flex flex-col gap-2">
                {room.players.map((p) => {
                  const isYou = p.id === socket.id;
                  return (
                    <div key={p.id} className="flex justify-between items-center text-xs p-2 rounded bg-royal-blue-dark border border-royal-blue-light">
                      <span className={isYou ? 'text-gold font-semibold' : 'text-parchment-dark'}>{p.name} {isYou && '(You)'}</span>
                      <span className="text-[10px] text-parchment-dark font-display">Finds: {p.artifactsSecured + p.coinsCollected}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. VOTING DISCUSSION SCREEN */}
      {room && room.gameState === 'VOTING' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="md:col-span-2 heritage-card p-4 sm:p-6 rounded-lg border gold-border flex flex-col justify-between min-h-[320px] md:min-h-[400px]">
            <div>
              <div className="flex justify-between items-center border-b border-royal-blue-light pb-2 mb-4">
                <h3 className="text-lg text-gold font-display flex items-center gap-1.5">
                  <ShieldAlert size={18} className="text-red-500 animate-pulse" /> Accuse the Chor!
                </h3>
                <span className={`text-sm font-bold font-display px-2 py-0.5 rounded flex items-center gap-1 ${timer <= 5 ? 'text-red-500 animate-bounce' : 'text-gold'}`}>
                  <Clock size={14} /> {timer}s
                </span>
              </div>
              <p className="text-xs text-parchment-dark mb-4">Discuss with players in chat and cast your vote on who is the Artifact Thief.</p>

              <div className="grid grid-cols-1 gap-2.5 mb-4">
                {room.players.map((p) => {
                  const isYou = p.id === socket.id;
                  const votesForThis = room.players.filter(v => v.votedFor === p.id).length;
                  return (
                    <button
                      key={p.id}
                      disabled={isYou || hasVoted}
                      onClick={() => handleCastVote(p.id)}
                      className={`p-3 rounded border text-sm text-left flex justify-between items-center transition-all ${
                        isYou
                          ? 'border-royal-blue-light bg-royal-blue-dark/30 text-parchment/40 cursor-not-allowed'
                          : hasVoted
                          ? 'border-royal-blue-light bg-royal-blue-dark/50 text-parchment'
                          : 'border-royal-blue-light hover:border-red-500 bg-royal-blue-dark text-parchment'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{p.name} {isYou && '(You)'}</span>
                        <span className="text-[10px] text-parchment-dark">Finds: {p.artifactsSecured + p.coinsCollected}</span>
                        {votesForThis > 0 && (
                          <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-1.5 rounded">Votes: {votesForThis}</span>
                        )}
                      </div>
                      {!isYou && !hasVoted && <span className="text-xs text-red-500 font-display font-semibold hover:underline">Accuse</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 border-t border-royal-blue-light pt-4 mt-4">
              <button disabled={hasVoted} onClick={() => handleCastVote('skip')} className="btn-heritage-outline py-2 px-6 text-xs flex-1">
                Skip Vote
              </button>
              {hasVoted && (
                <div className="flex-1 flex items-center justify-center text-xs text-emerald-400 font-display">
                  Vote submitted. Waiting for others...
                </div>
              )}
            </div>
          </div>

          <div className="heritage-card p-4 rounded-lg border gold-border flex flex-col justify-between min-h-[300px] md:min-h-[400px]">
            <div>
              <h4 className="text-sm font-display text-gold mb-2 border-b border-royal-blue-light pb-2 flex items-center gap-1">
                <MessageSquare size={14} /> Room Discussion
              </h4>
              <div className="h-44 md:h-64 overflow-y-auto pr-1 flex flex-col gap-2 mb-3">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className="bg-royal-blue-dark/60 border border-royal-blue-light/50 p-2 rounded text-xs leading-normal">
                    <div className="flex justify-between items-center mb-0.5">
                      <strong className="text-gold font-display">{msg.sender}</strong>
                      <span className="text-[9px] text-parchment-dark">{msg.timestamp}</span>
                    </div>
                    <p className="text-parchment break-all">{msg.text}</p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>

            <form onSubmit={handleSendChat} className="flex gap-1.5 border-t border-royal-blue-light pt-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your accusation..."
                className="flex-1 bg-royal-blue-dark border border-royal-blue-light text-xs text-parchment rounded px-3 py-2 outline-none focus:border-gold"
              />
              <button type="submit" className="bg-gold hover:bg-gold-dark text-maroon-dark p-2 rounded transition-all">
                <Send size={12} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. GAME RESULTS SCREEN */}
      {room && room.gameState === 'RESULTS' && finalResults && (
        <div className="heritage-card p-6 rounded-lg w-full max-w-xl border gold-border text-center">
          <h3 className="text-3xl text-gold font-display mb-1">Match Over</h3>
          <p className="text-xs text-parchment-dark mb-4">
            {finalResults.reason === 'ALL_SECURED' && 'All artifacts were secured safely!'}
            {finalResults.reason === 'CHOR_QUOTA' && 'The Chor escaped with enough loot!'}
            {finalResults.reason === 'VOTE' && <>Voted Out: <strong className="text-parchment">{finalResults.votedOutName}</strong></>}
          </p>

          <div className="mb-6">
            {finalResults.sipahiWin ? (
              <div className="bg-emerald-950 border border-emerald-500 p-4 rounded max-w-sm mx-auto shadow-lg">
                <h4 className="text-xl text-emerald-400 font-display font-bold mb-1">SIPAHIS WIN!</h4>
                <p className="text-xs text-emerald-200">The Artifact Thief, <span className="underline font-bold">{finalResults.chorName}</span>, was stopped!</p>
              </div>
            ) : (
              <div className="bg-red-950 border border-red-500 p-4 rounded max-w-sm mx-auto shadow-lg">
                <h4 className="text-xl text-red-400 font-display font-bold mb-1">CHOR WINS!</h4>
                <p className="text-xs text-red-200">The Artifact Thief, <span className="underline font-bold">{finalResults.chorName}</span>, escaped with the loot!</p>
              </div>
            )}
          </div>

          <div className="text-left w-full mb-6">
            <h4 className="text-sm font-display text-gold mb-2 border-b border-royal-blue-light pb-1">Rewards Distribution:</h4>
            <div className="flex flex-col gap-2">
              {finalResults.playersResults.map((res) => {
                const isYou = res.id === socket.id;
                return (
                  <div key={res.id} className="flex justify-between items-center p-2.5 rounded bg-royal-blue-dark border border-royal-blue-light text-xs">
                    <div>
                      <span className={`font-semibold mr-2 ${isYou ? 'text-gold' : 'text-parchment'}`}>{res.name} {isYou && '(You)'}</span>
                      <span className={`text-[10px] uppercase font-display border px-1 rounded ${res.role === 'CHOR' ? 'border-red-500/35 text-red-400' : 'border-cyan-500/35 text-cyan-400'}`}>{res.role}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-parchment-dark">Secured: <strong className="text-parchment">{res.artifactsSecured}</strong></span>
                      <span className="text-parchment-dark">Coins: <strong className="text-parchment">{res.coinsCollected}</strong></span>
                      <span className="text-gold font-bold">+{res.coinsEarned} Coins</span>
                      {res.diamondsEarned > 0 && (
                        <span className="text-cyan-400 font-bold flex items-center gap-0.5"><Gem size={10} />+{res.diamondsEarned}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-xs text-gold animate-pulse font-display border-t border-royal-blue-light pt-4">
            Resetting room lobby back to home shortly...
          </div>
        </div>
      )}
    </div>
  );
};

export default LostArtifactHunt;
