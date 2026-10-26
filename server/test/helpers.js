// Carrega o conteúdo didático (content/*.json) no mesmo formato que o banco devolve.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../content');
export const lerConteudo = (arq) => JSON.parse(fs.readFileSync(path.join(dir, arq), 'utf8'));

export function conteudoComoNoBanco() {
  const antibiotics = lerConteudo('antibioticos.json').map((a) => ({ nome: a.nome, mecanismo: a.mecanismo }));
  const bacteria = lerConteudo('bacterias.json').map((b, i) => ({
    id: i + 1, nome: b.nome, gram: b.gram, morfologia: b.morfologia, doenca: b.doenca, antibiotico: b.antibiotico,
    outros_antibioticos: b.outros_antibioticos ?? [],
  }));
  return { bacteria, antibiotics };
}
