-- Migración 005: Templates faltantes para cubrir todas las combinaciones
-- Goals: gain_muscle, lose_weight, strength, endurance x Frecuencias: 3, 4, 5 días
-- Nuevas combinaciones: gain_muscle/4, lose_weight/3, lose_weight/4,
--   strength/3, strength/4, strength/5, endurance/3, endurance/4, endurance/5

-- ============================================================
-- 1. GAIN MUSCLE - 4 DÍAS (Upper/Lower Split)
-- ============================================================
DO $$
DECLARE tmpl_id INTEGER; d1 INTEGER; d2 INTEGER; d3 INTEGER; d4 INTEGER;
BEGIN

INSERT INTO routine_templates (name, description, goal, frequency)
VALUES (
    'Upper/Lower 4 Días - Hipertrofia',
    'Clásico split superior/inferior 4 días por semana. Máxima frecuencia por grupo muscular (2x/semana) con volumen moderado. Ideal para ganar masa muscular de forma eficiente.',
    'gain_muscle', 4
) RETURNING id INTO tmpl_id;

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 1, 'Día 1: Tren Superior A') RETURNING id INTO d1;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d1, 'Press banca con barra',      4, 8,  120, 1, 'Movimiento principal de empuje. Baja controlado 3 segundos, explosivo al subir.'),
(d1, 'Remo con barra',             4, 8,  120, 2, 'Espalda recta, codos cerca del cuerpo, aprieta escápulas al final.'),
(d1, 'Press militar con mancuernas',3,10,  90, 3, 'Rango completo, codos ligeramente adelante del hombro.'),
(d1, 'Dominadas o jalón al pecho', 3, 10,  90, 4, 'Agarre pronado ancho. Tira con los codos hacia abajo.'),
(d1, 'Curl de bíceps con barra',   3, 12,  60, 5, 'Sin balanceo, codo fijo. Contracción completa arriba.'),
(d1, 'Extensión tríceps en polea', 3, 12,  60, 6, 'Codos pegados al cuerpo, extiende completamente.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 2, 'Día 2: Tren Inferior A') RETURNING id INTO d2;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d2, 'Sentadilla con barra',        4, 8,  150, 1, 'Profundidad completa, rodillas en la dirección de los pies.'),
(d2, 'Peso muerto rumano',          3, 10, 120, 2, 'Enfocado en isquiotibiales y glúteos. Mantené la tensión.'),
(d2, 'Zancada con mancuernas',      3, 12,  90, 3, 'Paso largo, rodilla trasera cerca del piso.'),
(d2, 'Extensión de cuádriceps',     3, 15,  60, 4, 'Control total, mantené 1 segundo arriba.'),
(d2, 'Curl femoral sentado',        3, 15,  60, 5, 'Rango completo, no rebotas en el punto de máximo estiramiento.'),
(d2, 'Elevaciones de pantorrilla de pie', 4, 20, 45, 6, '2 segundos arriba, 2 segundos abajo.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 3, 'Día 3: Tren Superior B') RETURNING id INTO d3;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d3, 'Press inclinado con mancuernas', 4, 10, 120, 1, 'Banco a 30°. Énfasis en porción clavicular del pectoral.'),
(d3, 'Remo en polea baja',            4, 10, 120, 2, 'Asiento bajo, tira hacia el abdomen, codos atrás.'),
(d3, 'Elevaciones laterales',         4, 15,  60, 3, 'Codos ligeramente flexionados, no subs los hombros.'),
(d3, 'Pullover con mancuerna',        3, 12,  90, 4, 'Estira bien al bajar, contrae el dorsal al subir.'),
(d3, 'Curl martillo',                 3, 12,  60, 5, 'Trabaja braquiorradial. Movimiento lento y controlado.'),
(d3, 'Press francés con barra EZ',    3, 12,  60, 6, 'Codos sin abrirse. Extensión completa.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 4, 'Día 4: Tren Inferior B') RETURNING id INTO d4;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d4, 'Sentadilla búlgara',           4, 10, 120, 1, 'Pie trasero en banco, bajá vertical, foco en glúteo.'),
(d4, 'Hip thrust con barra',         4, 12,  90, 2, 'Aprieta glúteos arriba, mantené 1 segundo. Hombros en banco.'),
(d4, 'Prensa a 45°',                 3, 15,  90, 3, 'Pies altos para más glúteo, pies bajos para más cuádriceps.'),
(d4, 'Buenos días',                  3, 12, 120, 4, 'Espalda recta, bisagra de cadera, isquiotibiales al límite.'),
(d4, 'Abducción en máquina',         3, 20,  45, 5, 'Glúteo medio. Contracción en el punto de máxima apertura.'),
(d4, 'Elevaciones de pantorrilla sentado', 4, 20, 45, 6, 'Trabaja el sóleo. Rango completo imprescindible.');

END $$;

-- ============================================================
-- 2. LOSE WEIGHT - 3 DÍAS (Full Body metabólico)
-- ============================================================
DO $$
DECLARE tmpl_id INTEGER; d1 INTEGER; d2 INTEGER; d3 INTEGER;
BEGIN

INSERT INTO routine_templates (name, description, goal, frequency)
VALUES (
    'Full Body Definición 3 Días',
    'Entrenamiento de cuerpo completo 3 veces por semana con énfasis metabólico. Circuitos de alta intensidad para maximizar la quema calórica y preservar músculo durante el déficit calórico.',
    'lose_weight', 3
) RETURNING id INTO tmpl_id;

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 1, 'Día 1: Full Body — Circuito Potencia') RETURNING id INTO d1;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d1, 'Sentadilla con salto',          4, 12, 60, 1, 'Explosivo hacia arriba, aterrizás suave con rodillas flexionadas.'),
(d1, 'Press banca con barra',         4, 10, 75, 2, 'Ritmo controlado. Peso moderado para mantener el circuito.'),
(d1, 'Peso muerto convencional',      3, 10, 90, 3, 'Técnica impecable. No sacrifiques forma por velocidad.'),
(d1, 'Remo en T',                     3, 12, 75, 4, 'Espalda neutral, aprieta escápulas al final del recorrido.'),
(d1, 'Burpees',                       3, 10, 60, 5, 'Máxima intensidad. Descanso mínimo entre reps.'),
(d1, 'Plancha frontal',               3, 45, 45, 6, 'Core activo, no dejes que caigan las caderas. En segundos.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 2, 'Día 2: Full Body — Circuito Resistencia') RETURNING id INTO d2;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d2, 'Zancadas con mancuernas',       4, 12, 60, 1, '6 cada pierna. Paso largo, torso erguido.'),
(d2, 'Remo con mancuerna un brazo',   3, 12, 60, 2, 'Rango completo, no rotes el torso. Cada lado.'),
(d2, 'Flexiones de brazos',           4, 15, 45, 3, 'Cuerpo recto como tabla, baja el pecho hasta el suelo.'),
(d2, 'Sentadilla goblet',             3, 15, 60, 4, 'Mancuerna al pecho, rodillas afuera, espalda erguida.'),
(d2, 'Mountain climbers',             3, 30, 45, 5, '15 cada pierna. Alternados rápido, core firme.'),
(d2, 'Elevaciones de piernas acostado', 3, 15, 45, 6, 'Espalda baja pegada al piso, subilas juntas y controladas.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 3, 'Día 3: Full Body — HIIT + Fuerza') RETURNING id INTO d3;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d3, 'Sentadilla con barra',          4, 10, 90, 1, 'Peso moderado, ritmo controlado. Base de la sesión.'),
(d3, 'Press militar',                 3, 10, 90, 2, 'Hombros y core activo. No hiperextiendas la lumbar.'),
(d3, 'Dominadas asistidas o jalón',   3, 10, 90, 3, 'Tira con los codos abajo, escápulas juntas al final.'),
(d3, 'Kettlebell swings',             4, 15, 60, 4, 'Explosión de cadera, no squat. Glúteos apretados arriba.'),
(d3, 'Step-ups con mancuernas',       3, 12, 60, 5, '6 cada pierna. Banco a altura media, empuja con el talón.'),
(d3, 'Abdominales en rueda',          3, 10, 60, 6, 'No arqueés la lumbar. Controlado al extender y al volver.');

END $$;

-- ============================================================
-- 3. LOSE WEIGHT - 4 DÍAS (Push/Pull metabólico)
-- ============================================================
DO $$
DECLARE tmpl_id INTEGER; d1 INTEGER; d2 INTEGER; d3 INTEGER; d4 INTEGER;
BEGIN

INSERT INTO routine_templates (name, description, goal, frequency)
VALUES (
    'Push/Pull Definición 4 Días',
    'Split de empuje/tirón 4 días para maximizar quema calórica y tonificación muscular. Mayor volumen y menor descanso entre series para efecto metabólico óptimo durante el déficit calórico.',
    'lose_weight', 4
) RETURNING id INTO tmpl_id;

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 1, 'Día 1: Empuje + Core') RETURNING id INTO d1;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d1, 'Press banca inclinado',         4, 12, 75, 1, 'Banco a 30°. Peso que permita 12 reps con buena técnica.'),
(d1, 'Press militar mancuernas',      3, 12, 75, 2, 'Rango completo. Bajas hasta el nivel de los oídos.'),
(d1, 'Aperturas en polea cruzada',    3, 15, 60, 3, 'Contrae el pectoral en el cruce. Codos ligeramente flexionados.'),
(d1, 'Elevaciones laterales',         4, 15, 45, 4, 'Serie descendente si podés. Sin inercia.'),
(d1, 'Extensión tríceps en polea',    3, 15, 45, 5, 'Codos pegados, extensión total.'),
(d1, 'Plancha lateral',               3, 30, 30, 6, 'Cada lado. Core apretado, cadera no cae. En segundos.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 2, 'Día 2: Tirón + Core') RETURNING id INTO d2;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d2, 'Dominadas o jalón al pecho',    4, 10, 90, 1, 'Tira con los codos abajo. Rango completo.'),
(d2, 'Remo en polea baja',            3, 12, 75, 2, 'Tira hacia el abdomen, codos atrás, escápulas juntas.'),
(d2, 'Face pulls',                    3, 15, 60, 3, 'Cuerda a la altura de los ojos. Rotación externa de hombro.'),
(d2, 'Curl de bíceps con barra EZ',   3, 12, 60, 4, 'Sin balanceo. Aprieta arriba.'),
(d2, 'Curl martillo',                 3, 12, 60, 5, 'Movimiento neutro. Trabaja braquiorradial.'),
(d2, 'Elevaciones de piernas en barra', 3, 15, 45, 6, 'Core firme, piernas rectas. Controla la bajada.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 3, 'Día 3: Inferior + HIIT') RETURNING id INTO d3;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d3, 'Sentadilla con barra',          4, 12, 90, 1, 'Ritmo 3-0-1. Controlado abajo, explosivo arriba.'),
(d3, 'Peso muerto rumano',            3, 12, 90, 2, 'Énfasis isquiotibiales. Mantené tensión en todo el rango.'),
(d3, 'Hip thrust',                    3, 15, 75, 3, 'Aprieta glúteos arriba, no hiperextiendas la lumbar.'),
(d3, 'Sentadilla búlgara',            3, 10, 75, 4, '10 cada pierna. Bajá vertical, sin tirar la rodilla.'),
(d3, 'Saltos al cajón',               4, 10, 60, 5, 'Aterrizás con las rodillas flexionadas, bajás caminando.'),
(d3, 'Elevaciones de pantorrilla',    4, 20, 30, 6, 'Rango completo. 2 segundos arriba.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 4, 'Día 4: Full Body Metabólico') RETURNING id INTO d4;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d4, 'Circuito: Burpees',             4, 10, 30, 1, 'Intensidad máxima. Descanso mínimo. Registrá el tiempo.'),
(d4, 'Circuito: Remo con barra',      4, 10, 30, 2, 'Inmediatamente después de los burpees.'),
(d4, 'Circuito: Sentadilla goblet',   4, 15, 60, 3, 'Mancuerna al pecho. Completa el circuito anterior.'),
(d4, 'Press banca con mancuernas',    3, 12, 75, 4, 'Vuelta a ejercicios de fuerza tradicionales.'),
(d4, 'Mountain climbers',             3, 30, 45, 5, 'Alternados, ritmo alto. Caderas niveladas.'),
(d4, 'Plancha frontal',               3, 60, 30, 6, 'Core firme. No dejes caer las caderas. En segundos.');

END $$;

-- ============================================================
-- 4. STRENGTH - 3 DÍAS (Powerlifting básico)
-- ============================================================
DO $$
DECLARE tmpl_id INTEGER; d1 INTEGER; d2 INTEGER; d3 INTEGER;
BEGIN

INSERT INTO routine_templates (name, description, goal, frequency)
VALUES (
    'Powerlifting 3 Días - Fuerza Máxima',
    'Programa de fuerza pura basado en los 3 levantamientos fundamentales: sentadilla, press banca y peso muerto. Progresión lineal de carga semana a semana. Ideal para desarrollar fuerza máxima real.',
    'strength', 3
) RETURNING id INTO tmpl_id;

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 1, 'Día 1: Sentadilla + Accesorios') RETURNING id INTO d1;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d1, 'Sentadilla con barra',          5, 5,  240, 1, 'LA sentadilla. Aumentá 2.5kg cada semana. Técnica perfecta siempre.'),
(d1, 'Peso muerto rumano',            3, 8,  180, 2, 'Accesorio de cadena posterior. Controlado y con tensión.'),
(d1, 'Prensa a 45°',                  3, 10, 120, 3, 'Volumen de cuádriceps. Complementa la sentadilla.'),
(d1, 'Zancadas con mancuernas',       3, 8,  120, 4, '8 cada pierna. Unilateral para corregir desequilibrios.'),
(d1, 'Elevaciones de pantorrilla',    4, 15,  60, 5, 'Accesorio. Rango completo, 2 segundos arriba.'),
(d1, 'Plancha frontal',               3, 45,  60, 6, 'Core estabilizador para la sentadilla. En segundos.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 2, 'Día 2: Press Banca + Accesorios') RETURNING id INTO d2;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d2, 'Press banca con barra',         5, 5,  240, 1, 'El press. Aumentá 2.5kg cada semana. Arco natural, pies en el suelo.'),
(d2, 'Press inclinado con mancuernas',3, 8,  120, 2, 'Volumen de pectoral. Banco a 30°.'),
(d2, 'Dominadas lastradas',           3, 5,  180, 3, 'Si no podés lastrarte, hacelas con peso corporal x8.'),
(d2, 'Press militar con barra',       3, 8,  120, 4, 'Accesorio de hombros. Refuerza el press banca.'),
(d2, 'Extensión tríceps con barra EZ',3, 10, 90,  5, 'Tríceps clave para el press. Codos fijos.'),
(d2, 'Curl de bíceps con barra',      3, 10, 90,  6, 'Equilibrio entre empuje y tirón para proteger codos.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 3, 'Día 3: Peso Muerto + Accesorios') RETURNING id INTO d3;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d3, 'Peso muerto convencional',      5, 3,  300, 1, 'EL peso muerto. 3 reps pesadas. Aumentá 5kg por semana. Espalda neutral siempre.'),
(d3, 'Sentadilla frontal',            3, 5,  180, 2, 'Accesorio para mejorar postura en el peso muerto. Más cuádriceps.'),
(d3, 'Remo con barra',                4, 6,  180, 3, 'Espalda fuerte = peso muerto más grande. Agarre pronado.'),
(d3, 'Peso muerto sumo',              3, 5,  180, 4, 'Variante para trabajar aductores y glúteos. Pies abiertos.'),
(d3, 'Buenos días',                   3, 8,  120, 5, 'Fortalece cadena posterior. Espalda recta, bisagra de cadera.'),
(d3, 'Hiperextensiones',              3, 12,  90, 6, 'Lumbar y glúteos. Con peso al pecho si es fácil.');

END $$;

-- ============================================================
-- 5. STRENGTH - 4 DÍAS (Upper/Lower fuerza)
-- ============================================================
DO $$
DECLARE tmpl_id INTEGER; d1 INTEGER; d2 INTEGER; d3 INTEGER; d4 INTEGER;
BEGIN

INSERT INTO routine_templates (name, description, goal, frequency)
VALUES (
    'Upper/Lower Fuerza 4 Días',
    'Split superior/inferior orientado a fuerza máxima 4 días por semana. Rangos de 3-6 repeticiones con cargas altas y progresión semanal. Mayor frecuencia que un 3x para acelerar las ganancias de fuerza.',
    'strength', 4
) RETURNING id INTO tmpl_id;

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 1, 'Día 1: Tren Superior — Fuerza A') RETURNING id INTO d1;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d1, 'Press banca con barra',         5, 5,  240, 1, 'Progresión lineal. +2.5kg por semana. Arco, retracción escapular.'),
(d1, 'Press militar con barra',       4, 5,  180, 2, 'Core activo, glúteos apretados, no hiperextiendas.'),
(d1, 'Remo con barra',                4, 5,  180, 3, 'Espalda recta, codos cerca del cuerpo. +2.5kg/semana.'),
(d1, 'Dominadas lastradas',           3, 5,  180, 4, 'Con lastre si podés. 5 reps pesadas.'),
(d1, 'Extensión tríceps barra EZ',    3, 8,  90,  5, 'Accesorio de empuje. Codos fijos, extensión total.'),
(d1, 'Curl de bíceps concentrado',    3, 8,  90,  6, 'Un brazo a la vez. Foco total en el bíceps.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 2, 'Día 2: Tren Inferior — Fuerza A') RETURNING id INTO d2;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d2, 'Sentadilla con barra',          5, 5,  240, 1, 'Movimiento rey. Progresión cada semana sin excepción.'),
(d2, 'Peso muerto convencional',      4, 4,  240, 2, 'Técnica perfecta. No redondees la espalda bajo ninguna circunstancia.'),
(d2, 'Sentadilla frontal',            3, 5,  180, 3, 'Accesorio para postura. Codos altos, espalda vertical.'),
(d2, 'Peso muerto rumano',            3, 8,  120, 4, 'Cadena posterior. Isquiotibiales y glúteos con tensión.'),
(d2, 'Prensa a 45° pie estrecho',     3, 10, 120, 5, 'Énfasis cuádriceps. Complementa la sentadilla.'),
(d2, 'Elevaciones de pantorrilla',    4, 12,  60, 6, 'Rango completo. No saltees este grupo muscular.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 3, 'Día 3: Tren Superior — Fuerza B') RETURNING id INTO d3;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d3, 'Press banca inclinado barra',   4, 5,  180, 1, 'Variante del press. Misma progresión. Banco 30°.'),
(d3, 'Press cerrado (fuerza tríceps)',4, 5,  180, 2, 'Agarre a la anchura de los hombros. Tríceps pesado.'),
(d3, 'Remo Pendlay',                  4, 5,  180, 3, 'Partís desde el suelo cada rep. Fuerza explosiva de espalda.'),
(d3, 'Press Arnold',                  3, 8,  120, 4, 'Rotación completa. Deltoides anterior, medio y posterior.'),
(d3, 'Face pulls con cuerda',         3, 15,  60, 5, 'Salud del hombro. Siempre presente en rutinas de fuerza.'),
(d3, 'Remo con mancuerna',            3, 8,  120, 6, 'Unilateral. 8 cada lado. Rango completo.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 4, 'Día 4: Tren Inferior — Fuerza B') RETURNING id INTO d4;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d4, 'Sentadilla búlgara lastrada',   4, 5,  180, 1, '5 cada pierna. Corrije desequilibrios. Bajá vertical.'),
(d4, 'Peso muerto sumo',              4, 5,  180, 2, 'Variante de cadena posterior. Pies abiertos, grip neutro.'),
(d4, 'Hip thrust con barra pesado',   4, 5,  180, 3, 'Glúteo con fuerza. Empujá con la cadera, no con la lumbar.'),
(d4, 'Buenos días',                   3, 8,  120, 4, 'Cadena posterior. Espalda neutra, carga moderada.'),
(d4, 'Extensión de cuádriceps',       3, 12,  90, 5, 'Accesorio. Control total, 1 segundo en la contracción.'),
(d4, 'Curl femoral acostado',         3, 12,  90, 6, 'Isquiotibiales. No rebotas en el estiramiento.');

END $$;

-- ============================================================
-- 6. STRENGTH - 5 DÍAS (Powerbuilding PPL + fuerza)
-- ============================================================
DO $$
DECLARE tmpl_id INTEGER; d1 INTEGER; d2 INTEGER; d3 INTEGER; d4 INTEGER; d5 INTEGER;
BEGIN

INSERT INTO routine_templates (name, description, goal, frequency)
VALUES (
    'Powerbuilding 5 Días - Fuerza Máxima',
    'Combinación de powerlifting y volumen de hipertrofia 5 días por semana. Sesiones dedicadas a los levantamientos principales con trabajo accesorio de volumen. El enfoque es ganar fuerza real medible semana a semana.',
    'strength', 5
) RETURNING id INTO tmpl_id;

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 1, 'Día 1: Sentadilla — Fuerza Principal') RETURNING id INTO d1;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d1, 'Sentadilla con barra',          6, 4,  300, 1, 'Trabajo principal. 6 series de 4 reps pesadas. +2.5kg/semana.'),
(d1, 'Sentadilla pausa (2seg abajo)', 3, 3,  240, 2, 'Técnica avanzada. Pausa en el fondo, elimina el rebote.'),
(d1, 'Prensa a 45°',                  4, 10, 120, 3, 'Volumen de cuádriceps. Complementa la sentadilla.'),
(d1, 'Peso muerto rumano',            4, 8,  120, 4, 'Cadena posterior. Isquiotibiales y glúteos.'),
(d1, 'Extensión de cuádriceps',       3, 15,  60, 5, 'Accesorio. Aislamiento de cuádriceps.'),
(d1, 'Curl femoral acostado',         3, 15,  60, 6, 'Balance cuádriceps/isquiotibiales. Fundamental.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 2, 'Día 2: Press Banca — Fuerza Principal') RETURNING id INTO d2;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d2, 'Press banca con barra',         6, 4,  300, 1, 'Trabajo principal. 6x4 pesado. Arco controlado, retracción escapular.'),
(d2, 'Press banca pausa (2seg)',      3, 3,  240, 2, 'Pausa sobre el pecho. Desarrolla la fase inicial del press.'),
(d2, 'Press inclinado mancuernas',    4, 10, 120, 3, 'Volumen de pectoral superior.'),
(d2, 'Aperturas en polea cruzada',    3, 15,  60, 4, 'Estiramiento y contracción del pectoral. Codos flexionados.'),
(d2, 'Press francés barra EZ',        4, 8,   90, 5, 'Tríceps clave para el press banca.'),
(d2, 'Extensión tríceps en polea',    3, 15,  60, 6, 'Volumen de tríceps. Codos fijos, extensión total.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 3, 'Día 3: Peso Muerto — Fuerza Principal') RETURNING id INTO d3;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d3, 'Peso muerto convencional',      5, 3,  360, 1, 'Trabajo principal. 5x3 MUY pesado. Máxima concentración. +5kg/semana.'),
(d3, 'Peso muerto desde pins',        3, 3,  240, 2, 'Desde la rodilla hacia arriba. Trabaja el punto débil del levantamiento.'),
(d3, 'Remo con barra',                5, 5,  180, 3, 'Espalda fuerte para el peso muerto. Agarre pronado.'),
(d3, 'Jalón al pecho agarre estrecho',3, 10, 120, 4, 'Complemento de jalón. Trabaja más el dorsal inferior.'),
(d3, 'Hiperextensiones con peso',     4, 10, 120, 5, 'Lumbar y glúteos. Fundamental en días de peso muerto.'),
(d3, 'Face pulls',                    3, 15,  60, 6, 'Salud del manguito rotador. No lo saltees nunca.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 4, 'Día 4: Tren Superior — Volumen') RETURNING id INTO d4;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d4, 'Press militar con barra',       4, 6,  180, 1, 'Hombros pesados. Core activo, glúteos apretados.'),
(d4, 'Dominadas lastradas',           4, 5,  180, 2, 'Con lastre si podés. Rango completo, cuelga al final.'),
(d4, 'Press cerrado con barra',       4, 6,  150, 3, 'Agarre a anchura de hombros. Tríceps fuerte.'),
(d4, 'Remo en T',                     4, 8,  120, 4, 'Espalda, romboides y trapecio medio.'),
(d4, 'Elevaciones laterales pesadas', 4, 10,  60, 5, 'Series pesadas de laterales. Deltoides medios.'),
(d4, 'Curl de bíceps con barra',      4, 8,   90, 6, 'Bíceps fuerte para el remo y las dominadas.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 5, 'Día 5: Tren Inferior — Volumen') RETURNING id INTO d5;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d5, 'Sentadilla frontal',            4, 6,  180, 1, 'Cuádriceps y postura. Codos altos, espalda vertical.'),
(d5, 'Hip thrust barra',              4, 8,  150, 2, 'Glúteos con carga. Progresión semanal posible.'),
(d5, 'Sentadilla búlgara',            3, 8,  120, 3, '8 cada pierna. Unilateral para corregir desequilibrios.'),
(d5, 'Buenos días',                   3, 8,  120, 4, 'Cadena posterior. Lumbar, glúteos, isquiotibiales.'),
(d5, 'Extensión de cuádriceps',       3, 15,  60, 5, 'Bombeo de cuádriceps al final.'),
(d5, 'Elevaciones de pantorrilla',    5, 15,  45, 6, 'Pantorrillas pesadas. Rango completo siempre.');

END $$;

-- ============================================================
-- 7. ENDURANCE - 3 DÍAS (Resistencia funcional)
-- ============================================================
DO $$
DECLARE tmpl_id INTEGER; d1 INTEGER; d2 INTEGER; d3 INTEGER;
BEGIN

INSERT INTO routine_templates (name, description, goal, frequency)
VALUES (
    'Resistencia Funcional 3 Días',
    'Entrenamiento de resistencia muscular y cardiovascular 3 días por semana. Circuitos de alta repetición con descansos cortos para mejorar la capacidad aeróbica, la resistencia muscular y el rendimiento deportivo general.',
    'endurance', 3
) RETURNING id INTO tmpl_id;

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 1, 'Día 1: Circuito Resistencia Inferior') RETURNING id INTO d1;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d1, 'Sentadilla con peso corporal', 5, 20, 45, 1, '20 reps. Ritmo constante, profundidad completa. Sin parar.'),
(d1, 'Zancadas alternadas',          4, 24, 45, 2, '12 cada pierna alternadas. Torso recto, paso largo.'),
(d1, 'Step-ups',                     4, 20, 45, 3, '10 cada pierna. Banco a altura media. Empujá con el talón.'),
(d1, 'Sentadilla sumo',              4, 20, 30, 4, 'Pies abiertos 45°. Profundidad completa, ritmo alto.'),
(d1, 'Saltos en estrella (jumping jacks)', 4, 30, 30, 5, 'Cardio activo entre series de fuerza.'),
(d1, 'Plancha frontal',              4, 60, 30, 6, 'Core resistencia. 60 segundos sin bajar. En segundos.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 2, 'Día 2: Circuito Resistencia Superior') RETURNING id INTO d2;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d2, 'Flexiones de brazos',          5, 20, 45, 1, '20 reps. Si es fácil, usá mancuernas livianas de accesorio.'),
(d2, 'Remo en polea baja',           4, 15, 45, 2, 'Peso liviano, ritmo alto. 15 reps contínuas sin parar.'),
(d2, 'Press militar mancuernas',     4, 15, 45, 3, 'Liviano, ritmo alto. Hombros activos todo el tiempo.'),
(d2, 'Jalón al pecho',               4, 15, 45, 4, 'Peso moderado, rango completo, sin balanceo.'),
(d2, 'Mountain climbers',            4, 30, 30, 5, '15 cada pierna. Ritmo rápido. Core firme.'),
(d2, 'Burpees',                      3, 15, 60, 6, 'Intensidad máxima. El ejercicio de resistencia total por excelencia.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 3, 'Día 3: HIIT Full Body') RETURNING id INTO d3;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d3, 'Kettlebell swings',            5, 20, 30, 1, 'Explosión de cadera. 20 reps sin parar. Excelente para resistencia.'),
(d3, 'Flexiones + rotación',         4, 12, 30, 2, 'Flexión normal + rotación de tronco alternada arriba.'),
(d3, 'Sentadilla con salto',         4, 15, 45, 3, 'Explosivo. Aterrizás suave. Resistencia anaeróbica.'),
(d3, 'Remo con mancuerna',           4, 15, 30, 4, '15 cada brazo sin parar. Peso liviano, ritmo alto.'),
(d3, 'Escaladores (mountain climbers)', 4, 40, 30, 5, '20 cada pierna. Ritmo máximo. Core resistencia.'),
(d3, 'Circuito AMRAP 5 min: Burpees + Sentadilla + Flexión', 1, 99, 0, 6, 'AMRAP = As Many Rounds As Possible en 5 minutos. Anotá cuántas rondas completás.');

END $$;

-- ============================================================
-- 8. ENDURANCE - 4 DÍAS (CrossFit-style)
-- ============================================================
DO $$
DECLARE tmpl_id INTEGER; d1 INTEGER; d2 INTEGER; d3 INTEGER; d4 INTEGER;
BEGIN

INSERT INTO routine_templates (name, description, goal, frequency)
VALUES (
    'CrossFit Style 4 Días - Resistencia',
    'Entrenamiento de resistencia de alta intensidad estilo CrossFit 4 días por semana. Combinación de levantamiento olímpico, gimnasia y cardio para desarrollar resistencia muscular, cardiovascular y potencia.',
    'endurance', 4
) RETURNING id INTO tmpl_id;

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 1, 'Día 1: Metcon Inferior + Core') RETURNING id INTO d1;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d1, 'Peso muerto con barra liviana', 5, 15, 45, 1, 'Peso al 50% del máximo. 15 reps técnica perfecta, ritmo constante.'),
(d1, 'Sentadilla con salto',          5, 10, 30, 2, 'Explosivo. Inmediatamente después del peso muerto.'),
(d1, 'Kettlebell swings',             4, 20, 30, 3, 'Potencia de cadera. 20 reps sin parar.'),
(d1, 'Box jumps',                     4, 10, 45, 4, 'Cajón a altura moderada. Aterrizás suave.'),
(d1, 'Plancha + tocada de hombros',   4, 20, 30, 5, '10 cada lado. Core activo, caderas estables.'),
(d1, 'Sit-ups',                       4, 25, 30, 6, 'Abdominales completos. Manos detrás de la cabeza.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 2, 'Día 2: Metcon Superior + Pull') RETURNING id INTO d2;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d2, 'Remo con barra liviana',        5, 15, 45, 1, 'Peso moderado. 15 reps técnica, ritmo constante.'),
(d2, 'Flexiones explosivas',          5, 10, 30, 2, 'Manos despegan del suelo. Potencia de tren superior.'),
(d2, 'Dominadas kipping',             4, 10, 45, 3, 'Estilo CrossFit con impulso de cadera. Máximo volumen.'),
(d2, 'Press arnold con mancuernas',   4, 12, 45, 4, 'Hombros. Rotación completa. Ritmo moderado.'),
(d2, 'Curl + press (mancuernas)',      4, 12, 30, 5, 'Curl de bíceps directo a press. Sin parar. Movimiento compuesto.'),
(d2, 'Anillas o TRX: remo',           4, 15, 30, 6, 'Inestabilidad activa más músculos. Cuerpo recto.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 3, 'Día 3: AMRAP + Cardio') RETURNING id INTO d3;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d3, 'Burpees',                       5, 10, 30, 1, 'Máxima intensidad. 10 reps sin parar por serie.'),
(d3, 'Saltos al cajón',               4, 10, 30, 2, 'Inmediatamente después de los burpees.'),
(d3, 'Kettlebell swing',              4, 15, 30, 3, 'Sin parar. Potencia de cadera alta.'),
(d3, 'Wall balls (balón medicinal)',   4, 15, 30, 4, 'Sentadilla + lanzamiento a la pared. 4-6kg.'),
(d3, 'Cuerda de salto doble',         4, 30, 30, 5, '30 saltos. O 30 saltos simples a ritmo alto.'),
(d3, 'AMRAP 8 min: Burpee+Swing+Wall ball', 1, 99, 0, 6, '8 minutos. Anotá las rondas. Cada semana intentás superar.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 4, 'Día 4: Full Body Resistencia') RETURNING id INTO d4;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d4, 'Peso muerto con barra',         5, 10, 60, 1, 'Peso moderado. Técnica, ritmo, sin parar.'),
(d4, 'Press banca con barra',         5, 10, 60, 2, 'Superserie con el peso muerto. Tren superior + inferior.'),
(d4, 'Sentadilla goblet',             4, 15, 45, 3, 'Mancuerna al pecho. Ritmo alto.'),
(d4, 'Remo en T',                     4, 15, 45, 4, 'Espalda. Inmediatamente después de la sentadilla.'),
(d4, 'Farmer walk',                   4, 40, 60, 5, '40 metros con mancuernas pesadas. Agarre, core y resistencia.'),
(d4, 'Plancha + burpee',              3, 10, 45, 6, 'Plancha 30 seg + 10 burpees. Sin parar entre ejercicios.');

END $$;

-- ============================================================
-- 9. ENDURANCE - 5 DÍAS (Resistencia avanzada)
-- ============================================================
DO $$
DECLARE tmpl_id INTEGER; d1 INTEGER; d2 INTEGER; d3 INTEGER; d4 INTEGER; d5 INTEGER;
BEGIN

INSERT INTO routine_templates (name, description, goal, frequency)
VALUES (
    'Resistencia Avanzada 5 Días',
    'Programa de resistencia de alto volumen 5 días por semana. Combina fuerza de resistencia, circuitos metabólicos y trabajo de capacidad cardiovascular. Diseñado para atletas que buscan mejorar significativamente su condición física general.',
    'endurance', 5
) RETURNING id INTO tmpl_id;

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 1, 'Día 1: Resistencia Inferior') RETURNING id INTO d1;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d1, 'Sentadilla con barra liviana',  5, 20, 45, 1, 'Peso al 60%. 20 reps técnica perfecta. Resistencia de cuádriceps.'),
(d1, 'Peso muerto rumano liviano',    4, 15, 45, 2, 'Isquiotibiales. Ritmo constante, tensión permanente.'),
(d1, 'Zancadas con mancuernas',       4, 20, 30, 3, '10 cada pierna alternadas. Sin parar.'),
(d1, 'Sentadilla búlgara',            3, 15, 45, 4, '15 cada pierna. Glúteo y cuádriceps unilateral.'),
(d1, 'Saltos en box',                 4, 15, 30, 5, 'Explosivo. Resistencia anaeróbica.'),
(d1, 'Elevaciones de pantorrilla',    5, 30, 30, 6, '30 reps. Resistencia de pantorrilla. Rango completo.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 2, 'Día 2: Resistencia Superior Empuje') RETURNING id INTO d2;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d2, 'Press banca mancuernas',        5, 15, 45, 1, 'Peso moderado. 15 reps técnica. Resistencia de pectoral.'),
(d2, 'Press militar mancuernas',      4, 15, 45, 2, 'Hombros. 15 reps sin parar.'),
(d2, 'Flexiones de brazos',           5, 20, 30, 3, '20 reps. Si es fácil añadí lastre con mochila.'),
(d2, 'Aperturas con mancuernas',      4, 20, 30, 4, 'Pectoral. Movimiento amplio, codos ligeramente flexionados.'),
(d2, 'Extensión tríceps polea',        4, 20, 30, 5, 'Tríceps resistencia. 20 reps, codos fijos.'),
(d2, 'Mountain climbers',             5, 30, 30, 6, 'Core y cardio. 15 cada pierna alternadas.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 3, 'Día 3: Metcon + HIIT') RETURNING id INTO d3;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d3, 'Burpees',                       5, 15, 30, 1, '15 reps máxima velocidad. Registrá el tiempo de cada serie.'),
(d3, 'Kettlebell swings',             5, 20, 30, 2, '20 reps. Potencia de cadera. Inmediatamente después.'),
(d3, 'Saltos en estrella',            4, 30, 20, 3, '30 jumping jacks. Cardio activo de recuperación.'),
(d3, 'Sentadilla con salto',          4, 15, 30, 4, 'Explosivo. Resistencia anaeróbica de piernas.'),
(d3, 'Escaladores',                   4, 30, 20, 5, '15 cada pierna. Core y cardio.'),
(d3, 'AMRAP 10 min: Burpee+Swing+Salto', 1, 99, 0, 6, '10 minutos. Anotá rondas. Meta: mejorar cada semana.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 4, 'Día 4: Resistencia Superior Tirón') RETURNING id INTO d4;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d4, 'Dominadas',                     5, 10, 60, 1, 'Si podés más de 10, añadí lastre. Resistencia de dorsal.'),
(d4, 'Remo en polea baja',            5, 15, 45, 2, 'Peso moderado. 15 reps técnica, ritmo constante.'),
(d4, 'Jalón al pecho',                4, 15, 45, 3, 'Complemento de dominadas. Mismo músculo más volumen.'),
(d4, 'Face pulls',                    4, 20, 30, 4, 'Hombros y manguito rotador. Alta repetición para resistencia.'),
(d4, 'Curl de bíceps con barra',      4, 20, 30, 5, '20 reps livianas. Resistencia de bíceps.'),
(d4, 'Remo con mancuerna',            4, 15, 30, 6, '15 cada brazo. Sin parar. Unilateral.');

INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 5, 'Día 5: Full Body Resistencia Final') RETURNING id INTO d5;
INSERT INTO routine_template_exercises (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d5, 'Peso muerto liviano',           5, 15, 45, 1, 'Cierre semanal con peso muerto de resistencia. 15 reps.'),
(d5, 'Press banca con barra',         5, 12, 45, 2, 'Superserie: inmediatamente después del peso muerto.'),
(d5, 'Sentadilla frontal liviana',    4, 15, 45, 3, 'Core y cuádriceps. Resistencia de movilidad.'),
(d5, 'Remo con barra',                4, 15, 45, 4, 'Espalda resistencia. Ritmo constante, rango completo.'),
(d5, 'Farmer walk',                   4, 50, 60, 5, '50 metros. Resistencia de agarre, core y cardiovascular.'),
(d5, 'Circuito final 5 min: Burpee + Flexión + Sentadilla', 1, 99, 0, 6, 'AMRAP 5 minutos. Rondas completas. Cerrás la semana al 100%.');

END $$;
