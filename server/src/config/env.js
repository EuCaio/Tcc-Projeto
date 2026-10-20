import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL || 'postgres://bq:bq@localhost:5432/bacterioquest',
  jwtSecret: process.env.JWT_SECRET || 'troque-este-segredo',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
