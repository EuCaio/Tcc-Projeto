// Teste de fumaça: percorre autenticação, enciclopédia, rodada solo, desempenho e multiplayer contra um servidor em execução.
// Uso: node scripts/smoke.mjs   (variável API opcional, padrão http://localhost:4000)
import { io } from 'socket.io-client';

const API = process.env.API || 'http://localhost:4000';
let falhas = 0;
const ok = (cond, msg) => { console.log(cond ? '  ok  ' : ' FALHA', msg); if (!cond) falhas++; };

async function http(caminho, { method = 'GET', body, token } = {}) {
  const r = await fetch(`${API}/api${caminho}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: r.status, dados: await r.json().catch(() => ({})) };
}

const sufixo = Date.now();
const mk = async (nome) => {
  const r = await http('/auth/register', { method: 'POST', body: { nome, email: `${nome}${sufixo}@teste.com`, senha: '123456' } });
  return { ...r.dados, status: r.status, email: `${nome}${sufixo}@teste.com` };
};

console.log('Autenticação');
const a = await mk('alexia');
const c = await mk('caio');
ok(a.status === 201 && a.token, 'cadastro retorna token');
ok((await http('/auth/register', { method: 'POST', body: { nome: 'x', email: a.email, senha: '123456' } })).status === 409, 'e-mail duplicado é recusado');
ok((await http('/auth/login', { method: 'POST', body: { email: a.email, senha: 'errada' } })).status === 401, 'senha errada é recusada');
ok((await http('/auth/login', { method: 'POST', body: { email: a.email, senha: '123456' } })).status === 200, 'login funciona');
ok((await http('/bacteria')).status === 401, 'rota protegida exige token');

console.log('Enciclopédia');
const bact = (await http('/bacteria', { token: a.token })).dados;
ok(bact.nivel === 1 && bact.itens.length >= 30, `lista ${bact.itens.length} bactérias no nível 1`);
const bloq = bact.itens.filter((b) => b.bloqueado);
ok(bloq.length > 0 && bloq.every((b) => b.curiosidade === null), 'curiosidades bloqueadas não são enviadas');
ok(bact.itens.every((b) => b.morfologia && b.antibiotico), 'dados básicos sempre visíveis');

console.log('Rodada solo, XP e níveis');
const rodada = (await http('/questions/round?n=10', { token: a.token })).dados;
ok(rodada.questoes?.length === 10, 'rodada com 10 questões');
ok(!JSON.stringify(rodada).includes('"resposta"'), 'gabarito não é enviado ao cliente');
let xp = 0, nivel = 1, ultimo;
for (const q of rodada.questoes) {
  ultimo = (await http('/answers', { method: 'POST', token: a.token, body: { roundId: rodada.roundId, index: q.index, resposta: q.alternativas[0], tempoMs: 3000 } })).dados;
  xp = ultimo.xp; nivel = ultimo.nivel;
}
ok(typeof ultimo.correta === 'boolean' && ultimo.respostaCorreta, 'resposta devolve correção');
const repetida = await http('/answers', { method: 'POST', token: a.token, body: { roundId: rodada.roundId, index: 0, resposta: 'x' } });
ok(repetida.status === 404 || repetida.status === 400, 'rodada concluída não aceita mais respostas');

console.log('Desempenho');
const st = (await http('/me/stats', { token: a.token })).dados;
const total = st.porCategoria.reduce((s, x) => s + x.total, 0);
ok(total === 10, 'estatísticas somam 10 respostas');
ok(st.xp === xp, 'XP do desempenho confere com o das respostas');

console.log('Multiplayer');
const conectar = (token) => new Promise((res, rej) => {
  const s = io(API, { auth: { token } });
  s.on('connect', () => res(s)); s.on('connect_error', rej);
});
const emitir = (s, ev, d = {}) => new Promise((res) => s.emit(ev, d, res));
const s1 = await conectar(a.token), s2 = await conectar(c.token);
await conectar('token-invalido').then(() => ok(false, 'token inválido deveria ser recusado'), () => ok(true, 'socket recusa token inválido'));

const criada = await emitir(s1, 'room:create');
ok(criada.ok && criada.sala.code.length === 4, 'sala criada com código de 4 letras');
const code = criada.sala.code;
ok((await emitir(s2, 'room:join', { code: 'ZZZZ' })).ok === false, 'sala inexistente é recusada');
ok((await emitir(s1, 'match:start')).ok === false, 'não inicia com 1 jogador');
ok((await emitir(s2, 'room:join', { code })).sala.jogadores.length === 2, 'segundo jogador entra');
ok((await emitir(s2, 'match:start')).ok === false, 'só o anfitrião inicia');

let perguntas = 0, final = null;
for (const s of [s1, s2]) {
  s.on('match:question', (q) => { if (s === s1) perguntas++; s.emit('match:answer', { resposta: q.alternativas[0] }); });
  s.on('match:finished', (f) => { if (s === s1) final = f; });
}
ok((await emitir(s1, 'match:start')).ok, 'anfitrião inicia a partida');
const limite = Date.now() + 60000;
while (!final && Date.now() < limite) await new Promise((r) => setTimeout(r, 200));
ok(perguntas === 10, `partida enviou 10 questões (${perguntas})`);
ok(final && final.placar.length === 2, 'partida termina com placar de 2 jogadores');
s1.close(); s2.close();

console.log(falhas ? `\n${falhas} falha(s)` : '\nTudo certo');
process.exit(falhas ? 1 : 0);
