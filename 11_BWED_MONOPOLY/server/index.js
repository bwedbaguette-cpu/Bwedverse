// ============================================================================
// BWEDOPOLY — SERVEUR WEBSOCKET & ÉTAT AUTORITAIRE (Express + Socket.io)
// ============================================================================

import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { BOARD_TILES } from '../shared/boardData.js';
import { GAME_CONFIG } from '../shared/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

// Servir les fichiers statiques client et shared
const clientPath = path.join(__dirname, '../client');
const sharedPath = path.join(__dirname, '../shared');

app.use(express.static(clientPath));
app.use('/shared', express.static(sharedPath));

// Gestion des Salles (Rooms)
// Room format: { id, players: Map<socketId, Player>, turnIndex: 0, order: string[], ownership: {} }
const rooms = new Map();

function createRoom(roomId) {
  return {
    id: roomId,
    players: new Map(),
    playerOrder: [],
    currentTurnIndex: 0,
    ownership: {}, // tileIndex -> socketId
    turnPhase: 'ROLL_DICE', // 'ROLL_DICE' | 'TILE_ACTION' | 'ENDED'
    lastDice: [1, 1]
  };
}

io.on('connection', (socket) => {
  console.log(`[Socket.io] Joueur connecté : ${socket.id}`);

  socket.on('join_room', ({ roomId = 'main-bakery', playerName = 'Mitron', pawnModel }) => {
    let room = rooms.get(roomId);
    if (!room) {
      room = createRoom(roomId);
      rooms.set(roomId, room);
    }

    socket.join(roomId);

    const newPlayer = {
      id: socket.id,
      name: playerName,
      farines: GAME_CONFIG.STARTING_MONEY,
      currentTile: 0,
      pawnModel: pawnModel || './assets/pawns/toast-tycoon.glb',
      inJail: false,
      jailTurns: 0,
      isBankrupt: false
    };

    room.players.set(socket.id, newPlayer);
    if (!room.playerOrder.includes(socket.id)) {
      room.playerOrder.push(socket.id);
    }

    console.log(`[Room ${roomId}] ${playerName} a rejoint (${room.players.size} joueurs).`);

    // Notifier la salle
    io.to(roomId).emit('room_state', {
      players: Array.from(room.players.values()),
      currentTurnPlayerId: room.playerOrder[room.currentTurnIndex],
      turnPhase: room.turnPhase,
      ownership: room.ownership
    });
  });

  // Action autoritaire : Lancer de dés
  socket.on('roll_dice', ({ roomId = 'main-bakery' }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const currentPlayerId = room.playerOrder[room.currentTurnIndex];
    if (socket.id !== currentPlayerId) {
      socket.emit('error_msg', "Ce n'est pas votre tour de jeu !");
      return;
    }

    if (room.turnPhase !== 'ROLL_DICE') {
      socket.emit('error_msg', "Vous avez déjà lancé les dés ce tour-ci.");
      return;
    }

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    room.lastDice = [d1, d2];

    const player = room.players.get(socket.id);
    const prevTile = player.currentTile;
    const nextTile = (prevTile + total) % 40;

    let passedGo = false;
    if (nextTile < prevTile) {
      player.farines += GAME_CONFIG.GO_SALARY;
      passedGo = true;
    }

    player.currentTile = nextTile;
    room.turnPhase = 'TILE_ACTION';

    io.to(roomId).emit('dice_rolled', {
      playerId: socket.id,
      dice: [d1, d2],
      total,
      fromTile: prevTile,
      toTile: nextTile,
      passedGo,
      playerFarines: player.farines
    });
  });

  // Action autoritaire : Achat de propriété
  socket.on('buy_property', ({ roomId = 'main-bakery' }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const currentPlayerId = room.playerOrder[room.currentTurnIndex];
    if (socket.id !== currentPlayerId) return;

    const player = room.players.get(socket.id);
    const tile = BOARD_TILES[player.currentTile];

    if (tile.type === 'PROPERTY' && !room.ownership[tile.index] && player.farines >= tile.price) {
      player.farines -= tile.price;
      room.ownership[tile.index] = player.id;

      io.to(roomId).emit('property_bought', {
        playerId: player.id,
        tileIndex: tile.index,
        price: tile.price,
        remainingFarines: player.farines
      });
    }
  });

  // Action autoritaire : Fin du tour
  socket.on('end_turn', ({ roomId = 'main-bakery' }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    if (socket.id !== room.playerOrder[room.currentTurnIndex]) return;

    room.currentTurnIndex = (room.currentTurnIndex + 1) % room.playerOrder.length;
    room.turnPhase = 'ROLL_DICE';

    io.to(roomId).emit('next_turn', {
      currentTurnPlayerId: room.playerOrder[room.currentTurnIndex]
    });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Déconnexion : ${socket.id}`);
    for (const [roomId, room] of rooms.entries()) {
      if (room.players.has(socket.id)) {
        room.players.delete(socket.id);
        room.playerOrder = room.playerOrder.filter(id => id !== socket.id);
        if (room.players.size === 0) {
          rooms.delete(roomId);
        } else {
          room.currentTurnIndex = room.currentTurnIndex % room.playerOrder.length;
          io.to(roomId).emit('room_state', {
            players: Array.from(room.players.values()),
            currentTurnPlayerId: room.playerOrder[room.currentTurnIndex],
            turnPhase: room.turnPhase,
            ownership: room.ownership
          });
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`🥖 Serveur Bwedopoly 3D en écoute sur http://localhost:${PORT}`);
});
