// O servidor sorteia, cronometra e valida. O cliente só exibe e responde.
import { query } from '../config/db.js';
import { loadContent } from '../controllers/quiz.js';
import { generateQuestion } from '../services/questionGenerator.js';
import { placar, salaPublica } from './rooms.js';

const N_QUESTOES = 10;
const TEMPO_MS = 15000;
const PAUSA_MS = Number(process.env.MATCH_PAUSA_MS) || 3000;

export async function iniciarPartida(io, room) {
  const { bacteria, antibiotics } = await loadContent();
  room.questoes = Array.from({ length: N_QUESTOES }, () => generateQuestion(bacteria, antibiotics));
  room.estado = 'jogando';
  room.idx = -1;
  for (const p of room.players.values()) { p.pontos = 0; p.acertos = 0; }
  io.to(room.code).emit('room:updated', salaPublica(room));
  proximaQuestao(io, room);
}

function proximaQuestao(io, room) {
  room.idx += 1;
  if (room.idx >= room.questoes.length) return finalizar(io, room);
  room.respondidas.clear();
  room.deadline = Date.now() + TEMPO_MS;
  const q = room.questoes[room.idx];
  io.to(room.code).emit('match:question', {
    index: room.idx, total: room.questoes.length, categoria: q.categoria,
    enunciado: q.enunciado, alternativas: q.alternativas, deadline: room.deadline,
  });
  room.timer = setTimeout(() => fecharQuestao(io, room), TEMPO_MS);
}

export function responder(io, room, socketId, resposta) {
  if (room.estado !== 'jogando' || room.respondidas.has(socketId)) return;
  const p = room.players.get(socketId);
  const q = room.questoes[room.idx];
  if (!p || !q || Date.now() > room.deadline) return;
  room.respondidas.add(socketId);
  if (resposta === q.resposta) {
    const segundosRestantes = Math.ceil((room.deadline - Date.now()) / 1000);
    p.pontos += 10 + segundosRestantes;
    p.acertos += 1;
  }
  if (room.respondidas.size === room.players.size) fecharQuestao(io, room);
}

function fecharQuestao(io, room) {
  clearTimeout(room.timer);
  io.to(room.code).emit('match:scoreboard', {
    index: room.idx, respostaCorreta: room.questoes[room.idx].resposta, placar: placar(room),
  });
  room.timer = setTimeout(() => proximaQuestao(io, room), PAUSA_MS);
}

async function finalizar(io, room) {
  room.estado = 'finalizada';
  io.to(room.code).emit('match:finished', { placar: placar(room) });
  io.to(room.code).emit('room:updated', salaPublica(room));
  try {
    const modo = room.players.size === 2 ? '1v1' : 'sala';
    const m = await query(
      'INSERT INTO matches (modo, codigo_sala, finalizada_em) VALUES ($1,$2,now()) RETURNING id',
      [modo, room.code]
    );
    for (const p of room.players.values()) {
      await query(
        'INSERT INTO match_players (match_id, user_id, pontos, acertos) VALUES ($1,$2,$3,$4)',
        [m.rows[0].id, p.userId, p.pontos, p.acertos]
      );
    }
    // TODO: somar p.pontos ao XP dos jogadores com addXp()
  } catch (e) {
    console.error('Falha ao salvar partida:', e.message);
  }
}
