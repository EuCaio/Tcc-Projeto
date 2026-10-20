// RF01: gera questões a partir dos dados do banco.
// bacteria: [{id, nome, gram, morfologia, doenca, antibiotico}]
// antibiotics: [{nome, mecanismo}]
const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) =>
  a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
const uniq = (a) => [...new Set(a)];

export const CATEGORIAS = ['gram', 'forma', 'doenca', 'atb', 'mec'];

export function generateQuestion(bacteria, antibiotics) {
  const categoria = rnd(CATEGORIAS);
  const b = rnd(bacteria);
  let enunciado, resposta, pool, bacteriaId = b.id;

  if (categoria === 'gram') {
    enunciado = `Qual a classificação de ${b.nome}?`;
    resposta = b.gram;
    pool = uniq(bacteria.map((x) => x.gram));
  } else if (categoria === 'forma') {
    enunciado = `Qual a morfologia de ${b.nome}?`;
    resposta = b.morfologia;
    pool = uniq(bacteria.map((x) => x.morfologia));
  } else if (categoria === 'doenca') {
    enunciado = `Qual infecção é típica de ${b.nome}?`;
    resposta = b.doenca;
    pool = uniq(bacteria.map((x) => x.doenca));
  } else if (categoria === 'atb') {
    enunciado = `Qual antibiótico é indicado em "${b.doenca}" causada por ${b.nome}?`;
    resposta = b.antibiotico;
    pool = uniq(antibiotics.map((x) => x.nome));
  } else {
    const a = rnd(antibiotics);
    bacteriaId = null;
    enunciado = `Qual o mecanismo de ação de ${a.nome}?`;
    resposta = a.mecanismo;
    pool = uniq(antibiotics.map((x) => x.mecanismo));
  }

  const erradas = shuffle(pool.filter((x) => x !== resposta)).slice(0, 3);
  return { categoria, bacteriaId, enunciado, resposta, alternativas: shuffle([resposta, ...erradas]) };
}
