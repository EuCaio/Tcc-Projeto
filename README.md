# BacterioQuest

Aplicativo gamificado para o estudo de bacteriologia e uso racional de antibióticos (TCC – Engenharia de Software, UNIVASSOURAS).

**Stack:** React + Vite + Tailwind (PWA) · Node.js + Express · Socket.io · PostgreSQL

## Rodando com Docker (mais simples)

```bash
docker compose up
```

- Frontend: http://localhost:5173
- API: http://localhost:4000/api/health

O compose sobe o banco, aplica as migrations, carrega os dados de `content/` e inicia servidor e cliente.

## Rodando sem Docker

Requisitos: Node 20+ e PostgreSQL 16.

```bash
# 1. Banco
createdb bacterioquest   # ajuste usuário/senha em server/.env

# 2. Servidor
cd server
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev

# 3. Cliente (em outro terminal)
cd client
npm install
npm run dev
```

## Mapa de requisitos

| Requisito | Onde está |
|---|---|
| RF01 Jogos/desafios | `server/src/services/questionGenerator.js`, `server/src/controllers/quiz.js`, `client/src/pages/Quiz.jsx` |
| RF02 Enciclopédia com desbloqueio | `server/src/services/unlockService.js`, `client/src/pages/Encyclopedia.jsx` |
| RF03 XP, níveis e conquistas | `server/src/services/progressService.js` |
| RF04 Desempenho | `server/src/controllers/stats.js`, `client/src/pages/Stats.jsx` (painel do professor: TODO) |
| RF05 Cadastro e login | `server/src/controllers/auth.js`, `client/src/pages/Login.jsx` |
| RF06 Salas e 1v1 | `server/src/sockets/`, `client/src/pages/Lobby.jsx` e `Match.jsx` |
| RNF03 Android + web | PWA (`client/public/manifest.json`); falta service worker (ver TODO) |
| RNF04 Confiabilidade científica | `content/` + `content/REVISAO.md` |

## Conteúdo didático

Edite apenas `content/bacterias.json` e `content/antibioticos.json` e rode `npm run seed` na pasta `server`.
O conteúdo inicial é um **exemplo e precisa ser revisado** por especialista (RNF04) antes de testes com alunos.

## Próximos passos (TODO)

- [ ] Painel do professor (turmas, `classStats`)
- [ ] Somar pontos das partidas multiplayer ao XP (`sockets/match.js`)
- [ ] Service worker e ícones do PWA (ex.: `vite-plugin-pwa`)
- [ ] Mais módulos de jogo: associação de estruturas, simulação de diagnóstico
- [ ] Testes automatizados e questionário SUS
- [ ] Guardar rodadas do quiz em Redis ou banco, em vez de memória
