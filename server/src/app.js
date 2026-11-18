import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.js';
import { seguranca } from './middlewares/security.js';
import { setupSockets } from './sockets/index.js';

const app = express();
app.set('trust proxy', 1); // atrás do proxy da hospedagem, para o limitador enxergar o IP real
app.use(seguranca);
app.use(cors({ origin: env.clientUrl }));
app.use(express.json({ limit: '100kb' }));
app.use('/api', routes);
app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));

// Em produção o mesmo servidor entrega o frontend compilado (client/dist): uma só origem, sem CORS.
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (fs.existsSync(path.join(dist, 'index.html'))) {
  app.use('/assets', express.static(path.join(dist, 'assets'), { immutable: true, maxAge: '1y' }));
  app.use(express.static(dist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/socket.io')) return next();
    res.sendFile(path.join(dist, 'index.html')); // rotas do React Router (/quiz, /perfil...)
  });
}

app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: env.clientUrl } });
setupSockets(io);

server.listen(env.port, () => console.log(`API em http://localhost:${env.port}`));
