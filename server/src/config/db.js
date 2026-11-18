import pg from 'pg';
import { env } from './env.js';

export const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  max: env.dbPoolMax,
  connectionTimeoutMillis: 15000, // bancos serverless (Neon) levam alguns segundos para "acordar"
});

// Bancos serverless derrubam conexões ociosas. Sem este handler, o Node encerraria o
// processo inteiro com um erro não tratado; assim a conexão morta só é descartada do pool.
pool.on('error', (err) => console.error('Conexão ociosa do banco encerrada:', err.message));

export const query = (text, params) => pool.query(text, params);
