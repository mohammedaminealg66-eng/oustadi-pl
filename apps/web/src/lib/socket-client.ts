import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let currentToken: string | null = null;

export function getSocket(token: string): Socket {
  if (socket && socket.connected && token === currentToken) return socket;
  if (socket) { socket.removeAllListeners(); socket.disconnect(); }
  currentToken = token;
  socket = io('/ws', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });
  socket.on('connect', () => console.log('[ws] connected'));
  socket.on('connect_error', (err) => console.error('[ws] error', err.message));
  socket.on('disconnect', (reason) => console.log('[ws] disconnected', reason));
  return socket;
}

export function destroySocket() {
  if (socket) { socket.removeAllListeners(); socket.disconnect(); socket = null; currentToken = null; }
}
