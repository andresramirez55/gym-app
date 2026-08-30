-- Add RIR (Reps in Reserve) tracking per set
-- Nullable: los sets ya cargados quedan sin RIR, y loguear sigue funcionando sin especificarlo.
ALTER TABLE set_logs ADD COLUMN IF NOT EXISTS rir SMALLINT;
