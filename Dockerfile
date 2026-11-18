# ---- 1) Compila o frontend (React + Vite)
FROM node:20-alpine AS client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---- 2) Imagem final: servidor + frontend compilado + conteúdo didático
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./
COPY content/ /app/content/
COPY --from=client /app/client/dist /app/client/dist
USER node
# Aplica migrations, carrega o conteúdo (idempotente) e inicia. A porta vem da variável PORT.
CMD ["npm", "run", "start:prod"]
