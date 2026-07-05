const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const Inventory = require('../models/Inventory');
const nalanda = require('../data/maps/nalanda');

// Only one map is wired up for now; kept as a lookup so more maps can be added later
// without touching game logic.
const MAPS = { nalanda };
const DEFAULT_MAP_ID = 'nalanda';

// Bot names for multiplayer simulation
const BOT_NAMES = [
  'Aryabhata', 'Chanakya', 'Gargi', 'Kalidasa', 'Mirabai',
  'Birbal', 'Tenali Raman', 'Sushruta', 'Varahamihira', 'Bhaskara',
  'Maitreyi', 'Charaka', 'Ramanujan', 'Kanada', 'Panini'
];

// Dialogue templates for bot discussion phase
const BOT_CHAT_TEMPLATES = {
  defend_low: [
    "I was just collecting coins, I promise I'm a Sipahi!",
    "I didn't find a single artifact all round, don't blame me.",
    "My side of the ruins was empty, that's why I have so little to show.",
    "I swear I was just exploring the courtyard, nothing suspicious."
  ],
  accuse_others: [
    "I suspect {target} is the Chor. They barely secured anything!",
    "Could {target} be the Chor? They kept vanishing near the artifacts.",
    "{target} is acting very suspicious...",
    "My gut says it's {target}."
  ],
  divert_chor: [
    "I think {target} is definitely the Chor. Let's vote them out!",
    "Sipahis, trust me, {target} is the suspect.",
    "{target} is playing a very quiet game. Must be the thief.",
    "I'm a Sipahi. Let's focus on {target}!"
  ],
  general: [
    "This is intense. Who is the Chor?",
    "We need to find the artifact thief before it's too late!",
    "Let's vote together to win this.",
    "Make sure we don't vote out a guard by mistake."
  ]
};

// Rooms storage in-memory
const rooms = {};

// Helper to generate a random 6-character room code
const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Helper to strip circular/internal-only references before emitting to clients
const getCleanRoom = (room) => {
  if (!room) return null;
  const { timer, botTimer, ...cleanRoom } = room;
  return cleanRoom;
};

