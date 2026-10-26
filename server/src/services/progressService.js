// XP, níveis e conquistas
import { query } from '../config/db.js';

export const TEMPO_MAX_S = 15;
export const nivelPorXp = (xp) => Math.floor(xp / 100) + 1;

// O tempo vem do cliente no quiz solo, então é limitado a [0, tempo máximo].
// Sem isso, um tempo negativo renderia mais pontos que o máximo permitido.
export function pontosPor(correta, tempoMs) {
  if (!correta) return 0;
  const ms = Number.isFinite(tempoMs) ? Math.min(Math.max(tempoMs, 0), TEMPO_MAX_S * 1000) : TEMPO_MAX_S * 1000;
  return 10 + (TEMPO_MAX_S - Math.floor(ms / 1000));
}

export async function addXp(userId, pontos) {
  const { rows } = await query('UPDATE users SET xp = xp + $2 WHERE id=$1 RETURNING xp', [userId, pontos]);
  const xp = rows[0].xp;
  return { xp, nivel: nivelPorXp(xp), nivelAnterior: nivelPorXp(xp - pontos) };
}

async function conceder(userId, codigo) {
  const { rows } = await query(
    `INSERT INTO user_badges (user_id, badge_id)
     SELECT $1, id FROM badges WHERE codigo=$2
     ON CONFLICT DO NOTHING RETURNING badge_id`,
    [userId, codigo]
  );
  if (!rows[0]) return null;
  const b = await query('SELECT nome FROM badges WHERE id=$1', [rows[0].badge_id]);
  return b.rows[0].nome;
}

// ctx: { acertou, sequencia, rodadaPerfeita, nivel }
export async function verificarConquistas(userId, ctx) {
  const novas = [];
  const tentar = async (cond, codigo) => {
    if (!cond) return;
    const nome = await conceder(userId, codigo);
    if (nome) novas.push(nome);
  };
  await tentar(ctx.acertou, 'primeiro_acerto');
  await tentar(ctx.sequencia >= 5, 'sequencia_5');
  await tentar(ctx.rodadaPerfeita, 'rodada_perfeita');
  await tentar(ctx.nivel >= 2, 'nivel_2');
  await tentar(ctx.nivel >= 4, 'nivel_4');
  const { rows } = await query('SELECT count(*)::int AS n FROM answers WHERE user_id=$1', [userId]);
  await tentar(rows[0].n >= 100, 'cem_respostas');
  return novas;
}
