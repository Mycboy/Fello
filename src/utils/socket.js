import { io } from 'socket.io-client';

// Use same host on port 5000 in local development, or relative in production
const SOCKET_URL = window.location.port === '5173' ? 'http://localhost:5000' : window.location.origin;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']
});
