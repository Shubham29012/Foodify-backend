// lib/wsEmitter.js
const { Emitter } = require('@socket.io/redis-emitter');
const Redis = require('ioredis');                // <-- ioredis

const redis = new Redis(process.env.REDIS_URL);  // ONE client is enough
const ioEmitter = new Emitter(redis);

function notifyUser(userId, event, payload) {
  ioEmitter.to(`user:${userId}`).emit(event, payload);
}

module.exports = { notifyUser };
