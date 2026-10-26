-- Antibióticos que também são corretos para a infecção (além do principal).
-- O gerador de questões não os usa como alternativas erradas.
ALTER TABLE bacteria ADD COLUMN IF NOT EXISTS outros_antibioticos TEXT[] NOT NULL DEFAULT '{}';