const makeNewPlayer = ({ id, userId, name, isBot = false }) => ({
  id,
  userId,
  name,
  isBot,
  role: null,      // 'CHOR' | 'SIPAHI'
  row: 0,
  col: 0,
  coinsCollected: 0,
  artifactsSecured: 0,   // Sipahi: artifacts safely collected
  artifactsStolen: 0,    // Chor: artifacts secretly stolen
  cluesFound: 0,
  votedFor: null,
  disconnected: false,
});

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Create Room
    socket.on('createRoom', async ({ userId, name }) => {
      try {
        const code = generateRoomCode();
        rooms[code] = {
          roomCode: code,
          hostId: socket.id,
          players: [makeNewPlayer({ id: socket.id, userId, name })],
          gameState: 'LOBBY', // LOBBY, PLAYING, DISCUSSION, VOTING, RESULTS
          mapId: DEFAULT_MAP_ID,
          artifacts: [],
          coins: [],
          clues: [],
          requiredStolenToWin: 0,
          chatMessages: [],
          timer: null,
          botTimer: null,
          timerVal: 0,
        };

        socket.join(code);
        socket.emit('roomCreated', getCleanRoom(rooms[code]));
        console.log(`Room created: ${code} by user ${name}`);
      } catch (err) {
        console.error(err);
        socket.emit('errorMsg', 'Failed to create room.');
      }
    });

    // Join Room
    socket.on('joinRoom', ({ roomCode, userId, name }) => {
      const code = roomCode.toUpperCase();
      const room = rooms[code];

      if (!room) {
        return socket.emit('errorMsg', 'Room not found.');
      }

      if (room.gameState !== 'LOBBY') {
        return socket.emit('errorMsg', 'Game has already started in this room.');
      }

      if (room.players.length >= 6) {
        return socket.emit('errorMsg', 'Room is full (max 6 players).');
      }

      const existingPlayerIndex = room.players.findIndex(p => p.userId === userId);
      if (existingPlayerIndex !== -1) {
        room.players[existingPlayerIndex].id = socket.id;
        room.players[existingPlayerIndex].disconnected = false;
      } else {
        room.players.push(makeNewPlayer({ id: socket.id, userId, name }));
      }

      socket.join(code);
      io.to(code).emit('roomUpdated', getCleanRoom(room));
      console.log(`User ${name} joined room: ${code}`);
    });

    // Add Bot
    socket.on('addBot', ({ roomCode }) => {
      const room = rooms[roomCode];
      if (!room) return socket.emit('errorMsg', 'Room not found.');
      if (room.hostId !== socket.id) return socket.emit('errorMsg', 'Only the host can add bots.');
      if (room.players.length >= 6) {
        return socket.emit('errorMsg', 'Room is full (max 6 players).');
      }
      if (room.gameState !== 'LOBBY') {
        return socket.emit('errorMsg', 'Cannot add bots after game starts.');
      }

      const existingNames = room.players.map(p => p.name.replace(' (Bot)', ''));
      const availableNames = BOT_NAMES.filter(name => !existingNames.includes(name));
      if (availableNames.length === 0) {
        return socket.emit('errorMsg', 'No more bots available.');
      }
      const botName = availableNames[Math.floor(Math.random() * availableNames.length)];
      const botId = `bot_${Math.random().toString(36).substr(2, 9)}`;

      room.players.push(makeNewPlayer({ id: botId, userId: null, name: `${botName} (Bot)`, isBot: true }));

      io.to(roomCode).emit('roomUpdated', getCleanRoom(room));
      console.log(`Bot ${botName} added to room: ${roomCode}`);
    });

    // Kick Player (or remove Bot)
    socket.on('kickPlayer', ({ roomCode, playerId }) => {
      const room = rooms[roomCode];
      if (!room) return socket.emit('errorMsg', 'Room not found.');
      if (room.hostId !== socket.id) return socket.emit('errorMsg', 'Only the host can kick players.');
      if (room.gameState !== 'LOBBY') {
        return socket.emit('errorMsg', 'Cannot kick players after game starts.');
      }

      const playerIndex = room.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return socket.emit('errorMsg', 'Player not found.');

      const player = room.players[playerIndex];
      if (player.id === socket.id) {
        return socket.emit('errorMsg', 'You cannot kick yourself.');
      }

      room.players.splice(playerIndex, 1);
      io.to(roomCode).emit('roomUpdated', getCleanRoom(room));

      if (!player.isBot) {
        io.to(player.id).emit('kickedFromRoom');
      }

      console.log(`Player/Bot ${player.name} kicked from room: ${roomCode}`);
    });

    // Start Game
    socket.on('startGame', ({ roomCode }) => {
      const room = rooms[roomCode];
      if (!room) return socket.emit('errorMsg', 'Room not found.');
      if (room.hostId !== socket.id) return socket.emit('errorMsg', 'Only the host can start the game.');
      if (room.players.length < 3) return socket.emit('errorMsg', 'Need at least 3 players to play Lost Artifact Hunt.');

      try {
        startExploration(roomCode);
      } catch (err) {
        console.error(err);
        socket.emit('errorMsg', 'Failed to start game.');
      }
    });

    // Player movement (client-authoritative position, server validates it's a legal single step)
    socket.on('playerMoved', ({ roomCode, row, col }) => {
      const room = rooms[roomCode];
      if (!room || room.gameState !== 'PLAYING') return;

      const map = MAPS[room.mapId];
      const player = room.players.find(p => p.id === socket.id);
      if (!player || player.disconnected) return;

      const dRow = Math.abs(row - player.row);
      const dCol = Math.abs(col - player.col);
      const isSingleStep = (dRow + dCol === 1); // 4-directional, one tile at a time
      if (!isSingleStep) return;
      if (!map.isWalkable(row, col)) return;

      player.row = row;
      player.col = col;

      // Lightweight broadcast (not the full room) since this fires often.
      socket.to(roomCode).emit('playerMoved', { id: player.id, row, col });
    });

    // Collect an item (coin, artifact, or clue). Server is authoritative here.
    socket.on('collectItem', ({ roomCode, itemType, itemId }) => {
      const room = rooms[roomCode];
      if (!room || room.gameState !== 'PLAYING') return;

      const player = room.players.find(p => p.id === socket.id);
      if (!player || player.disconnected) return;

      resolveCollection(io, room, roomCode, player, itemType, itemId);
    });

    // Cast Vote
    socket.on('castVote', ({ roomCode, targetId }) => {
      const room = rooms[roomCode];
      if (!room || room.gameState !== 'VOTING') return;

      const voter = room.players.find(p => p.id === socket.id);
      if (!voter || voter.votedFor) return;

      voter.votedFor = targetId; // Socket ID or 'skip'

      const allVoted = room.players
        .filter(p => !p.disconnected)
        .every(p => p.votedFor !== null);

      if (allVoted) {
        endVoting(roomCode);
      } else {
        io.to(roomCode).emit('roomUpdated', getCleanRoom(room));
      }
    });

    // Chat Message
    socket.on('sendMessage', ({ roomCode, message }) => {
      const room = rooms[roomCode];
      if (!room) return;

      const player = room.players.find(p => p.id === socket.id);
      if (!player) return;

      const chatMsg = {
        sender: player.name,
        text: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      room.chatMessages.push(chatMsg);
      io.to(roomCode).emit('messageReceived', chatMsg);
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);

      for (const code in rooms) {
        const room = rooms[code];
        const playerIndex = room.players.findIndex(p => p.id === socket.id);

        if (playerIndex !== -1) {
          const player = room.players[playerIndex];

          if (room.gameState === 'LOBBY') {
            room.players.splice(playerIndex, 1);
            if (room.players.length === 0) {
              clearInterval(room.timer);
              clearInterval(room.botTimer);
              delete rooms[code];
              console.log(`Room ${code} deleted (empty)`);
            } else {
              if (room.hostId === socket.id) {
                room.hostId = room.players[0].id;
              }
              io.to(code).emit('roomUpdated', getCleanRoom(room));
            }
          } else {
            player.disconnected = true;

            const activePlayers = room.players.filter(p => !p.disconnected);
            if (activePlayers.length === 0) {
              clearInterval(room.timer);
              clearInterval(room.botTimer);
              delete rooms[code];
              console.log(`Room ${code} deleted (empty during game)`);
            } else {
              if (room.hostId === socket.id) {
                room.hostId = activePlayers[0].id;
              }

              if (room.gameState === 'VOTING') {
                const allVoted = room.players
                  .filter(p => !p.disconnected)
                  .every(p => p.votedFor !== null);
                if (allVoted) {
                  endVoting(code);
                } else {
                  io.to(code).emit('roomUpdated', getCleanRoom(room));
                }
              } else {
                io.to(code).emit('roomUpdated', getCleanRoom(room));
              }
            }
          }
          break;
        }
      }
    });
  });

  // ---------------------------------------------------------------------
  // Game flow
  // ---------------------------------------------------------------------

  // Kick off exploration: assign roles + spawn points, reset the map's item state.
  function startExploration(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    const map = MAPS[room.mapId];

    room.artifacts = map.ARTIFACT_SPAWNS.map((pos, idx) => ({
      id: `artifact_${idx}`,
      row: pos.row,
      col: pos.col,
      collected: false, // secured by a Sipahi
      stolen: false,    // taken by the Chor
    }));
    room.coins = map.COIN_SPAWNS.map((pos, idx) => ({
      id: `coin_${idx}`,
      row: pos.row,
      col: pos.col,
      collected: false,
    }));
    room.clues = []; // populated as the Chor steals artifacts

    room.requiredStolenToWin = Math.ceil(room.artifacts.length / 2);

    // Assign roles: 1 Chor, rest Sipahis. Place everyone at a spawn point.
    const chorIndex = Math.floor(Math.random() * room.players.length);
    room.players.forEach((player, idx) => {
      const spawn = map.PLAYER_SPAWNS[idx % map.PLAYER_SPAWNS.length];
      player.role = idx === chorIndex ? 'CHOR' : 'SIPAHI';
      player.row = spawn.row;
      player.col = spawn.col;
      player.coinsCollected = 0;
      player.artifactsSecured = 0;
      player.artifactsStolen = 0;
      player.cluesFound = 0;
      player.votedFor = null;

      io.to(player.id).emit('roleAssigned', { role: player.role });
    });

    room.gameState = 'PLAYING';
    room.timerVal = 30; // 30 seconds to explore

    io.to(roomCode).emit('explorationStarted', {
      mapId: room.mapId,
      grid: map.grid,
      timerVal: room.timerVal,
    });
    io.to(roomCode).emit('roomUpdated', getCleanRoom(room));

    clearInterval(room.timer);
    room.timer = setInterval(() => {
      room.timerVal -= 1;
      io.to(roomCode).emit('timerUpdate', room.timerVal);

      if (room.timerVal <= 0) {
        clearInterval(room.timer);
        endExploration(roomCode, 'TIMEOUT');
      }
    }, 1000);

    clearInterval(room.botTimer);
    room.botTimer = setInterval(() => runBotActions(io, roomCode, resolveCollection), 3500);
  }

  // Shared collection resolver used by both real players and bots.
  function resolveCollection(io, room, roomCode, player, itemType, itemId) {
    if (itemType === 'coin') {
      const coin = room.coins.find(c => c.id === itemId);
      if (!coin || coin.collected) return;
      if (coin.row !== player.row || coin.col !== player.col) return;

      coin.collected = true;
      player.coinsCollected += 1;
      io.to(roomCode).emit('roomUpdated', getCleanRoom(room));
      return;
    }

    if (itemType === 'clue') {
      const clue = room.clues.find(c => c.id === itemId);
      if (!clue || clue.collected) return;
      if (clue.row !== player.row || clue.col !== player.col) return;

      clue.collected = true;
      player.cluesFound += 1;
      io.to(roomCode).emit('roomUpdated', getCleanRoom(room));
      return;
    }

    if (itemType === 'artifact') {
      const artifact = room.artifacts.find(a => a.id === itemId);
      if (!artifact || artifact.collected || artifact.stolen) return;
      if (artifact.row !== player.row || artifact.col !== player.col) return;

      if (player.role === 'SIPAHI') {
        artifact.collected = true;
        player.artifactsSecured += 1;

        const totalResolved = room.artifacts.filter(a => a.collected || a.stolen).length;
        const anyStolen = room.artifacts.some(a => a.stolen);
        if (totalResolved === room.artifacts.length && !anyStolen) {
          io.to(roomCode).emit('roomUpdated', getCleanRoom(room));
          return endExploration(roomCode, 'ALL_SECURED');
        }
      } else {
        // CHOR steals it secretly, leaving a clue behind.
        artifact.stolen = true;
        player.artifactsStolen += 1;

        const clue = {
          id: `clue_${room.clues.length}`,
          row: artifact.row,
          col: artifact.col,
          collected: false,
        };
        room.clues.push(clue);

        if (player.artifactsStolen >= room.requiredStolenToWin) {
          io.to(roomCode).emit('roomUpdated', getCleanRoom(room));
          return endExploration(roomCode, 'CHOR_QUOTA');
        }
      }

      io.to(roomCode).emit('roomUpdated', getCleanRoom(room));
    }
  }

  // Exploration is over, either by timeout or an instant-win condition.
  function endExploration(roomCode, reason) {
    const room = rooms[roomCode];
    if (!room) return;

    clearInterval(room.timer);
    clearInterval(room.botTimer);

    if (reason === 'ALL_SECURED') {
      // Nothing left to accuse anyone of: Sipahis win outright, skip the vote.
      return finishGame(roomCode, { sipahiWin: true, votedOutPlayer: null, reason });
    }

    if (reason === 'CHOR_QUOTA') {
      // The Chor got away with enough loot before being caught: Chor wins outright.
      return finishGame(roomCode, { sipahiWin: false, votedOutPlayer: null, reason });
    }

    // TIMEOUT: move to discussion + voting, as specified.
    startVotingPhase(roomCode);
  }

  // Start voting discussion phase
  function startVotingPhase(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    room.gameState = 'VOTING';
    room.timerVal = 45; // 45 seconds for discussion and voting
    room.players.forEach(p => p.votedFor = null);

    io.to(roomCode).emit('votingStarted', { timerVal: room.timerVal });
    io.to(roomCode).emit('roomUpdated', getCleanRoom(room));

    clearInterval(room.timer);
    room.timer = setInterval(() => {
      room.timerVal -= 1;
      io.to(roomCode).emit('timerUpdate', room.timerVal);

      if (room.timerVal <= 0) {
        clearInterval(room.timer);
        endVoting(roomCode);
      }
    }, 1000);

    scheduleBotChat(io, roomCode, rooms, BOT_CHAT_TEMPLATES, endVoting);
    scheduleBotVotes(io, roomCode, rooms, endVoting);
  }

  // End voting phase and compute results
  function endVoting(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    clearInterval(room.timer);

    const voteCounts = {};
    let maxVotes = 0;
    let votedOutId = null;

    room.players.forEach(p => {
      if (p.votedFor && p.votedFor !== 'skip') {
        voteCounts[p.votedFor] = (voteCounts[p.votedFor] || 0) + 1;
        if (voteCounts[p.votedFor] > maxVotes) {
          maxVotes = voteCounts[p.votedFor];
          votedOutId = p.votedFor;
        } else if (voteCounts[p.votedFor] === maxVotes) {
          votedOutId = null; // tie, no majority
        }
      }
    });

    const votedOutPlayer = votedOutId ? room.players.find(p => p.id === votedOutId) : null;
    const sipahiWin = !!(votedOutPlayer && votedOutPlayer.role === 'CHOR');

    finishGame(roomCode, { sipahiWin, votedOutPlayer, reason: 'VOTE' });
  }

  // Shared endgame: award currency, notify clients, reset room after a delay.
  async function finishGame(roomCode, { sipahiWin, votedOutPlayer, reason }) {
    const room = rooms[roomCode];
    if (!room) return;

    room.gameState = 'RESULTS';
    const chorPlayer = room.players.find(p => p.role === 'CHOR');

    const updatedPlayers = [];
    for (const player of room.players) {
      const isWinner = (player.role === 'CHOR' && !sipahiWin) || (player.role === 'SIPAHI' && sipahiWin);
      const roundCoins = (player.coinsCollected * 10) + (player.artifactsSecured * 15);
      let winCoins = 10;
      let winDiamonds = 0;

      if (isWinner) {
        winCoins = 50;
        winDiamonds = 2;
      }

      const totalCoins = roundCoins + winCoins;

      if (player.userId) {
        try {
          const user = await User.findById(player.userId);
          if (user) {
            if (isWinner) user.wins += 1;
            user.coins += totalCoins;
            user.diamonds += winDiamonds;
            await user.save();

            const inventory = await Inventory.findOne({ userId: user._id });
            if (inventory) {
              inventory.coins = user.coins;
              inventory.diamonds = user.diamonds;
              await inventory.save();
            }

            const leaderboard = await Leaderboard.findOne({ userId: user._id });
            if (leaderboard) {
              leaderboard.wins = user.wins;
              await leaderboard.save();
            }
          }
        } catch (err) {
          console.error(`Error saving user stats on match end: ${err.message}`);
        }
      }

      updatedPlayers.push({
        id: player.id,
        name: player.name,
        role: player.role,
        artifactsSecured: player.artifactsSecured,
        artifactsStolen: player.artifactsStolen,
        coinsCollected: player.coinsCollected,
        coinsEarned: totalCoins,
        diamondsEarned: winDiamonds,
        isWinner,
      });
    }

    io.to(roomCode).emit('gameEnded', {
      sipahiWin,
      reason,
      votedOutName: votedOutPlayer ? votedOutPlayer.name : 'Nobody (Skip/Tie)',
      chorName: chorPlayer ? chorPlayer.name : 'Unknown',
      playersResults: updatedPlayers,
    });

    setTimeout(() => {
      if (rooms[roomCode]) {
        rooms[roomCode].gameState = 'LOBBY';
        rooms[roomCode].artifacts = [];
        rooms[roomCode].coins = [];
        rooms[roomCode].clues = [];
        rooms[roomCode].chatMessages = [];
        rooms[roomCode].players.forEach(p => {
          p.role = null;
          p.coinsCollected = 0;
          p.artifactsSecured = 0;
          p.artifactsStolen = 0;
          p.cluesFound = 0;
          p.votedFor = null;
        });
        io.to(roomCode).emit('roomUpdated', getCleanRoom(rooms[roomCode]));
      }
    }, 12000);
  }

  // ---------------------------------------------------------------------
  // Bot simulation (movement + item collection during PLAYING)
  // ---------------------------------------------------------------------
  function runBotActions(io, roomCode, resolveCollectionFn) {
    const room = rooms[roomCode];
    if (!room || room.gameState !== 'PLAYING') return;
    const map = MAPS[room.mapId];

    const bots = room.players.filter(p => p.isBot && !p.disconnected);
    bots.forEach(bot => {
      // Small random wander so bots visibly move on other players' screens.
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      const [dRow, dCol] = directions[Math.floor(Math.random() * directions.length)];
      const newRow = bot.row + dRow;
      const newCol = bot.col + dCol;
      if (map.isWalkable(newRow, newCol)) {
        bot.row = newRow;
        bot.col = newCol;
        io.to(roomCode).emit('playerMoved', { id: bot.id, row: bot.row, col: bot.col });
      }

      // With moderate probability, attempt to collect a random available item
      // near it. Bots are simulated abstractly rather than physically pathing,
      // consistent with the "no pathfinding" constraint.
      if (Math.random() > 0.55) return;

      const availableArtifacts = room.artifacts.filter(a => !a.collected && !a.stolen);
      const availableCoins = room.coins.filter(c => !c.collected);
      const pool = [
        ...availableArtifacts.map(a => ({ type: 'artifact', item: a })),
        ...availableCoins.map(c => ({ type: 'coin', item: c })),
      ];
      if (pool.length === 0) return;

      const choice = pool[Math.floor(Math.random() * pool.length)];
      // Bots "warp" to the item's tile to simulate having walked there.
      bot.row = choice.item.row;
      bot.col = choice.item.col;
      resolveCollectionFn(io, room, roomCode, bot, choice.type, choice.item.id);
    });
  }

  // Schedule bots to send chat messages in discussion phase
  function scheduleBotChat(io, roomCode, roomsRef, templates, endVotingFn) {
    const room = roomsRef[roomCode];
    if (!room || room.gameState !== 'VOTING') return;

    const bots = room.players.filter(p => p.isBot && !p.disconnected);
    if (bots.length === 0) return;

    bots.forEach(bot => {
      if (Math.random() > 0.7) return;
      const delay = Math.floor(Math.random() * 25000) + 5000;

      setTimeout(() => {
        const currentRoom = roomsRef[roomCode];
        if (!currentRoom || currentRoom.gameState !== 'VOTING') return;
        const currentBot = currentRoom.players.find(p => p.id === bot.id);
        if (!currentBot || currentBot.disconnected) return;

        let category = 'general';
        if (currentBot.role === 'CHOR') {
          category = 'divert_chor';
        } else {
          const totalFinds = currentBot.artifactsSecured + currentBot.coinsCollected;
          if (totalFinds < 2) {
            category = Math.random() < 0.5 ? 'defend_low' : 'accuse_others';
          } else {
            category = Math.random() < 0.7 ? 'accuse_others' : 'general';
          }
        }

        const templateList = templates[category];
        let messageText = templateList[Math.floor(Math.random() * templateList.length)];

        if (messageText.includes('{target}')) {
          const candidates = currentRoom.players.filter(p => p.id !== currentBot.id && !p.disconnected);
          if (candidates.length > 0) {
            let targetPlayer;
            if (category === 'accuse_others') {
              const sorted = [...candidates].sort(
                (a, b) => (a.artifactsSecured + a.coinsCollected) - (b.artifactsSecured + b.coinsCollected)
              );
              targetPlayer = sorted[0];
            } else {
              targetPlayer = candidates[Math.floor(Math.random() * candidates.length)];
            }
            messageText = messageText.replace('{target}', targetPlayer.name);
          } else {
            const genTemplates = templates.general;
            messageText = genTemplates[Math.floor(Math.random() * genTemplates.length)];
          }
        }

        const chatMsg = {
          sender: currentBot.name,
          text: messageText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        currentRoom.chatMessages.push(chatMsg);
        io.to(roomCode).emit('messageReceived', chatMsg);
      }, delay);
    });
  }

  // Schedule bots to cast votes
  function scheduleBotVotes(io, roomCode, roomsRef, endVotingFn) {
    const room = roomsRef[roomCode];
    if (!room || room.gameState !== 'VOTING') return;

    const bots = room.players.filter(p => p.isBot && !p.disconnected && !p.votedFor);
    if (bots.length === 0) return;

    bots.forEach(bot => {
      const delay = Math.floor(Math.random() * 23000) + 12000;

      setTimeout(() => {
        const currentRoom = roomsRef[roomCode];
        if (!currentRoom || currentRoom.gameState !== 'VOTING') return;
        const currentBot = currentRoom.players.find(p => p.id === bot.id);
        if (!currentBot || currentBot.votedFor || currentBot.disconnected) return;

        const otherPlayers = currentRoom.players.filter(p => p.id !== currentBot.id && !p.disconnected);
        if (otherPlayers.length === 0) return;

        let targetId = 'skip';

        if (currentBot.role === 'CHOR') {
          const sipahis = otherPlayers.filter(p => p.role !== 'CHOR');
          const target = sipahis.length > 0 ? sipahis[Math.floor(Math.random() * sipahis.length)] : otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
          targetId = target.id;
        } else {
          const rand = Math.random();
          if (rand < 0.70) {
            const sorted = [...otherPlayers].sort(
              (a, b) => (a.artifactsSecured + a.coinsCollected) - (b.artifactsSecured + b.coinsCollected)
            );
            targetId = sorted[0].id;
          } else if (rand < 0.85) {
            targetId = otherPlayers[Math.floor(Math.random() * otherPlayers.length)].id;
          } else {
            targetId = 'skip';
          }
        }

        currentBot.votedFor = targetId;
        console.log(`Bot ${currentBot.name} voted for ${targetId}`);

        const allVoted = currentRoom.players
          .filter(p => !p.disconnected)
          .every(p => p.votedFor !== null);

        if (allVoted) {
          endVotingFn(roomCode);
        } else {
          io.to(roomCode).emit('roomUpdated', getCleanRoom(currentRoom));
        }
      }, delay);
    });
  }
};

module.exports = socketHandler;
