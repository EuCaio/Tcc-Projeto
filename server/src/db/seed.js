import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../config/db.js';

const contentDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../content');
const read = (f) => JSON.parse(fs.readFileSync(path.join(contentDir, f), 'utf8'));

const BADGES = [
  ['primeiro_acerto', 'Primeiro acerto', 'Acertar uma questão'],
  ['sequencia_5', '5 acertos seguidos', 'Sequência de 5 acertos em uma rodada'],
  ['rodada_perfeita', 'Rodada perfeita', 'Acertar todas as questões de uma rodada'],
  ['nivel_2', 'Nível 2', 'Alcançar o nível 2'],
  ['nivel_4', 'Nível 4', 'Alcançar o nível 4'],
  ['cem_respostas', '100 respostas', 'Responder 100 questões'],
];

for (const a of read('antibioticos.json')) {
  await pool.query(
    `INSERT INTO antibiotics (nome, classe, mecanismo, nivel_desbloqueio) VALUES ($1,$2,$3,$4)
     ON CONFLICT (nome) DO UPDATE SET classe=$2, mecanismo=$3, nivel_desbloqueio=$4`,
    [a.nome, a.classe, a.mecanismo, a.nivel]
  );
}

for (const b of read('bacterias.json')) {
  const { rows } = await pool.query('SELECT id FROM antibiotics WHERE nome=$1', [b.antibiotico]);
  if (!rows[0]) throw new Error(`Antibiótico não cadastrado: ${b.antibiotico}`);
  await pool.query(
    `INSERT INTO bacteria (nome, gram, morfologia, doenca, antibiotic_id, curiosidade, nivel_desbloqueio)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (nome) DO UPDATE SET gram=$2, morfologia=$3, doenca=$4, antibiotic_id=$5, curiosidade=$6, nivel_desbloqueio=$7`,
    [b.nome, b.gram, b.morfologia, b.doenca, rows[0].id, b.curiosidade, b.nivel]
  );
}

for (const [codigo, nome, regra] of BADGES) {
  await pool.query(
    `INSERT INTO badges (codigo, nome, regra) VALUES ($1,$2,$3)
     ON CONFLICT (codigo) DO UPDATE SET nome=$2, regra=$3`,
    [codigo, nome, regra]
  );
}

console.log('seed concluído');
await pool.end();
