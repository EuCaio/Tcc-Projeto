import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signToken = (u) =>
  jwt.sign({ id: u.id, nome: u.nome, papel: u.papel }, env.jwtSecret, { expiresIn: '7d' });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

export function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ erro: 'Não autenticado' });
  }
}

export const requireRole = (papel) => (req, res, next) =>
  req.user?.papel === papel ? next() : res.status(403).json({ erro: 'Acesso negado' });
