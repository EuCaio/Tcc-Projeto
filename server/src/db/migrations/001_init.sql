CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  papel TEXT NOT NULL DEFAULT 'aluno' CHECK (papel IN ('aluno','professor','outro')),
  xp INT NOT NULL DEFAULT 0,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS antibiotics (
  id SERIAL PRIMARY KEY,
  nome TEXT UNIQUE NOT NULL,
  classe TEXT,
  mecanismo TEXT NOT NULL,
  nivel_desbloqueio INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS bacteria (
  id SERIAL PRIMARY KEY,
  nome TEXT UNIQUE NOT NULL,
  gram TEXT NOT NULL,
  morfologia TEXT NOT NULL,
  doenca TEXT NOT NULL,
  antibiotic_id INT REFERENCES antibiotics(id),
  curiosidade TEXT,
  nivel_desbloqueio INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  modo TEXT NOT NULL CHECK (modo IN ('solo','1v1','sala')),
  codigo_sala TEXT,
  criada_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  finalizada_em TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS match_players (
  match_id INT REFERENCES matches(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  pontos INT NOT NULL DEFAULT 0,
  acertos INT NOT NULL DEFAULT 0,
  PRIMARY KEY (match_id, user_id)
);

-- Base do desempenho: cada resposta fica registrada
CREATE TABLE IF NOT EXISTS answers (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  match_id INT REFERENCES matches(id) ON DELETE SET NULL,
  categoria TEXT NOT NULL,
  bacteria_id INT REFERENCES bacteria(id),
  correta BOOLEAN NOT NULL,
  tempo_ms INT,
  criada_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_answers_user ON answers(user_id);

CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  regra TEXT
);

CREATE TABLE IF NOT EXISTS user_badges (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  badge_id INT REFERENCES badges(id) ON DELETE CASCADE,
  conquistado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);
