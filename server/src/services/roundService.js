// Rodadas do quiz solo, persistidas no PostgreSQL.
// O gabarito fica no banco; o cliente só recebe enunciado e alternativas.
import { randomUUID } from 'node:crypto';
import { pool, query } from '../config/db.js';
import { httpError } from '../middlewares/error.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALIDADE = "interval '2 hours'";

export async function criarRodada(userId, questoes) {
  // Limpa rodadas abandonadas (o jogador fechou o app no meio da partida).
  await query(`DELETE FROM rounds WHERE criada_em < now() - ${VALIDADE}`);
  const id = randomUUID();
  await query('INSERT INTO rounds (id, user_id, questoes) VALUES ($1,$2,$3)', [id, userId, JSON.stringify(questoes)]);
  return id;
}

// Registra uma resposta de forma atômica. O FOR UPDATE impede que duas requisições
// simultâneas respondam a mesma questão (e contem pontos duas vezes).
export async function registrarResposta(roundId, userId, index, resposta) {
  if (!UUID.test(String(roundId))) throw httpError(404, 'Rodada não encontrada');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT * FROM rounds WHERE id=$1 AND user_id=$2 FOR UPDATE', [roundId, userId]);
    const r = rows[0];
    if (!r) throw httpError(404, 'Rodada não encontrada');

    const q = Number.isInteger(index) ? r.questoes[index] : undefined;
    if (!q || r.respondidas.includes(index)) throw httpError(400, 'Questão inválida ou já respondida');

    const correta = resposta === q.resposta;
    const respondidas = [...r.respondidas, index];
    const acertos = r.acertos + (correta ? 1 : 0);
    const sequencia = correta ? r.sequencia + 1 : 0;
    const maxSequencia = Math.max(r.max_sequencia, sequencia);
    const fim = respondidas.length === r.questoes.length;

    if (fim) {
      await client.query('DELETE FROM rounds WHERE id=$1', [roundId]);
    } else {
      await client.query(
        'UPDATE rounds SET respondidas=$2, acertos=$3, sequencia=$4, max_sequencia=$5 WHERE id=$1',
        [roundId, JSON.stringify(respondidas), acertos, sequencia, maxSequencia]
      );
    }
    await client.query('COMMIT');
    return { questao: q, correta, fim, acertos, maxSequencia, total: r.questoes.length };
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}
