import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lerConteudo } from './helpers.js';

const bacterias = lerConteudo('bacterias.json');
const antibioticos = lerConteudo('antibioticos.json');
const GRAMS = ['Gram-positiva', 'Gram-negativa', 'BAAR (álcool-ácido resistente)'];

test('nomes de bactérias e antibióticos são únicos', () => {
  const unico = (lista) => new Set(lista.map((x) => x.nome.toLowerCase())).size === lista.length;
  assert.ok(unico(bacterias), 'bactéria repetida');
  assert.ok(unico(antibioticos), 'antibiótico repetido');
});

test('bactérias têm todos os campos obrigatórios', () => {
  for (const b of bacterias) {
    for (const campo of ['nome', 'gram', 'morfologia', 'doenca', 'antibiotico', 'curiosidade']) {
      assert.ok(typeof b[campo] === 'string' && b[campo].trim(), `${b.nome ?? '?'}: campo "${campo}" vazio`);
    }
    assert.ok(Number.isInteger(b.nivel) && b.nivel >= 1, `${b.nome}: nível inválido`);
  }
});

test('antibióticos têm todos os campos obrigatórios', () => {
  for (const a of antibioticos) {
    for (const campo of ['nome', 'classe', 'mecanismo']) {
      assert.ok(typeof a[campo] === 'string' && a[campo].trim(), `${a.nome ?? '?'}: campo "${campo}" vazio`);
    }
    assert.ok(Number.isInteger(a.nivel) && a.nivel >= 1, `${a.nome}: nível inválido`);
  }
});

test('o antibiótico de cada bactéria existe no catálogo (senão o seed falha)', () => {
  const nomes = new Set(antibioticos.map((a) => a.nome));
  for (const b of bacterias) assert.ok(nomes.has(b.antibiotico), `${b.nome}: antibiótico "${b.antibiotico}" não cadastrado`);
});

test('classificação de Gram usa só os valores previstos', () => {
  for (const b of bacterias) assert.ok(GRAMS.includes(b.gram), `${b.nome}: "${b.gram}" não é um valor previsto`);
});

test('há conteúdo suficiente para o gerador montar alternativas', () => {
  assert.ok(bacterias.length >= 4, 'poucas bactérias');
  assert.ok(antibioticos.length >= 4, 'poucos antibióticos');
});

test('"outros antibióticos" existem no catálogo, não repetem o principal nem entre si', () => {
  const nomes = new Set(antibioticos.map((a) => a.nome));
  for (const b of bacterias) {
    const outros = b.outros_antibioticos ?? [];
    assert.ok(Array.isArray(outros), `${b.nome}: outros_antibioticos deve ser uma lista`);
    assert.equal(new Set(outros).size, outros.length, `${b.nome}: antibiótico repetido na lista`);
    assert.ok(!outros.includes(b.antibiotico), `${b.nome}: o principal não deve estar em "outros"`);
    for (const o of outros) assert.ok(nomes.has(o), `${b.nome}: "${o}" não está no catálogo`);
  }
});

test('cada nível de 1 a 4 libera pelo menos 3 bactérias (senão não há o que desbloquear)', () => {
  for (const nivel of [1, 2, 3, 4]) {
    const n = bacterias.filter((b) => b.nivel === nivel).length;
    assert.ok(n >= 3, `nível ${nivel} tem só ${n} bactéria(s)`);
  }
  assert.ok(bacterias.every((b) => b.nivel <= 4), 'há bactéria com nível acima de 4');
});

test('cada bactéria tem uma doença própria (evita alternativa ambígua)', () => {
  const doencas = bacterias.map((b) => b.doenca.toLowerCase());
  assert.equal(new Set(doencas).size, doencas.length, 'doença repetida entre bactérias');
});

test('mecanismos com o mesmo significado usam exatamente o mesmo texto', () => {
  const mecs = [...new Set(antibioticos.map((a) => a.mecanismo))];
  assert.ok(mecs.length >= 4, 'poucos mecanismos distintos');
  for (const a of mecs) for (const b of mecs) {
    if (a !== b) assert.ok(!b.startsWith(a) && !a.startsWith(b), `textos quase iguais: "${a}" e "${b}"`);
  }
});

test('cada antibiótico do catálogo é usado por pelo menos uma bactéria', () => {
  const usados = new Set(bacterias.flatMap((b) => [b.antibiotico, ...(b.outros_antibioticos ?? [])]));
  for (const a of antibioticos) assert.ok(usados.has(a.nome), `${a.nome} não é usado por nenhuma bactéria`);
});
