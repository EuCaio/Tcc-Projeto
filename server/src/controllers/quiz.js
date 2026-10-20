// RF01: quiz solo. O servidor guarda as respostas certas; o cliente nunca as recebe antes de responder.
import { randomUUID } from 'node:crypto';
import { query } from '../config/db.js';
import { generateQuestion } from '../services/questionGenerator.js';
import { addXp, pontosPor, verificarConquistas } from '../services/progressService.js';

const rounds = new Map(); // roundId -> { userId, qs, respondidas:Set, sequencia, acertos }
const fail = (status, msg) => Object.assign(new Error(msg), { status });

export async function loadContent() {
  const b = await query(
    `SELECT b.*, a.nome AS antibiotico FROM bacteria b JOIN antibiotics a ON a.id=b.antibiotic_id`
  );
  const a = await query('SELECT * FROM antibiotics');
  return { bacteria: b.rows, antibiotics: a.rows };
}

export async function newRound(req, res) {
  const n = Math.min(Number(req.query.n) || 10, 20);
  const { bacteria, antibiotics } = await loadContent();
  const qs = Array.from({ length: n }, () => generateQuestion(bacteria, antibiotics));
  const roundId = randomUUID();
  rounds.set(roundId, { userId: req.user.id, qs, respondidas: new Set(), sequencia: 0, maxSequencia: 0, acertos: 0 });
  res.json({
    roundId,
    questoes: qs.map((q, i) => ({ index: i, categoria: q.categoria, enunciado: q.enunciado, alternativas: q.alternativas })),
  });
}

export async function submitAnswer(req, res) {
  const { roundId, index, resposta, tempoMs } = req.body;
  const r = rounds.get(roundId);
  if (!r || r.userId !== req.user.id) throw fail(404, 'Rodada não encontrada');
  const q = r.qs[index];
  if (!q || r.respondidas.has(index)) throw fail(400, 'Questão inválida ou já respondida');
  r.respondidas.add(index);

  const correta = resposta === q.resposta;
  r.acertos += correta ? 1 : 0;
  r.sequencia = correta ? r.sequencia + 1 : 0;
  r.maxSequencia = Math.max(r.maxSequencia, r.sequencia);
  const pontos = pontosPor(correta, tempoMs);

  await query(
    'INSERT INTO answers (user_id, categoria, bacteria_id, correta, tempo_ms) VALUES ($1,$2,$3,$4,$5)',
    [req.user.id, q.categoria, q.bacteriaId, correta, tempoMs ?? null]
  );
  const prog = await addXp(req.user.id, pontos);
  const fim = r.respondidas.size === r.qs.length;
  const novasConquistas = await verificarConquistas(req.user.id, {
    acertou: correta,
    sequencia: r.maxSequencia,
    rodadaPerfeita: fim && r.acertos === r.qs.length,
    nivel: prog.nivel,
  });
  if (fim) rounds.delete(roundId);

  res.json({ correta, respostaCorreta: q.resposta, pontos, xp: prog.xp, nivel: prog.nivel, subiuDeNivel: prog.nivel > prog.nivelAnterior, novasConquistas });
}
