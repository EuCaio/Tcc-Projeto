import { io } from 'socket.io-client';
import { useAuth } from '../store/auth.js';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io('/', { auth: { token: useAuth.getState().token } });
  }
  return socket;
}

export function fecharSocket() {
  socket?.disconnect();
  socket = null;
}

export const emitir = (evento, dados = {}) =>
  new Promise((resolve, reject) => {
    getSocket().emit(evento, dados, (r) => (r?.ok ? resolve(r.sala) : reject(new Error(r?.erro || 'Erro'))));
  });
