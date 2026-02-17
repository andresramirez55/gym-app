-- Add duration_weeks to routines table
ALTER TABLE routines ADD COLUMN IF NOT EXISTS duration_weeks INTEGER NOT NULL DEFAULT 3;

-- Second template: gain_muscle 5-day (Push/Pull/Legs/Upper/Lower split)
INSERT INTO routine_templates (name, description, goal, frequency) VALUES
('Rutina Push/Pull/Legs 5 Días', 'Rutina dividida en empuje, tirón y piernas para maximizar la frecuencia y recuperación muscular', 'gain_muscle', 5);

DO $$
DECLARE
  tmpl_id BIGINT;
  day1_id BIGINT;
  day2_id BIGINT;
  day3_id BIGINT;
  day4_id BIGINT;
  day5_id BIGINT;
BEGIN
  SELECT id INTO tmpl_id FROM routine_templates WHERE name = 'Rutina Push/Pull/Legs 5 Días';

  -- Day 1: Push (Pecho, Hombros, Tríceps)
  INSERT INTO routine_template_days (template_id, day_number, day_name) VALUES (tmpl_id, 1, 'Push - Pecho, Hombros y Tríceps') RETURNING id INTO day1_id;
  INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
    (day1_id, 'Press de Banca con Barra', 4, 8, 120, 1, 'Baje la barra hasta el pecho con control'),
    (day1_id, 'Press Inclinado con Mancuernas', 3, 10, 90, 2, NULL),
    (day1_id, 'Press Militar con Barra', 4, 8, 120, 3, 'De pie o sentado'),
    (day1_id, 'Elevaciones Laterales', 3, 15, 60, 4, 'Peso ligero, forma perfecta'),
    (day1_id, 'Fondos en Paralelas', 3, 12, 90, 5, 'Inclinación al frente para pecho'),
    (day1_id, 'Press Francés', 3, 12, 60, 6, NULL);

  -- Day 2: Pull (Espalda, Bíceps)
  INSERT INTO routine_template_days (template_id, day_number, day_name) VALUES (tmpl_id, 2, 'Pull - Espalda y Bíceps') RETURNING id INTO day2_id;
  INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
    (day2_id, 'Dominadas', 4, 8, 120, 1, 'Agarre prono, amplitud completa'),
    (day2_id, 'Remo con Barra', 4, 8, 120, 2, 'Espalda recta, codos hacia atrás'),
    (day2_id, 'Jalón al Pecho', 3, 12, 90, 3, NULL),
    (day2_id, 'Remo con Mancuerna', 3, 12, 60, 4, 'Un brazo a la vez'),
    (day2_id, 'Curl de Bíceps con Barra', 3, 12, 60, 5, NULL),
    (day2_id, 'Curl Martillo', 3, 12, 60, 6, NULL);

  -- Day 3: Legs (Piernas)
  INSERT INTO routine_template_days (template_id, day_number, day_name) VALUES (tmpl_id, 3, 'Legs - Piernas Completas') RETURNING id INTO day3_id;
  INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
    (day3_id, 'Sentadilla con Barra', 4, 8, 180, 1, 'Rey de los ejercicios - profundidad completa'),
    (day3_id, 'Prensa de Piernas', 3, 12, 120, 2, NULL),
    (day3_id, 'Extensiones de Cuádriceps', 3, 15, 60, 3, NULL),
    (day3_id, 'Curl de Isquiotibiales', 3, 15, 60, 4, NULL),
    (day3_id, 'Peso Muerto Rumano', 3, 10, 120, 5, 'Énfasis en isquiotibiales'),
    (day3_id, 'Elevación de Pantorrillas', 4, 20, 45, 6, NULL);

  -- Day 4: Upper (Torso)
  INSERT INTO routine_template_days (template_id, day_number, day_name) VALUES (tmpl_id, 4, 'Upper - Torso Completo') RETURNING id INTO day4_id;
  INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
    (day4_id, 'Press de Banca con Mancuernas', 4, 10, 90, 1, NULL),
    (day4_id, 'Remo en Polea Baja', 3, 12, 90, 2, NULL),
    (day4_id, 'Press Arnold', 3, 12, 90, 3, 'Hombros completos'),
    (day4_id, 'Aperturas con Mancuernas', 3, 15, 60, 4, NULL),
    (day4_id, 'Face Pulls', 3, 15, 60, 5, 'Manguito rotador y trapecios'),
    (day4_id, 'Curl de Concentración', 3, 12, 60, 6, NULL);

  -- Day 5: Lower (Pierna posterior y glúteos)
  INSERT INTO routine_template_days (template_id, day_number, day_name) VALUES (tmpl_id, 5, 'Lower - Cadena Posterior') RETURNING id INTO day5_id;
  INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
    (day5_id, 'Peso Muerto Convencional', 4, 6, 180, 1, 'Movimiento rey de fuerza - técnica es clave'),
    (day5_id, 'Hip Thrust con Barra', 4, 12, 90, 2, 'Glúteos'),
    (day5_id, 'Zancadas con Mancuernas', 3, 10, 90, 3, '10 cada pierna'),
    (day5_id, 'Curl Nórdico', 3, 8, 90, 4, 'Isquiotibiales - muy difícil'),
    (day5_id, 'Abducción de Cadera en Máquina', 3, 15, 60, 5, NULL),
    (day5_id, 'Plancha', 3, 60, 60, 6, '60 segundos');
