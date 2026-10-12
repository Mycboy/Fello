import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// 1. HTTP Rate Limiters
// General API Rate Limiter: Max 60 requests per minute
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' }
});

// Strict Auth Limiter: Max 12 login/signup attempts per 15 minutes to block brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again in a few minutes.' }
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Matchmaking and state
let waitingQueue = [];
const activeRooms = new Map(); // roomId -> { user1, user2, startedAt }
const userRoomMap = new Map();  // socketId -> roomId
const connectedUsers = new Map(); // socketId -> { nickname, avatar }

// 2. Real-Time Socket Rate Limiting Trackers
const socketMessageHistory = new Map(); // socketId -> [timestamps]
const socketSearchHistory = new Map();  // socketId -> lastTimestamp
const socketTypingHistory = new Map();  // socketId -> lastTimestamp

// Simple in-memory accounts for optional login/signup demo
const registeredUsers = new Map([
  ['test@fello.chat', { password: 'password123', nickname: 'ShadowDrifter', avatar: '🦊' }],
  ['demo@fello.chat', { password: 'demo123', nickname: 'NeonVoyager', avatar: '🚀' }]
]);

// Auth Endpoints for persistent accounts
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  const user = registeredUsers.get(identifier?.toLowerCase());
  if (user && user.password === password) {
    return res.json({
      success: true,
      user: {
        email: identifier,
        nickname: user.nickname,
        avatar: user.avatar
      }
    });
  }
  return res.status(401).json({ success: false, message: 'Invalid credentials. You can also use Quick Anonymous mode!' });
});

app.post('/api/auth/signup', (req, res) => {
  const { email, password, nickname, avatar } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  const key = email.toLowerCase();
  if (registeredUsers.has(key)) {
    return res.status(400).json({ success: false, message: 'Account already exists. Please log in.' });
  }
  const newUser = {
    password,
    nickname: nickname || `Anon_${Math.floor(1000 + Math.random() * 9000)}`,
    avatar: avatar || '👻'
  };
  registeredUsers.set(key, newUser);
  return res.json({
    success: true,
    user: {
      email,
      nickname: newUser.nickname,
      avatar: newUser.avatar
    }
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    onlineCount: io.engine.clientsCount || connectedUsers.size || 0,
    waitingCount: waitingQueue.length,
    activeChats: activeRooms.size
  });
});

function broadcastStats() {
  io.emit('stats_update', {
    onlineCount: Math.max(io.engine.clientsCount, 12) + Math.floor(Math.random() * 4),
    waitingCount: waitingQueue.length,
    activeChats: activeRooms.size + 8
  });
}

// Pure random 1-on-1 matchmaking (FIFO)
function matchUsers() {
  while (waitingQueue.length >= 2) {
    const u1 = waitingQueue.shift();
    const u2 = waitingQueue.shift();

    if (!u1 || !u2) break;
    if (u1.socketId === u2.socketId) {
      waitingQueue.unshift(u1);
      break;
    }

    const s1 = io.sockets.sockets.get(u1.socketId);
    const s2 = io.sockets.sockets.get(u2.socketId);

    if (!s1 || !s2) {
      if (s1) waitingQueue.unshift(u1);
      if (s2) waitingQueue.unshift(u2);
      continue;
    }

    // Guard against race conditions where a socket is already paired
    if (userRoomMap.has(u1.socketId) || userRoomMap.has(u2.socketId)) {
      if (!userRoomMap.has(u1.socketId)) waitingQueue.unshift(u1);
      if (!userRoomMap.has(u2.socketId)) waitingQueue.unshift(u2);
      continue;
    }

    const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    s1.join(roomId);
    s2.join(roomId);

    activeRooms.set(roomId, {
      user1: u1,
      user2: u2,
      startedAt: Date.now()
    });

    userRoomMap.set(u1.socketId, roomId);
    userRoomMap.set(u2.socketId, roomId);

    // Notify User 1
    s1.emit('chat_start', {
      roomId,
      partner: {
        nickname: u2.nickname,
        avatar: u2.avatar
      }
    });

    // Notify User 2
    s2.emit('chat_start', {
      roomId,
      partner: {
        nickname: u1.nickname,
        avatar: u1.avatar
      }
    });

    broadcastStats();
  }
}

// Rate limiter helper for socket messages (max 5 messages per 3 seconds)
function checkMessageRateLimit(socketId) {
  const now = Date.now();
  let timestamps = socketMessageHistory.get(socketId) || [];
  // Retain timestamps within the last 3 seconds
  timestamps = timestamps.filter(t => now - t < 3000);

  if (timestamps.length >= 5) {
    socketMessageHistory.set(socketId, timestamps);
    return false; // Rate limit exceeded!
  }

  timestamps.push(now);
  socketMessageHistory.set(socketId, timestamps);
  return true; // Allowed
}

// Rate limiter helper for matchmaking button spamming (minimum 1.2s between search clicks)
function checkSearchRateLimit(socketId) {
  const now = Date.now();
  const last = socketSearchHistory.get(socketId) || 0;
  if (now - last < 1200) {
    return false; // Throttled
  }
  socketSearchHistory.set(socketId, now);
  return true;
}

