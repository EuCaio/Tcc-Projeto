import { verifyToken } from '../middlewares/auth.js';
import { rooms, criarSala, entrarSala, sairSala, salaPublica } from './rooms.js';
import { iniciarPartida, responder } from './match.js';

export function setupSockets(io) {
  io.use((socket, next) => {
    try {
      socket.data.user = verifyToken(socket.handshake.auth?.token);
      next();
    } catch {
      next(new Error('Não autenticado'));
    }
  });

  io.on('connection', (socket) => {
    const seguro = (ack, fn) => {
      try {
        const room = fn();
        ack?.({ ok: true, sala: room ? salaPublica(room) : null });
      } catch (e) {
        ack?.({ ok: false, erro: e.message });
      }
    };
    const emitir = (room) => room && io.to(room.code).emit('room:updated', salaPublica(room));

    socket.on('room:create', (_, ack) =>
      seguro(ack, () => { const r = criarSala(socket); emitir(r); return r; }));

    socket.on('room:join', ({ code }, ack) =>
      seguro(ack, () => { const r = entrarSala(socket, String(code || '').toUpperCase()); emitir(r); return r; }));

    socket.on('room:leave', (_, ack) =>
      seguro(ack, () => { emitir(sairSala(socket)); return null; }));

    socket.on('match:start', (_, ack) =>
      seguro(ack, () => {
        const room = rooms.get(socket.data.room);
        if (!room) throw new Error('Você não está em uma sala');
        if (room.hostId !== socket.id) throw new Error('Só o anfitrião inicia a partida');
        if (room.players.size < 2) throw new Error('São necessários ao menos 2 jogadores');
        iniciarPartida(io, room);
        return room;
      }));

    socket.on('match:answer', ({ resposta }) => {
      const room = rooms.get(socket.data.room);
      if (room) responder(io, room, socket.id, resposta);
    });

    socket.on('disconnect', () => emitir(sairSala(socket)));
  });
}
