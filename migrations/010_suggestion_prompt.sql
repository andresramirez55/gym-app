-- Guarda el prompt generado (texto plano, sin llamar a ninguna API) para que
-- el usuario lo copie y se lo pegue a Claude manualmente. diagnosis queda
-- vacío ('') y suggested_routine queda en '{}' hasta que se pega la respuesta
-- (el código siempre inserta un valor explícito para ambas columnas).
ALTER TABLE routine_suggestions ADD COLUMN IF NOT EXISTS prompt TEXT NOT NULL DEFAULT '';
