-- Migración 006: Templates para frecuencia de 2 días por semana
-- Cubre los 4 goals: gain_muscle, lose_weight, strength, endurance

-- ============================================================
-- 1. GAIN MUSCLE - 2 DÍAS (Full Body intenso)
-- ============================================================
DO $$
DECLARE tmpl_id INTEGER; d1 INTEGER; d2 INTEGER;
BEGIN

INSERT INTO routine_templates (name, description, goal, frequency)
VALUES (
    'Full Body Hipertrofia 2 Días',
    'Entrenamiento de cuerpo completo 2 veces por semana para quienes tienen poco tiempo pero quieren ganar masa muscular. Máximo volumen por sesión con los ejercicios más efectivos. Ideal para principiantes o personas con agenda ajustada.',
    'gain_muscle', 2
) RETURNING id INTO tmpl_id;

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 1, 'Día 1: Full Body A — Empuje + Piernas') RETURNING id INTO d1;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d1, 'Sentadilla con barra',             4, 8,  150, 1, 'El movimiento más completo. Profundidad completa, espalda recta. Base del día.'),
(d1, 'Press banca con barra',            4, 8,  120, 2, 'Empuje horizontal. Retracción escapular, arco natural, pies en el piso.'),
(d1, 'Press militar con mancuernas',     3, 10,  90, 3, 'Hombros. Rango completo, baja hasta el nivel de los oídos.'),
(d1, 'Peso muerto rumano',               3, 10, 120, 4, 'Cadena posterior. Isquiotibiales y glúteos con tensión constante.'),
(d1, 'Extensión tríceps en polea',        3, 12,  60, 5, 'Tríceps. Codos fijos, extensión completa.'),
(d1, 'Elevaciones de pantorrilla',        3, 20,  45, 6, 'Rango completo, 2 segundos arriba.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 2, 'Día 2: Full Body B — Tirón + Piernas') RETURNING id INTO d2;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d2, 'Peso muerto convencional',          4, 6,  180, 1, 'Movimiento rey de cadena posterior. Espalda neutral, empujá el piso.'),
(d2, 'Dominadas o jalón al pecho',        4, 8,  120, 2, 'Tirón vertical. Tira con los codos hacia abajo, escápulas juntas al final.'),
(d2, 'Remo con barra',                    3, 10, 120, 3, 'Tirón horizontal. Espalda recta, codos cerca del cuerpo.'),
(d2, 'Hip thrust con barra',              3, 12,  90, 4, 'Glúteos. Aprieta arriba, no hiperextiendas la lumbar.'),
(d2, 'Curl de bíceps con barra',          3, 12,  60, 5, 'Sin balanceo. Contracción completa arriba.'),
(d2, 'Plancha frontal',                   3, 45,  45, 6, 'Core estabilizador. Cuerpo recto, no bajes las caderas. En segundos.');

END $$;

-- ============================================================
-- 2. LOSE WEIGHT - 2 DÍAS (Full Body metabólico)
-- ============================================================
DO $$
DECLARE tmpl_id INTEGER; d1 INTEGER; d2 INTEGER;
BEGIN

INSERT INTO routine_templates (name, description, goal, frequency)
VALUES (
    'Full Body Definición 2 Días',
    'Dos sesiones semanales de alta intensidad para quemar grasa y tonificar. Circuitos metabólicos que maximizan la quema calórica en poco tiempo. Combinación de fuerza y cardio para resultados visibles preservando el músculo.',
    'lose_weight', 2
) RETURNING id INTO tmpl_id;

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 1, 'Día 1: Circuito Metabólico A') RETURNING id INTO d1;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d1, 'Sentadilla con salto',             5, 12,  45, 1, 'Explosivo. Aterrizás suave con rodillas flexionadas. Activa todo el cuerpo.'),
(d1, 'Press banca con barra',            4, 10,  75, 2, 'Peso moderado. Mantené el ritmo del circuito.'),
(d1, 'Peso muerto con barra',            4, 10,  90, 3, 'Base de cadena posterior. Técnica perfecta aunque sea circuito.'),
(d1, 'Burpees',                          4, 10,  45, 4, 'Máxima intensidad. El ejercicio que más calorías quema.'),
(d1, 'Remo en polea baja',               3, 12,  60, 5, 'Espalda y bíceps. Rango completo.'),
(d1, 'Mountain climbers',                4, 30,  30, 6, '15 cada pierna. Core y cardio combinados.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 2, 'Día 2: HIIT Full Body B') RETURNING id INTO d2;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d2, 'Kettlebell swings',                5, 15,  30, 1, 'Potencia de cadera. 15 reps sin parar por serie.'),
(d2, 'Zancadas con mancuernas',          4, 12,  45, 2, '6 cada pierna alternadas. Torso recto.'),
(d2, 'Flexiones de brazos',              4, 15,  30, 3, 'Cuerpo recto. Baja el pecho hasta el suelo.'),
(d2, 'Sentadilla goblet',                4, 15,  45, 4, 'Mancuerna al pecho. Rodillas afuera, espalda erguida.'),
(d2, 'Saltos en estrella',               4, 30,  20, 5, 'Cardio activo. 30 jumping jacks entre series.'),
(d2, 'Plancha lateral',                  3, 30,  30, 6, 'Cada lado. Core lateral. En segundos por lado.');

END $$;

-- ============================================================
-- 3. STRENGTH - 2 DÍAS (Fuerza mínima efectiva)
-- ============================================================
DO $$
DECLARE tmpl_id INTEGER; d1 INTEGER; d2 INTEGER;
BEGIN

INSERT INTO routine_templates (name, description, goal, frequency)
VALUES (
    'Fuerza Mínima Efectiva 2 Días',
    'Programa de fuerza basado en los levantamientos fundamentales con solo 2 sesiones semanales. Ideal para quienes tienen poco tiempo pero quieren ganar fuerza real. Progresión lineal de carga en sentadilla, press banca y peso muerto.',
    'strength', 2
) RETURNING id INTO tmpl_id;

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 1, 'Día 1: Sentadilla + Press Banca') RETURNING id INTO d1;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d1, 'Sentadilla con barra',             5, 5,  240, 1, 'Movimiento principal. Progresión +2.5kg por semana. Técnica perfecta siempre.'),
(d1, 'Press banca con barra',            5, 5,  240, 2, 'Segundo movimiento principal. Misma progresión semanal.'),
(d1, 'Remo con barra',                   3, 8,  180, 3, 'Accesorio de espalda. Complementa el press banca.'),
(d1, 'Peso muerto rumano',               3, 8,  150, 4, 'Cadena posterior. Isquiotibiales fuertes para la sentadilla.'),
(d1, 'Face pulls',                       3, 15,  60, 5, 'Salud del hombro. Obligatorio en toda rutina de fuerza.'),
(d1, 'Plancha frontal',                  3, 45,  60, 6, 'Core para la sentadilla. En segundos.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 2, 'Día 2: Peso Muerto + Press Militar') RETURNING id INTO d2;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d2, 'Peso muerto convencional',          5, 3,  300, 1, 'Movimiento rey. 3 reps pesadas. +5kg por semana. Espalda neutral siempre.'),
(d2, 'Press militar con barra',           4, 5,  180, 2, 'Hombros y core. Progresión +2.5kg/semana. Glúteos apretados.'),
(d2, 'Dominadas lastradas o jalón',       4, 5,  180, 3, 'Tirón vertical pesado. Complementa el press militar.'),
(d2, 'Sentadilla frontal',                3, 5,  180, 4, 'Accesorio para postura en el peso muerto. Cuádriceps.'),
(d2, 'Extensión tríceps barra EZ',        3, 10,  90, 5, 'Tríceps fuerte para el press. Codos fijos.'),
(d2, 'Curl de bíceps con barra',          3, 10,  90, 6, 'Balance empuje/tirón. Protege los codos.');

END $$;

-- ============================================================
-- 4. ENDURANCE - 2 DÍAS (Resistencia básica)
-- ============================================================
DO $$
DECLARE tmpl_id INTEGER; d1 INTEGER; d2 INTEGER;
BEGIN

INSERT INTO routine_templates (name, description, goal, frequency)
VALUES (
    'Resistencia Básica 2 Días',
    'Dos sesiones semanales de entrenamiento funcional para mejorar la resistencia cardiovascular y muscular. Circuitos de alta repetición con descansos cortos. Ideal para personas que recién empiezan a trabajar su resistencia.',
    'endurance', 2
) RETURNING id INTO tmpl_id;

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 1, 'Día 1: Circuito Resistencia Inferior + Core') RETURNING id INTO d1;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d1, 'Sentadilla con peso corporal',     5, 20,  30, 1, '20 reps. Sin parar. Profundidad completa. Ritmo constante.'),
(d1, 'Zancadas alternadas',              4, 24,  30, 2, '12 cada pierna. Torso recto, paso largo.'),
(d1, 'Saltos en estrella',               5, 30,  20, 3, '30 jumping jacks. Cardio activo.'),
(d1, 'Sentadilla sumo',                  4, 20,  30, 4, 'Pies abiertos. Profundidad completa.'),
(d1, 'Mountain climbers',                4, 30,  30, 5, '15 cada pierna alternadas. Core firme.'),
(d1, 'Plancha frontal',                  4, 60,  20, 6, '60 segundos. Core resistencia. En segundos.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 2, 'Día 2: Circuito Resistencia Superior + HIIT') RETURNING id INTO d2;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d2, 'Flexiones de brazos',              5, 20,  30, 1, '20 reps. Cuerpo recto. Si es fácil, elevá los pies.'),
(d2, 'Remo en polea baja',               4, 15,  30, 2, 'Peso liviano, ritmo alto. 15 reps contínuas.'),
(d2, 'Burpees',                          5, 10,  45, 3, 'El rey de la resistencia total. 10 reps máxima velocidad.'),
(d2, 'Press militar mancuernas',         4, 15,  30, 4, 'Liviano. Hombros activos en todo el rango.'),
(d2, 'Escaladores',                      4, 30,  20, 5, '15 cada pierna. Core y cardio. Ritmo alto.'),
(d2, 'AMRAP 5 min: Burpee + Flexión + Sentadilla', 1, 99, 0, 6, '5 minutos. Anotá cuántas rondas completás. Meta: superarlo cada semana.');

END $$;
