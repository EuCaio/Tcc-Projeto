import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nivelPorXp, pontosPor, TEMPO_MAX_S } from '../src/services/progressService.js';
import { filtrarBacteria, filtrarAntibiotico } from '../src/services/unlockService.js';

test('nível sobe a cada 100 XP', () => {
  assert.equal(nivelPorXp(0), 1);
  assert.equal(nivelPorXp(99), 1);
  assert.equal(nivelPorXp(100), 2);
  assert.equal(nivelPorXp(250), 3);
  assert.equal(nivelPorXp(400), 5);
});

test('resposta errada não rende pontos', () => {
  assert.equal(pontosPor(false, 0), 0);
  assert.equal(pontosPor(false, 5000), 0);
});

test('resposta correta: 10 pontos + segundos restantes', () => {
  assert.equal(pontosPor(true, 0), 10 + TEMPO_MAX_S);
  assert.equal(pontosPor(true, 3000), 10 + TEMPO_MAX_S - 3);
  assert.equal(pontosPor(true, 3999), 10 + TEMPO_MAX_S - 3);
  assert.equal(pontosPor(true, TEMPO_MAX_S * 1000), 10);
});

test('tempo acima do limite rende só os 10 pontos base', () => {
  assert.equal(pontosPor(true, 99999), 10);
});

test('tempo negativo ou inválido não passa do máximo (correção de exploit)', () => {
  const maximo = 10 + TEMPO_MAX_S;
  assert.equal(pontosPor(true, -5000), maximo);
  assert.equal(pontosPor(true, -1e9), maximo);
  assert.equal(pontosPor(true, undefined), 10);
  assert.equal(pontosPor(true, 'abc'), 10);
  assert.equal(pontosPor(true, NaN), 10);
});

test('desbloqueio: esconde o extra, mas mantém os dados básicos', () => {
  const b = { nome: 'X', gram: 'Gram-positiva', curiosidade: 'segredo', nivel_desbloqueio: 3 };
  const bloqueada = filtrarBacteria(b, 2);
  assert.equal(bloqueada.curiosidade, null);
  assert.equal(bloqueada.bloqueado, true);
  assert.equal(bloqueada.gram, 'Gram-positiva');
  const liberada = filtrarBacteria(b, 3);
  assert.equal(liberada.curiosidade, 'segredo');
  assert.equal(liberada.bloqueado, false);
});

test('desbloqueio de antibiótico segue a mesma regra', () => {
  const a = { nome: 'Y', mecanismo: 'm', nivel_desbloqueio: 2 };
  assert.equal(filtrarAntibiotico(a, 1).mecanismo, null);
  assert.equal(filtrarAntibiotico(a, 2).mecanismo, 'm');
});
