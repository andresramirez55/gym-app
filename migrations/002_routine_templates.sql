-- Tabla para templates de rutinas predefinidas
CREATE TABLE IF NOT EXISTS routine_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    goal VARCHAR(50) NOT NULL,  -- gain_muscle, lose_weight, strength, endurance
    frequency INTEGER NOT NULL,  -- 3, 4, or 5
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routine_template_days (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES routine_templates(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    day_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routine_template_exercises (
    id SERIAL PRIMARY KEY,
    template_day_id INTEGER REFERENCES routine_template_days(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    rest_seconds INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar rutinas template para GANAR MÚSCULO (Hipertrofia)

-- Template 1: Hipertrofia 5 días
INSERT INTO routine_templates (name, description, goal, frequency)
VALUES (
    'Rutina de Hipertrofia 5 Días',
    'Rutina diseñada para maximizar la ganancia muscular con 5 días de entrenamiento por semana, enfocada en volumen e intensidad moderada-alta',
    'gain_muscle',
    5
);

-- Día 1: Pecho y Tríceps
INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (1, 1, 'Día 1 - Pecho y Tríceps');

INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes)
VALUES
    (1, 'Press Banca', 4, 10, 90, 1, 'Baja la barra hasta tocar el pecho, controlado'),
    (1, 'Press Inclinado con Mancuernas', 3, 12, 60, 2, 'Inclinación de 30-45 grados'),
    (1, 'Aperturas con Mancuernas', 3, 15, 60, 3, 'Estira bien el pecho en la fase excéntrica'),
    (1, 'Fondos en Paralelas', 3, 12, 60, 4, 'Inclínate hacia adelante para enfatizar pecho'),
    (1, 'Press Francés', 3, 12, 60, 5, 'Mantén codos fijos'),
    (1, 'Extensiones de Tríceps en Polea', 3, 15, 45, 6, 'Aprieta al final del movimiento');

-- Día 2: Espalda y Bíceps
INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (1, 2, 'Día 2 - Espalda y Bíceps');

INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes)
VALUES
    (2, 'Dominadas', 4, 10, 90, 1, 'Si no puedes hacerlas, usa banda elástica'),
    (2, 'Remo con Barra', 4, 10, 90, 2, 'Mantén espalda recta, lleva codos hacia atrás'),
    (2, 'Jalón al Pecho', 3, 12, 60, 3, 'Agarre ancho, tira hacia el pecho alto'),
    (2, 'Remo con Mancuerna', 3, 12, 60, 4, 'Alterna brazos o hazlo unilateral'),
    (2, 'Curl con Barra', 3, 12, 60, 5, 'No balancees el cuerpo'),
    (2, 'Curl Martillo', 3, 15, 45, 6, 'Agarre neutro');

-- Día 3: Piernas
INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (1, 3, 'Día 3 - Piernas');

INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes)
VALUES
    (3, 'Sentadillas', 4, 10, 120, 1, 'Baja hasta romper paralelo, rodillas alineadas con pies'),
    (3, 'Prensa de Piernas', 4, 12, 90, 2, 'Baja controlado, sube explosivo'),
    (3, 'Peso Muerto Rumano', 3, 12, 90, 3, 'Mantén barra cerca de las piernas'),
    (3, 'Extensiones de Cuádriceps', 3, 15, 60, 4, 'Aprieta al final del movimiento'),
    (3, 'Curl Femoral', 3, 15, 60, 5, 'Contracción en la parte superior'),
    (3, 'Elevaciones de Gemelos', 4, 20, 45, 6, 'Rango completo de movimiento');

-- Día 4: Hombros y Abdomen
INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (1, 4, 'Día 4 - Hombros y Abdomen');

INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes)
VALUES
    (4, 'Press Militar', 4, 10, 90, 1, 'Barra por delante, core activado'),
    (4, 'Elevaciones Laterales', 4, 12, 60, 2, 'Codos ligeramente flexionados'),
    (4, 'Pájaros', 3, 15, 60, 3, 'Inclinado hacia adelante, hombro posterior'),
    (4, 'Elevaciones Frontales', 3, 12, 60, 4, 'Alterna brazos o simultáneas'),
    (4, 'Plancha Abdominal', 3, 60, 45, 5, 'Segundos, mantén espalda recta'),
    (4, 'Crunches', 3, 20, 45, 6, 'Contrae el abdomen, no jales el cuello');

