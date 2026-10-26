-- Rodadas do quiz solo guardadas no banco (antes ficavam na memória do servidor).
-- Assim, reiniciar o servidor ou rodar mais de uma instância não derruba rodadas em andamento.
CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  questoes JSONB NOT NULL,                 -- inclui o gabarito; nunca é enviado ao cliente
  respondidas JSONB NOT NULL DEFAULT '[]', -- índices já respondidos
  acertos INT NOT NULL DEFAULT 0,
  sequencia INT NOT NULL DEFAULT 0,
  max_sequencia INT NOT NULL DEFAULT 0,
  criada_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rounds_criada ON rounds(criada_em);
