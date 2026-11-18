# Publicação (deploy)

Combinação escolhida: **Render** (hospeda o app) + **Neon** (banco PostgreSQL). Os dois têm plano gratuito e não pedem cartão
(valores e limites conferidos em outubro de 2026; confirme nos sites antes de começar, pois mudam com frequência).

> Por que o banco não fica no Render? O Postgres gratuito do Render é apagado **30 dias** após a criação. O do Neon é permanente.

Um único serviço entrega o frontend e a API (mesmo endereço), então não há CORS nem duas publicações para manter.

## Passo a passo

### 1. Banco no Neon
1. Crie uma conta em neon.com e um projeto (ex.: `bacterioquest`). Escolha a região mais próxima de vocês.
2. Na tela do projeto, abra **Connect** e copie a *connection string*. Use a conexão **direta** (desmarque "Pooled connection").
   Ela é parecida com `postgresql://usuario:senha@ep-xxxx.neon.tech/neondb?sslmode=require`. Guarde: é uma senha.

### 2. Código no GitHub
```bash
git add . && git commit -m "Preparar deploy"
git remote add origin <url-do-repositorio>   # se ainda não tiver
git push -u origin main
```
O repositório pode ser privado. O arquivo `.env` nunca vai para o Git (está no `.gitignore`).

### 3. Serviço no Render
1. Crie conta em render.com e conecte o GitHub.
2. **New → Blueprint** e escolha o repositório. O Render lê o `render.yaml` sozinho.
3. Quando pedir `DATABASE_URL`, cole a string do Neon. O `JWT_SECRET` é gerado automaticamente.
4. Confirme que o plano exibido é **Free** e clique em **Apply**. O primeiro build leva alguns minutos.

### 4. Conferir
- `https://<nome-do-servico>.onrender.com/api/health` deve responder `{"ok":true}`.
- Abra o endereço, crie uma conta e jogue uma rodada.
- Em **Logs** do Render devem aparecer `migration aplicada`, `seed concluído` e `API em http://localhost:...`.

### 5. Atualizar depois
Um `git push` na branch principal faz o Render publicar de novo (comportamento padrão). Alterações em `content/*.json`
entram junto: o conteúdo é regravado no banco a cada inicialização.

## Variáveis de ambiente

| Variável | Onde | Observação |
|---|---|---|
| `NODE_ENV` | `render.yaml` | `production`. O servidor **recusa iniciar** sem `JWT_SECRET` de 16+ caracteres. |
| `JWT_SECRET` | gerada pelo Render | Trocá-la desconecta todos os usuários. |
| `DATABASE_URL` | você cola no Render | String do Neon com `?sslmode=require`. |
| `PORT` | o Render define | Não precisa configurar. |
| `DB_POOL_MAX` | opcional | Conexões simultâneas com o banco (padrão 5). |

## Cuidados com o plano gratuito

- **O app dorme após 15 minutos sem acesso** e leva cerca de 1 minuto para acordar. Antes de uma sessão de teste com alunos,
  abra o endereço uns 2 minutos antes. O Neon também hiberna, então a primeira consulta depois de um tempo parado é mais lenta.
- **Salas do multiplayer ficam na memória.** Se o serviço reiniciar ou dormir, as salas ativas se perdem.
- **Limites do Neon gratuito:** 0,5 GB e 100 horas de computação por mês; ao estourar, o banco é suspenso até o mês seguinte.
  É muito mais do que o app usa agora, mas acompanhem durante a fase de testes.
- **Não contem com backup automático.** Os dados da validação (respostas, desempenho) são o coração do TCC. Façam cópias:
  ```bash
  pg_dump "<DATABASE_URL>" > backup-$(date +%F).sql
  ```
- **Dados dos participantes:** o app guarda nome e e-mail. Combinem com o orientador o termo de consentimento e o que for
  exigido (LGPD, comitê de ética) antes de aplicar com alunos.
- Quem errar a senha 10 vezes seguidas na mesma conta fica bloqueado por 15 minutos. Tentativas certas não contam, e uma turma
  na mesma rede não se bloqueia mutuamente.

## Rodar a imagem de produção na sua máquina (opcional, precisa do Docker)
```bash
docker build -t bacterioquest .
docker run --rm -p 4000:4000 -e PORT=4000 -e NODE_ENV=production \
  -e JWT_SECRET=um-segredo-longo-qualquer \
  -e DATABASE_URL=postgres://bq:bq@host.docker.internal:5432/bacterioquest bacterioquest
```
Abra http://localhost:4000.

## Se algo der errado

| Sintoma | Causa provável |
|---|---|
| Deploy falha com "Defina JWT_SECRET" | `JWT_SECRET` ausente ou com menos de 16 caracteres. |
| Erro de conexão / `ECONNREFUSED` | `DATABASE_URL` vazia ou copiada errada. |
| Erro de SSL ao conectar | Faltou `?sslmode=require` no fim da string. |
| Primeira abertura demora ou dá timeout | O serviço estava dormindo; aguarde cerca de 1 minuto e recarregue. |
| Cobrança inesperada no Render | O serviço foi criado fora do plano **Free**; confira em Settings → Instance Type. |

## Outras hospedagens
O `Dockerfile` funciona em qualquer lugar que rode contêiner e tenha um PostgreSQL (Railway, Fly.io, um VPS com Docker).
Os passos mudam, mas as variáveis são as mesmas.
