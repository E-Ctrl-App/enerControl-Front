import {io} from 'socket.io-client';

import {API_BASE_URL} from './config';

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(API_BASE_URL, {
      autoConnect: false,
      transports: ['websocket'],
    });
  }

  return socket;
}

export function connectSocket() {
  const activeSocket = getSocket();

  if (!activeSocket.connected) {
    activeSocket.connect();
  }

  return activeSocket;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}