-- Día 5: Full Body
INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (1, 5, 'Día 5 - Full Body');

INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes)
VALUES
    (5, 'Peso Muerto', 4, 8, 120, 1, 'Ejercicio más importante, técnica perfecta'),
    (5, 'Press Banca', 3, 10, 90, 2, 'Versión más ligera que día 1'),
    (5, 'Sentadillas', 3, 10, 90, 3, 'Volumen moderado'),
    (5, 'Remo con Barra', 3, 10, 90, 4, 'Enfócate en la técnica'),
    (5, 'Press Militar con Mancuernas', 3, 12, 60, 5, 'Mayor rango de movimiento que con barra');

-- Template 2: Hipertrofia 3 días (Para principiantes)
INSERT INTO routine_templates (name, description, goal, frequency)
VALUES (
    'Rutina de Hipertrofia 3 Días - Full Body',
    'Rutina de cuerpo completo 3 veces por semana, ideal para principiantes o personas con poco tiempo',
    'gain_muscle',
    3
);

-- Día 1: Full Body A
INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (2, 1, 'Día 1 - Full Body A');

INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes)
VALUES
    (6, 'Sentadillas', 4, 10, 90, 1, 'Ejercicio principal del día'),
    (6, 'Press Banca', 4, 10, 90, 2, 'Pecho y tríceps'),
    (6, 'Remo con Barra', 3, 12, 60, 3, 'Espalda y bíceps'),
    (6, 'Press Militar', 3, 12, 60, 4, 'Hombros'),
    (6, 'Curl con Barra', 2, 12, 45, 5, 'Aislamiento bíceps'),
    (6, 'Plancha', 3, 45, 30, 6, 'Segundos');

-- Día 2: Full Body B
INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (2, 2, 'Día 2 - Full Body B');

INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes)
VALUES
    (7, 'Peso Muerto', 4, 8, 120, 1, 'Ejercicio principal del día'),
    (7, 'Press Inclinado con Mancuernas', 4, 10, 90, 2, 'Pecho superior'),
    (7, 'Dominadas', 3, 10, 90, 3, 'Espalda'),
    (7, 'Prensa de Piernas', 3, 12, 90, 4, 'Piernas'),
    (7, 'Fondos', 3, 12, 60, 5, 'Tríceps'),
    (7, 'Elevaciones Laterales', 3, 15, 45, 6, 'Hombros');

-- Día 3: Full Body C
INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (2, 3, 'Día 3 - Full Body C');

INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes)
VALUES
    (8, 'Sentadilla Frontal', 4, 10, 90, 1, 'Variante de sentadilla'),
    (8, 'Press Banca Inclinado', 3, 10, 90, 2, 'Pecho'),
    (8, 'Jalón al Pecho', 3, 12, 60, 3, 'Espalda'),
    (8, 'Peso Muerto Rumano', 3, 12, 90, 4, 'Isquiotibiales'),
    (8, 'Press Arnold', 3, 12, 60, 5, 'Hombros'),
    (8, 'Crunches', 3, 20, 30, 6, 'Abdomen');

-- RUTINAS PARA PERDER PESO

INSERT INTO routine_templates (name, description, goal, frequency)
VALUES (
    'Rutina de Definición 5 Días - Alto Volumen',
    'Rutina enfocada en quemar calorías y mantener músculo durante la pérdida de peso',
    'lose_weight',
    5
);

-- Similar estructura pero con más reps y menos descanso...
-- (Puedes agregar más templates según necesites)

COMMIT;
