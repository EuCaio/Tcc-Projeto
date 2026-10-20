// Salas em memória. Para escalar para várias instâncias, trocar por Redis.
export const rooms = new Map();
export const MAX_JOGADORES = 8;

const gerarCodigo = () => Math.random().toString(36).slice(2, 6).toUpperCase();

export function criarSala(socket) {
  let code;
  do { code = gerarCodigo(); } while (rooms.has(code));
  const room = {
    code, hostId: socket.id, estado: 'lobby', players: new Map(),
    questoes: [], idx: -1, respondidas: new Set(), timer: null, deadline: 0,
  };
  rooms.set(code, room);
  return entrarSala(socket, code);
}

export function entrarSala(socket, code) {
  const room = rooms.get(code);
  if (!room) throw new Error('Sala não encontrada');
  if (room.estado !== 'lobby') throw new Error('A partida já começou');
  if (room.players.size >= MAX_JOGADORES) throw new Error('Sala cheia');
  room.players.set(socket.id, {
    userId: socket.data.user.id, nome: socket.data.user.nome, pontos: 0, acertos: 0,
  });
  socket.join(code);
  socket.data.room = code;
  return room;
}

export function sairSala(socket) {
  const room = rooms.get(socket.data.room);
  if (!room) return null;
  room.players.delete(socket.id);
  socket.leave(room.code);
  socket.data.room = null;
  if (room.players.size === 0) {
    clearTimeout(room.timer);
    rooms.delete(room.code);
    return null;
  }
  if (room.hostId === socket.id) room.hostId = room.players.keys().next().value;
  return room;
}

export const placar = (room) =>
  [...room.players.entries()]
    .map(([id, p]) => ({ id, nome: p.nome, pontos: p.pontos, acertos: p.acertos }))
    .sort((a, b) => b.pontos - a.pontos);

export const salaPublica = (room) => ({
  code: room.code, hostId: room.hostId, estado: room.estado, jogadores: placar(room),
});
