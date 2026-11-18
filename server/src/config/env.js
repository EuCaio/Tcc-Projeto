import 'dotenv/config';

const SEGREDO_PADRAO = 'troque-este-segredo';

export const env = {
  production: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 4000,
  databaseUrl: (process.env.DATABASE_URL || '').trim() || 'postgres://bq:bq@localhost:5432/bacterioquest',
  jwtSecret: process.env.JWT_SECRET || SEGREDO_PADRAO,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  dbPoolMax: Number(process.env.DB_POOL_MAX) || 5,
};

// Em produção, recusar-se a iniciar com segredo fraco: quem souber o padrão consegue forjar logins.
if (env.production && (env.jwtSecret === SEGREDO_PADRAO || env.jwtSecret.length < 16)) {
  throw new Error('Defina JWT_SECRET com pelo menos 16 caracteres antes de rodar em produção.');
}

// Em produção não existe banco "padrão": se a variável faltar, o servidor tentaria o próprio contêiner
// e falharia com um ECONNREFUSED enigmático. Melhor parar já, dizendo o que corrigir.
if (env.production) {
  const url = (process.env.DATABASE_URL || '').trim();
  if (!url) {
    throw new Error(
      'DATABASE_URL está vazia. No Render: Environment > DATABASE_URL > cole a connection string do Neon e salve.'
    );
  }
  if (!/^postgres(ql)?:\/\//.test(url)) {
    throw new Error(
      'DATABASE_URL inválida: deve começar com postgresql://  (cole só a URL, sem "psql", sem aspas e sem espaços).'
    );
  }
}