io.on('connection', (socket) => {
  connectedUsers.set(socket.id, {
    socketId: socket.id,
    nickname: 'Anonymous',
    avatar: '👻'
  });

  broadcastStats();

  // User sets their anonymous profile
  socket.on('set_profile', (profile) => {
    connectedUsers.set(socket.id, {
      socketId: socket.id,
      nickname: profile.nickname || 'Anonymous',
      avatar: profile.avatar || '👻'
    });
  });

  // User joins matchmaking search queue (with Rate Limiting)
  socket.on('find_partner', (preferences) => {
    if (!checkSearchRateLimit(socket.id)) {
      socket.emit('rate_limited', {
        type: 'search',
        message: 'Matchmaking cooldown active. Please wait a second before searching again.'
      });
      return;
    }

    const existingRoom = userRoomMap.get(socket.id);
    if (existingRoom) {
      handleLeaveRoom(socket.id, existingRoom);
    }

    waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);

    const userProfile = connectedUsers.get(socket.id) || {};
    const queueEntry = {
      socketId: socket.id,
      nickname: preferences?.nickname || userProfile.nickname || 'Anonymous',
      avatar: preferences?.avatar || userProfile.avatar || '👻',
      joinedAt: Date.now()
    };

    waitingQueue.push(queueEntry);
    socket.emit('searching_status', { inQueue: true, position: waitingQueue.length });
    broadcastStats();

    setTimeout(matchUsers, 200);
  });

  // Cancel search
  socket.on('cancel_search', () => {
    waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);
    socket.emit('searching_status', { inQueue: false });
    broadcastStats();
  });

  // Solo test simulated stranger handler
  socket.on('request_demo_stranger', (preferences) => {
    waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);
    const roomId = `room_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    socket.join(roomId);

    const botName = 'NeonPhantom';
    const botAvatar = '🦊';

    const simState = {
      isSimulated: true,
      userSocketId: socket.id,
      botName,
      botAvatar,
      startedAt: Date.now()
    };
    activeRooms.set(roomId, simState);
    userRoomMap.set(socket.id, roomId);

    socket.emit('chat_start', {
      roomId,
      partner: {
        nickname: botName,
        avatar: botAvatar
      }
    });

    // Send initial greeting after 1.2s
    setTimeout(() => {
      if (activeRooms.has(roomId)) {
        socket.emit('partner_typing', { isTyping: true });
        setTimeout(() => {
          if (activeRooms.has(roomId)) {
            socket.emit('partner_typing', { isTyping: false });
            socket.emit('receive_message', {
              id: `msg_bot_${Date.now()}`,
              senderSocketId: 'bot',
              text: "Hey! What's on your mind right now?",
              timestamp: Date.now()
            });
          }
        }, 1200);
      }
    }, 800);
  });

  // Send message to partner (supports text, photo, audio voice notes with strict validation)
  socket.on('send_message', ({ roomId, text, type = 'text', mediaUrl, duration }) => {
    if (!roomId) return;
    const cleanText = typeof text === 'string' ? text.trim().slice(0, 2000) : '';
    if (type === 'text' && !cleanText) return;
    if ((type === 'image' || type === 'audio') && (!mediaUrl || typeof mediaUrl !== 'string' || mediaUrl.length > 15000000)) return;

    // Check message flood limit (max 5 per 3s)
    if (!checkMessageRateLimit(socket.id)) {
      socket.emit('rate_limited', {
        type: 'message',
        message: '⚠️ Whoa there! Slow down, you are sending messages too fast.'
      });
      return;
    }

    const room = activeRooms.get(roomId);
    if (room && room.isSimulated) {
      let reply;
      if (type === 'image') {
        const imageResponses = [
          "Whoa, nice photo! That looks awesome.",
          "Love the picture! What's the context behind it?",
          "That's so cool. Thanks for sharing that visual!"
        ];
        reply = imageResponses[Math.floor(Math.random() * imageResponses.length)];
      } else if (type === 'audio') {
        const audioResponses = [
          "Nice voice note! Always cool hearing real human voices here.",
          "Loved that audio message! Makes this feel so much more personal.",
          "Haha awesome voice note! Here is my reaction."
        ];
        reply = audioResponses[Math.floor(Math.random() * audioResponses.length)];
      } else {
        const botResponses = [
          "That's so fascinating! How did you get into that?",
          "Honestly, I never looked at it from that perspective before.",
          "Haha 100%! I was just thinking about something similar earlier today.",
          "That sounds wild. What made you think of that?",
          "I completely agree with you on that one.",
          "Anonymity really lets people talk about things they normally wouldn't, right?",
          "Tell me more! I'm genuinely curious.",
          "If you could teleport anywhere right now, where would you go?"
        ];
        reply = botResponses[Math.floor(Math.random() * botResponses.length)];
      }

      setTimeout(() => {
        if (activeRooms.has(roomId)) {
          socket.emit('partner_typing', { isTyping: true });
          setTimeout(() => {
            if (activeRooms.has(roomId)) {
              socket.emit('partner_typing', { isTyping: false });
              socket.emit('receive_message', {
                id: `msg_bot_${Date.now()}`,
                senderSocketId: 'bot',
                type: 'text',
                text: reply,
                timestamp: Date.now()
              });
            }
          }, 1500);
        }
      }, 700);
      return;
    }

    const messageData = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderSocketId: socket.id,
      type: type || 'text',
      text: cleanText,
      mediaUrl: (type === 'image' || type === 'audio') ? mediaUrl : null,
      duration: duration || null,
      timestamp: Date.now()
    };

    // Acknowledge back to sender with confirmed server message ID
    socket.emit('message_ack', {
      id: messageData.id,
      timestamp: messageData.timestamp
    });

    // Relay to partner
    socket.to(roomId).emit('receive_message', messageData);
  });

  // Message delivered receipt (partner received the message)
  socket.on('message_delivered', ({ roomId, messageId }) => {
    if (!roomId || !messageId) return;
    socket.to(roomId).emit('partner_delivered', { messageId });
  });

  // Message reaction (emoji reaction attached to message bubble)
  socket.on('message_reaction', ({ roomId, messageId, reaction }) => {
    if (!roomId || !messageId || !reaction) return;
    socket.to(roomId).emit('receive_reaction', { messageId, reaction });
  });

  // Mutual connection request between users
  socket.on('connection_request', ({ roomId, requester }) => {
    if (!roomId || !requester) return;
    socket.to(roomId).emit('receive_connection_request', { requester });
  });

  // Mutual connection accepted
  socket.on('connection_accept', ({ roomId, accepter }) => {
    if (!roomId || !accepter) return;
    socket.to(roomId).emit('connection_accepted', { accepter });
  });

  // Typing indicator (throttled to at most once per 400ms)
  socket.on('typing', ({ roomId, isTyping }) => {
    if (!roomId) return;
    const now = Date.now();
    const last = socketTypingHistory.get(socket.id) || 0;
    if (now - last < 400 && isTyping) {
      return; // Throttled typing event
    }
    socketTypingHistory.set(socket.id, now);
    socket.to(roomId).emit('partner_typing', { isTyping });
  });

  // Leave current chat
  socket.on('leave_chat', ({ roomId }) => {
    handleLeaveRoom(socket.id, roomId);
  });

  // Next stranger (with 3-second minimum chat stay rate limit)
  socket.on('next_partner', (preferences) => {
    const existingRoom = userRoomMap.get(socket.id);
    if (existingRoom) {
      const room = activeRooms.get(existingRoom);
      // Enforce 3-second minimum stay in active chat
      if (room && room.startedAt && Date.now() - room.startedAt < 3000) {
        const remaining = Math.ceil((3000 - (Date.now() - room.startedAt)) / 1000);
        socket.emit('rate_limited', {
          type: 'search',
          message: `Please stay in the new chat for at least ${remaining} more second${remaining > 1 ? 's' : ''}.`
        });
        return;
      }
      handleLeaveRoom(socket.id, existingRoom);
    }

    waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);
    const userProfile = connectedUsers.get(socket.id) || {};

    waitingQueue.push({
      socketId: socket.id,
      nickname: preferences?.nickname || userProfile.nickname || 'Anonymous',
      avatar: preferences?.avatar || userProfile.avatar || '👻',
      joinedAt: Date.now()
    });

    socket.emit('searching_status', { inQueue: true, position: waitingQueue.length });
    broadcastStats();
    setTimeout(matchUsers, 200);
  });

  // Disconnect & cleanup rate limit maps
  socket.on('disconnect', () => {
    waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);
    const roomId = userRoomMap.get(socket.id);
    if (roomId) {
      handleLeaveRoom(socket.id, roomId);
    }
    connectedUsers.delete(socket.id);
    socketMessageHistory.delete(socket.id);
    socketSearchHistory.delete(socket.id);
    socketTypingHistory.delete(socket.id);
    broadcastStats();
  });
});

function handleLeaveRoom(leavingSocketId, roomId) {
  const room = activeRooms.get(roomId);
  if (!room) return;

  const partnerSocketId = room.user1.socketId === leavingSocketId ? room.user2.socketId : room.user1.socketId;

  io.to(partnerSocketId).emit('partner_left', {
    reason: 'Stranger has disconnected or left the chat room.'
  });

  userRoomMap.delete(room.user1.socketId);
  userRoomMap.delete(room.user2.socketId);
  activeRooms.delete(roomId);

  const leavingSocket = io.sockets.sockets.get(leavingSocketId);
  if (leavingSocket) leavingSocket.leave(roomId);

  const partnerSocket = io.sockets.sockets.get(partnerSocketId);
  if (partnerSocket) partnerSocket.leave(roomId);

  broadcastStats();
}

// Serve static assets from Vite build in production
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route for SPA client-side routing (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Anonymous Chat Server running on http://localhost:${PORT}`);
});
