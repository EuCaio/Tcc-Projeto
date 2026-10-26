// Quiz solo. O servidor guarda as respostas certas; o cliente nunca as recebe antes de responder.
import { query } from '../config/db.js';
import { generateQuestion } from '../services/questionGenerator.js';
import { addXp, pontosPor, verificarConquistas } from '../services/progressService.js';
import { criarRodada, registrarResposta } from '../services/roundService.js';

export async function loadContent() {
  const b = await query(
    `SELECT b.*, a.nome AS antibiotico FROM bacteria b JOIN antibiotics a ON a.id=b.antibiotic_id`
  );
  const a = await query('SELECT * FROM antibiotics');
  return { bacteria: b.rows, antibiotics: a.rows };
}

export async function newRound(req, res) {
  const n = Math.min(Math.max(Number(req.query.n) || 10, 1), 20);
  const { bacteria, antibiotics } = await loadContent();
  const qs = Array.from({ length: n }, () => generateQuestion(bacteria, antibiotics));
  const roundId = await criarRodada(req.user.id, qs);
  res.json({
    roundId,
    questoes: qs.map((q, i) => ({ index: i, categoria: q.categoria, enunciado: q.enunciado, alternativas: q.alternativas })),
  });
}

export async function submitAnswer(req, res) {
  const { roundId, index, resposta, tempoMs } = req.body;
  const r = await registrarResposta(roundId, req.user.id, index, resposta);
  const pontos = pontosPor(r.correta, tempoMs);

  await query(
    'INSERT INTO answers (user_id, categoria, bacteria_id, correta, tempo_ms) VALUES ($1,$2,$3,$4,$5)',
    [req.user.id, r.questao.categoria, r.questao.bacteriaId, r.correta, Number.isFinite(tempoMs) ? Math.round(tempoMs) : null]
  );
  const prog = await addXp(req.user.id, pontos);
  const novasConquistas = await verificarConquistas(req.user.id, {
    acertou: r.correta,
    sequencia: r.maxSequencia,
    rodadaPerfeita: r.fim && r.acertos === r.total,
    nivel: prog.nivel,
  });

  res.json({
    correta: r.correta, respostaCorreta: r.questao.resposta, pontos,
    xp: prog.xp, nivel: prog.nivel, subiuDeNivel: prog.nivel > prog.nivelAnterior, novasConquistas,
  });
}
