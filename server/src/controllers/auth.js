// Cadastro e login
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { signToken } from '../middlewares/auth.js';
import { nivelPorXp } from '../services/progressService.js';
import { httpError as fail } from '../middlewares/error.js';

const publico = (u) => ({ id: u.id, nome: u.nome, email: u.email, papel: u.papel, xp: u.xp, nivel: nivelPorXp(u.xp) });

export async function register(req, res) {
  const { nome, email, senha, papel = 'aluno' } = req.body;
  if (!nome || !email || !senha || senha.length < 6) throw fail(400, 'Informe nome, e-mail e senha (mínimo 6 caracteres)');
  if (!['aluno', 'professor', 'outro'].includes(papel)) throw fail(400, 'Papel inválido');
  const hash = await bcrypt.hash(senha, 10);
  try {
    const { rows } = await query(
      'INSERT INTO users (nome, email, senha_hash, papel) VALUES ($1,$2,$3,$4) RETURNING *',
      [nome, email.toLowerCase(), hash, papel]
    );
    res.status(201).json({ token: signToken(rows[0]), usuario: publico(rows[0]) });
  } catch (e) {
    if (e.code === '23505') throw fail(409, 'E-mail já cadastrado');
    throw e;
  }
}

export async function login(req, res) {
  const { email, senha } = req.body;
  const { rows } = await query('SELECT * FROM users WHERE email=$1', [(email || '').toLowerCase()]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(senha || '', u.senha_hash))) throw fail(401, 'E-mail ou senha incorretos');
  res.json({ token: signToken(u), usuario: publico(u) });
}

export async function me(req, res) {
  const { rows } = await query('SELECT * FROM users WHERE id=$1', [req.user.id]);
  if (!rows[0]) throw fail(404, 'Usuário não encontrado');
  res.json(publico(rows[0]));
}
