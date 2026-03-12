import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Serve static files in production
app.use(express.static(join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// --- Matchmaking ---

const queue = [];
let onlineCount = 0;

function isMatch(a, b) {
  // Same topic
  if (a.topic !== b.topic) return false;

  // Gender cross-match
  if (a.partnerGender !== 'any' && a.partnerGender !== b.myGender) return false;
  if (b.partnerGender !== 'any' && b.partnerGender !== a.myGender) return false;

  // Age cross-match
  if (a.partnerAge !== 'any' && a.partnerAge !== b.myAge) return false;
  if (b.partnerAge !== 'any' && b.partnerAge !== a.myAge) return false;

  return true;
}

function findMatch(user) {
  for (let i = 0; i < queue.length; i++) {
    if (queue[i].socketId !== user.socketId && isMatch(user, queue[i])) {
      return queue.splice(i, 1)[0];
    }
  }
  return null;
}

// --- Socket.io ---

io.on('connection', (socket) => {
  onlineCount++;
  io.emit('online-count', { count: onlineCount });

  socket.on('search', (filters) => {
    const user = { socketId: socket.id, ...filters };

    // Remove from queue if already searching
    const idx = queue.findIndex((u) => u.socketId === socket.id);
    if (idx !== -1) queue.splice(idx, 1);

    const match = findMatch(user);

    if (match) {
      const roomId = `room_${socket.id}_${match.socketId}`;
      socket.join(roomId);
      const matchSocket = io.sockets.sockets.get(match.socketId);
      if (matchSocket) {
        matchSocket.join(roomId);
      }

      socket.data.roomId = roomId;
      socket.data.partnerId = match.socketId;

      if (matchSocket) {
        matchSocket.data.roomId = roomId;
        matchSocket.data.partnerId = socket.id;
      }

      socket.emit('matched');
      if (matchSocket) matchSocket.emit('matched');
    } else {
      queue.push(user);
    }
  });

  socket.on('stop-search', () => {
    const idx = queue.findIndex((u) => u.socketId === socket.id);
    if (idx !== -1) queue.splice(idx, 1);
  });

  socket.on('message', (data) => {
    const partnerId = socket.data.partnerId;
    if (partnerId) {
      const partnerSocket = io.sockets.sockets.get(partnerId);
      if (partnerSocket) {
        partnerSocket.emit('message', {
          text: data.text,
          timestamp: Date.now(),
          fromPartner: true,
        });
      }
    }
  });

  socket.on('typing', () => {
    const partnerId = socket.data.partnerId;
    if (partnerId) {
      const partnerSocket = io.sockets.sockets.get(partnerId);
      if (partnerSocket) partnerSocket.emit('typing');
    }
  });

  socket.on('stop-typing', () => {
    const partnerId = socket.data.partnerId;
    if (partnerId) {
      const partnerSocket = io.sockets.sockets.get(partnerId);
      if (partnerSocket) partnerSocket.emit('stop-typing');
    }
  });

  socket.on('disconnect-chat', () => {
    const partnerId = socket.data.partnerId;
    if (partnerId) {
      const partnerSocket = io.sockets.sockets.get(partnerId);
      if (partnerSocket) {
        partnerSocket.emit('partner-disconnected');
        partnerSocket.data.roomId = null;
        partnerSocket.data.partnerId = null;
      }
    }
    if (socket.data.roomId) {
      socket.leave(socket.data.roomId);
    }
    socket.data.roomId = null;
    socket.data.partnerId = null;
  });

  socket.on('disconnect', () => {
    onlineCount--;
    io.emit('online-count', { count: onlineCount });

    // Remove from queue
    const idx = queue.findIndex((u) => u.socketId === socket.id);
    if (idx !== -1) queue.splice(idx, 1);

    // Notify partner
    const partnerId = socket.data.partnerId;
    if (partnerId) {
      const partnerSocket = io.sockets.sockets.get(partnerId);
      if (partnerSocket) {
        partnerSocket.emit('partner-disconnected');
        partnerSocket.data.roomId = null;
        partnerSocket.data.partnerId = null;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
