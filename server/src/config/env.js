import 'dotenv/config';

const SEGREDO_PADRAO = 'troque-este-segredo';

export const env = {
  production: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL || 'postgres://bq:bq@localhost:5432/bacterioquest',
  jwtSecret: process.env.JWT_SECRET || SEGREDO_PADRAO,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  dbPoolMax: Number(process.env.DB_POOL_MAX) || 5,
};

// Em produção, recusar-se a iniciar com segredo fraco: quem souber o padrão consegue forjar logins.
if (env.production && (env.jwtSecret === SEGREDO_PADRAO || env.jwtSecret.length < 16)) {
  throw new Error('Defina JWT_SECRET com pelo menos 16 caracteres antes de rodar em produção.');
}
