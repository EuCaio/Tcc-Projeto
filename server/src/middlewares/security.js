import helmet from 'helmet';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';

export const seguranca = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'ws:', 'wss:'],
      objectSrc: ["'none'"],
    },
  },
});

const aoExceder = (req, res) => res.status(429).json({ erro: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' });

// Só tentativas que FALHAM contam, e por IP + e-mail: uma turma inteira usando a mesma rede da
// faculdade não bloqueia uns aos outros, mas adivinhar a senha de uma conta fica inviável.
export const limitarLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `${ipKeyGenerator(req.ip)}|${String(req.body?.email || '').toLowerCase()}`,
  handler: aoExceder,
});

// Cadastros: generoso o bastante para uma turma criar contas ao mesmo tempo.
export const limitarCadastro = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 100,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  handler: aoExceder,
});
