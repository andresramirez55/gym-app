-- Push token por usuario (para notificaciones push via Expo)
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Sugerencias de rutina generadas por Claude al completar un ciclo.
-- Quedan en 'pending' hasta que el usuario las aplica o las descarta desde la app.
CREATE TABLE IF NOT EXISTS routine_suggestions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    routine_id BIGINT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL,
    suggested_routine JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_routine_suggestions_user_id ON routine_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_routine_suggestions_status ON routine_suggestions(status);
