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

## Teste de fumaça

Com o servidor rodando, execute em outro terminal:

```bash
cd server
npm run smoke
```

O script cria dois usuários e percorre cadastro, login, enciclopédia, uma rodada solo, desempenho e uma
partida multiplayer completa (23 verificações). Para acelerar a partida multiplayer nos testes, inicie o
servidor com `MATCH_PAUSA_MS=300`. Para testar através do frontend: `API=http://localhost:5173 npm run smoke`.

## Testes automatizados

```bash
cd server
npm run migrate   # aplica também a migration 002 (rodadas)
npm test
```

Não precisam do servidor rodando. Cobrem o gerador de questões, a pontuação, o desbloqueio por nível,
a **validação dos JSONs de `content/`** (útil ao ampliar o conteúdo) e as rodadas no banco.
Os testes de banco são ignorados automaticamente se o PostgreSQL não estiver disponível.

## Conteúdo didático

Hoje são **30 bactérias** e **17 antibióticos**, em 4 níveis de desbloqueio. Para alterar, edite
`content/bacterias.json` e `content/antibioticos.json` e rode, na pasta `server`:

```bash
npm test           # valida os JSONs (campos, níveis, antibióticos que não existem no catálogo...)
npm run seed       # grava no banco
```

Campos de cada bactéria: `nome`, `gram`, `morfologia`, `doenca`, `antibiotico` (o principal, que é a resposta
da questão), `outros_antibioticos` (também corretos; nunca aparecem como alternativa errada), `curiosidade` e `nivel`.
Mecanismos de ação iguais devem ter exatamente o mesmo texto em `antibioticos.json`.


## Status das sprints

- [x] **Sprint 0:** esqueleto validado contra PostgreSQL real (migrate, seed, API, multiplayer e proxy do frontend)
- [ ] **Sprint 1** (em andamento)
  - [x] Testes automatizados (gerador, pontuação, desbloqueio, conteúdo, rodadas)
  - [x] Rodadas do quiz guardadas no banco (`rounds`), com limpeza de rodadas abandonadas
  - [x] Conteúdo ampliado para 30 bactérias e 17 antibióticos
  - [ ] Deploy

## Trabalhando em dupla (Git)

```bash
git init && git add . && git commit -m "Esqueleto inicial"
# crie o repositório no GitHub e conecte:
git remote add origin <url> && git push -u origin main
```

Sugestão de divisão: uma pessoa em `client/`, outra em `server/` e `content/`. Use branches por funcionalidade.

## Próximos passos (TODO)

- [ ] Painel do professor (turmas, `classStats`)
- [ ] Somar pontos das partidas multiplayer ao XP (`sockets/match.js`)
- [ ] Service worker e ícones do PWA (ex.: `vite-plugin-pwa`)
- [ ] Mais módulos de jogo: associação de estruturas, simulação de diagnóstico
- [ ] Testes automatizados e questionário SUS
- [ ] Tempo do quiz solo é informado pelo cliente (limitado a 0–15 s); medir no servidor se o ranking virar competitivo
