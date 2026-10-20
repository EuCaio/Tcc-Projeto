import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../config/db.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

for (const f of files) {
  await pool.query(fs.readFileSync(path.join(dir, f), 'utf8'));
  console.log('migration aplicada:', f);
}
await pool.end();
