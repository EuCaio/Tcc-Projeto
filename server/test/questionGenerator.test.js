import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateQuestion, CATEGORIAS } from '../src/services/questionGenerator.js';
import { conteudoComoNoBanco } from './helpers.js';

const { bacteria, antibiotics } = conteudoComoNoBanco();
const gerar = (n) => Array.from({ length: n }, () => generateQuestion(bacteria, antibiotics));

test('a resposta correta sempre está entre as alternativas', () => {
  for (const q of gerar(1000)) assert.ok(q.alternativas.includes(q.resposta), q.enunciado);
});

test('alternativas são únicas e há entre 3 e 4 opções', () => {
  for (const q of gerar(1000)) {
    assert.equal(new Set(q.alternativas).size, q.alternativas.length, `repetidas em: ${q.enunciado}`);
    assert.ok(q.alternativas.length >= 3 && q.alternativas.length <= 4, `${q.alternativas.length} opções em: ${q.enunciado}`);
  }
});

test('todas as categorias aparecem', () => {
  const vistas = new Set(gerar(500).map((q) => q.categoria));
  for (const c of CATEGORIAS) assert.ok(vistas.has(c), `categoria ausente: ${c}`);
});

test('a resposta de cada questão confere com os dados da bactéria', () => {
  for (const q of gerar(1000)) {
    if (q.categoria === 'mec') {
      assert.equal(q.bacteriaId, null);
      const atb = antibiotics.find((a) => q.enunciado.includes(a.nome));
      assert.equal(q.resposta, atb.mecanismo);
      continue;
    }
    const b = bacteria.find((x) => x.id === q.bacteriaId);
    assert.ok(b, 'bacteriaId inválido');
    assert.ok(q.enunciado.includes(b.nome));
    const esperado = { gram: b.gram, forma: b.morfologia, doenca: b.doenca, atb: b.antibiotico }[q.categoria];
    assert.equal(q.resposta, esperado, q.enunciado);
  }
});

test('questão de antibiótico: nenhuma alternativa errada também serve para a mesma doença', () => {
  for (const q of gerar(1000).filter((x) => x.categoria === 'atb')) {
    const b = bacteria.find((x) => x.id === q.bacteriaId);
    const tambemValidos = bacteria.filter((x) => x.doenca === b.doenca).map((x) => x.antibiotico);
    for (const alt of q.alternativas) {
      if (alt !== q.resposta) assert.ok(!tambemValidos.includes(alt), `${alt} também é válido em: ${q.enunciado}`);
    }
  }
});

test('funciona com conteúdo mínimo sem quebrar', () => {
  const b = [{ id: 1, nome: 'A', gram: 'Gram-positiva', morfologia: 'Cocos', doenca: 'X', antibiotico: 'P' }];
  const a = [{ nome: 'P', mecanismo: 'm1' }];
  for (let i = 0; i < 50; i++) {
    const q = generateQuestion(b, a);
    assert.ok(q.alternativas.includes(q.resposta));
  }
});

test('questão de antibiótico: alternativas erradas nunca estão em "outros antibióticos" corretos', () => {
  const casos = gerar(3000).filter((x) => x.categoria === 'atb');
  assert.ok(casos.length > 100, 'poucas questões de antibiótico geradas');
  for (const q of casos) {
    const b = bacteria.find((x) => x.id === q.bacteriaId);
    for (const alt of q.alternativas) {
      if (alt !== q.resposta) assert.ok(!b.outros_antibioticos.includes(alt), `${alt} também é correto para ${b.nome}`);
    }
  }
});

test('questão de mecanismo: nenhuma alternativa errada repete o mecanismo certo', () => {
  for (const q of gerar(1000).filter((x) => x.categoria === 'mec')) {
    assert.equal(q.alternativas.filter((a) => a === q.resposta).length, 1);
  }
});
