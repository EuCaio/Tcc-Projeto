import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.js';
import { setupSockets } from './sockets/index.js';

const app = express();
app.use(cors({ origin: env.clientUrl }));
app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: env.clientUrl } });
setupSockets(io);

server.listen(env.port, () => console.log(`API em http://localhost:${env.port}`));
