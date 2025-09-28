// ws/server.js
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const Redis = require('ioredis');           // <-- ioredis
const jwt = require('jsonwebtoken');

const WS_PORT = process.env.WS_PORT || 4001;

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: true, credentials: true },
  transports: ['websocket'],
});

// ioredis clients
const pubClient = new Redis(process.env.REDIS_URL);
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

// (optional) auth
io.use((socket, next) => {
  try {
    const hdr = socket.handshake.headers?.authorization;
    const token = socket.handshake.auth?.token ||
      (hdr && hdr.startsWith('Bearer ') ? hdr.slice(7) : null);
    if (!token) return next(new Error('No auth token'));
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const uid = payload.sub || payload.userId;
    if (!uid) return next(new Error('Invalid token'));
    socket.data.userId = uid;
    next();
  } catch { next(new Error('Auth failed')); }
});

io.on('connection', (socket) => {
  const uid = socket.data.userId;
  socket.join(`user:${uid}`);
  socket.on('disconnect', () => {});
});

server.listen(WS_PORT, () => {
  console.log(`WS server listening on :${WS_PORT}`);
});
