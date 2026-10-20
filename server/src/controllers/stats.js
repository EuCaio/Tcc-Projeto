// RF04: desempenho
import { query } from '../config/db.js';
import { nivelPorXp } from '../services/progressService.js';

export async function myStats(req, res) {
  const u = await query('SELECT xp FROM users WHERE id=$1', [req.user.id]);
  const porCategoria = await query(
    `SELECT categoria, count(*)::int AS total, count(*) FILTER (WHERE correta)::int AS acertos
     FROM answers WHERE user_id=$1 GROUP BY categoria ORDER BY categoria`,
    [req.user.id]
  );
  const conquistas = await query(
    `SELECT b.codigo, b.nome, ub.conquistado_em FROM user_badges ub
     JOIN badges b ON b.id=ub.badge_id WHERE ub.user_id=$1`,
    [req.user.id]
  );
  const xp = u.rows[0].xp;
  res.json({ xp, nivel: nivelPorXp(xp), porCategoria: porCategoria.rows, conquistas: conquistas.rows });
}

// TODO (Sprint 4): criar tabelas classes/class_members e retornar o desempenho da turma.
export async function classStats(req, res) {
  res.status(501).json({ erro: 'Painel do professor ainda não implementado' });
}