END $$;

-- Second template: gain_muscle 3-day (Full Body)
INSERT INTO routine_templates (name, description, goal, frequency) VALUES
('Rutina Full Body 3 Días', 'Entrenamiento de cuerpo completo 3 días por semana para maximizar frecuencia de estímulo', 'gain_muscle', 3);

DO $$
DECLARE
  tmpl_id BIGINT;
  day1_id BIGINT;
  day2_id BIGINT;
  day3_id BIGINT;
BEGIN
  SELECT id INTO tmpl_id FROM routine_templates WHERE name = 'Rutina Full Body 3 Días';

  -- Day 1: Full Body A
  INSERT INTO routine_template_days (template_id, day_number, day_name) VALUES (tmpl_id, 1, 'Full Body A') RETURNING id INTO day1_id;
  INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
    (day1_id, 'Sentadilla', 3, 8, 120, 1, 'Peso corporal o con barra'),
    (day1_id, 'Press de Banca', 3, 8, 90, 2, NULL),
    (day1_id, 'Remo con Barra', 3, 8, 90, 3, NULL),
    (day1_id, 'Press Militar', 3, 10, 90, 4, NULL),
    (day1_id, 'Curl de Bíceps', 2, 12, 60, 5, NULL),
    (day1_id, 'Fondos de Tríceps', 2, 12, 60, 6, NULL);

  -- Day 2: Full Body B
  INSERT INTO routine_template_days (template_id, day_number, day_name) VALUES (tmpl_id, 2, 'Full Body B') RETURNING id INTO day2_id;
  INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
    (day2_id, 'Peso Muerto', 3, 6, 180, 1, 'Técnica perfecta'),
    (day2_id, 'Press Inclinado', 3, 10, 90, 2, NULL),
    (day2_id, 'Dominadas o Jalón', 3, 10, 90, 3, NULL),
    (day2_id, 'Elevaciones Laterales', 3, 15, 60, 4, NULL),
    (day2_id, 'Curl Martillo', 2, 12, 60, 5, NULL),
    (day2_id, 'Extensión de Tríceps', 2, 12, 60, 6, NULL);

  -- Day 3: Full Body C
  INSERT INTO routine_template_days (template_id, day_number, day_name) VALUES (tmpl_id, 3, 'Full Body C') RETURNING id INTO day3_id;
  INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
    (day3_id, 'Prensa de Piernas', 3, 12, 90, 1, NULL),
    (day3_id, 'Aperturas con Mancuernas', 3, 12, 60, 2, NULL),
    (day3_id, 'Remo en Polea', 3, 12, 60, 3, NULL),
    (day3_id, 'Arnold Press', 3, 12, 90, 4, NULL),
    (day3_id, 'Curl de Concentración', 2, 15, 45, 5, NULL),
    (day3_id, 'Press Francés', 2, 15, 45, 6, NULL);
END $$;
