// Enciclopédia com liberação progressiva
import { query } from '../config/db.js';
import { nivelPorXp } from '../services/progressService.js';
import { filtrarBacteria, filtrarAntibiotico } from '../services/unlockService.js';

const nivelDe = async (userId) => {
  const { rows } = await query('SELECT xp FROM users WHERE id=$1', [userId]);
  return nivelPorXp(rows[0]?.xp ?? 0);
};

export async function listBacteria(req, res) {
  const nivel = await nivelDe(req.user.id);
  const { rows } = await query(
    `SELECT b.*, a.nome AS antibiotico FROM bacteria b
     LEFT JOIN antibiotics a ON a.id=b.antibiotic_id ORDER BY b.nome`
  );
  res.json({ nivel, itens: rows.map((b) => filtrarBacteria(b, nivel)) });
}

export async function listAntibiotics(req, res) {
  const nivel = await nivelDe(req.user.id);
  const { rows } = await query('SELECT * FROM antibiotics ORDER BY nome');
  res.json({ nivel, itens: rows.map((a) => filtrarAntibiotico(a, nivel)) });
}
