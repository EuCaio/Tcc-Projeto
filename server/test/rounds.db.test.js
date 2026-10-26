// Teste de integração das rodadas no banco. É ignorado se o PostgreSQL não estiver disponível
// ou se a migration 002 não tiver sido aplicada (rode `npm run migrate`).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { pool } from '../src/config/db.js';
import { criarRodada, registrarResposta } from '../src/services/roundService.js';

let pronto = false;
let userId;
const questoes = [
  { categoria: 'gram', bacteriaId: null, enunciado: 'q1', resposta: 'A', alternativas: ['A', 'B', 'C'] },
  { categoria: 'gram', bacteriaId: null, enunciado: 'q2', resposta: 'B', alternativas: ['A', 'B', 'C'] },
  { categoria: 'gram', bacteriaId: null, enunciado: 'q3', resposta: 'C', alternativas: ['A', 'B', 'C'] },
];

before(async () => {
  try {
    await pool.query('SELECT 1 FROM rounds LIMIT 1');
    const r = await pool.query(
      "INSERT INTO users (nome, email, senha_hash) VALUES ('teste', $1, 'x') RETURNING id",
      [`rounds-${Date.now()}@teste.com`]
    );
    userId = r.rows[0].id;
    pronto = true;
  } catch { /* sem banco: os testes abaixo são ignorados */ }
});

after(async () => {
  if (userId) await pool.query('DELETE FROM users WHERE id=$1', [userId]); // apaga rodadas em cascata
  await pool.end();
});

const precisaBanco = (t) => { if (!pronto) { t.skip('PostgreSQL indisponível ou migration 002 não aplicada'); return true; } };

test('a rodada fica gravada no banco (não na memória do servidor)', async (t) => {
  if (precisaBanco(t)) return;
  const id = await criarRodada(userId, questoes);
  const { rows } = await pool.query('SELECT * FROM rounds WHERE id=$1', [id]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].questoes.length, 3);
  assert.equal(rows[0].questoes[0].resposta, 'A');
});

test('registra acertos, erros e sequência', async (t) => {
  if (precisaBanco(t)) return;
  const id = await criarRodada(userId, questoes);
  const r0 = await registrarResposta(id, userId, 0, 'A');
  assert.deepEqual([r0.correta, r0.fim, r0.maxSequencia], [true, false, 1]);
  const r1 = await registrarResposta(id, userId, 1, 'X');
  assert.deepEqual([r1.correta, r1.maxSequencia], [false, 1]);
  const r2 = await registrarResposta(id, userId, 2, 'C');
  assert.deepEqual([r2.correta, r2.fim, r2.acertos, r2.total], [true, true, 2, 3]);
});

test('rodada concluída é removida e não aceita mais respostas', async (t) => {
  if (precisaBanco(t)) return;
  const id = await criarRodada(userId, questoes);
  for (let i = 0; i < 3; i++) await registrarResposta(id, userId, i, 'A');
  const { rows } = await pool.query('SELECT 1 FROM rounds WHERE id=$1', [id]);
  assert.equal(rows.length, 0);
  await assert.rejects(registrarResposta(id, userId, 0, 'A'), (e) => e.status === 404);
});

test('não responde a mesma questão duas vezes', async (t) => {
  if (precisaBanco(t)) return;
  const id = await criarRodada(userId, questoes);
  await registrarResposta(id, userId, 0, 'A');
  await assert.rejects(registrarResposta(id, userId, 0, 'A'), (e) => e.status === 400);
});

test('requisições simultâneas para a mesma questão: só uma vale', async (t) => {
  if (precisaBanco(t)) return;
  const id = await criarRodada(userId, questoes);
  const resultados = await Promise.allSettled(Array.from({ length: 6 }, () => registrarResposta(id, userId, 0, 'A')));
  assert.equal(resultados.filter((r) => r.status === 'fulfilled').length, 1);
});

test('índice inválido, id malformado e outro usuário são recusados', async (t) => {
  if (precisaBanco(t)) return;
  const id = await criarRodada(userId, questoes);
  await assert.rejects(registrarResposta(id, userId, 99, 'A'), (e) => e.status === 400);
  await assert.rejects(registrarResposta(id, userId, -1, 'A'), (e) => e.status === 400);
  await assert.rejects(registrarResposta(id, userId, '0', 'A'), (e) => e.status === 400);
  await assert.rejects(registrarResposta('nao-e-uuid', userId, 0, 'A'), (e) => e.status === 404);
  await assert.rejects(registrarResposta(id, userId + 999999, 0, 'A'), (e) => e.status === 404);
});

test('rodadas abandonadas há mais de 2 horas são limpas ao criar uma nova', async (t) => {
  if (precisaBanco(t)) return;
  const velha = await criarRodada(userId, questoes);
  await pool.query("UPDATE rounds SET criada_em = now() - interval '3 hours' WHERE id=$1", [velha]);
  await criarRodada(userId, questoes);
  const { rows } = await pool.query('SELECT 1 FROM rounds WHERE id=$1', [velha]);
  assert.equal(rows.length, 0);
});
