-- Programa Fuerza + Hipertrofia 5 días (PHUL adaptado)
-- Diseñado para máxima ganancia de masa muscular con base de fuerza real

DO $$
DECLARE
    tmpl_id INTEGER;
    d1 INTEGER; d2 INTEGER; d3 INTEGER; d4 INTEGER; d5 INTEGER;
BEGIN

INSERT INTO routine_templates (name, description, goal, frequency)
VALUES (
    'Programa Fuerza e Hipertrofia 5 Días',
    'Método PHUL adaptado: 2 días de fuerza pura en rangos bajos (3-5 reps) y 3 días de hipertrofia controlada. Progresión de carga semana a semana. Ideal para ganar masa muscular y fuerza real de forma simultánea.',
    'gain_muscle',
    5
)
RETURNING id INTO tmpl_id;

-- =====================================================
-- DÍA 1: FUERZA - TREN INFERIOR
-- =====================================================
INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 1, 'Día 1: Fuerza — Tren Inferior')
RETURNING id INTO d1;

INSERT INTO routine_template_exercises
    (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d1, 'Sentadilla con barra',         5, 5, 180, 1, 'El ejercicio principal. Aumentá 2.5kg cada semana. Control total en el descenso, explosivo al subir.'),
(d1, 'Peso muerto convencional',     4, 4, 180, 2, 'Espalda neutral, cadera atrás, empujá el piso. Descansá bien entre series.'),
(d1, 'Prensa a 45°',                 3, 8, 120, 3, 'Complemento de volumen para cuádriceps. Rango completo, rodillas sin bloquear.'),
(d1, 'Peso muerto rumano',           3, 8, 120, 4, 'Énfasis en isquiotibiales y glúteos. Mantené tensión en el estiramiento, no rebotas.'),
(d1, 'Curl femoral acostado',        3, 10, 90, 5, 'Control total. Aislamiento de isquiotibiales.'),
(d1, 'Elevaciones de pantorrilla',   4, 15, 60, 6, 'Mantené 2 segundos en la posición alta. Rango completo.');

-- =====================================================
-- DÍA 2: FUERZA - TREN SUPERIOR
-- =====================================================
INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 2, 'Día 2: Fuerza — Tren Superior')
RETURNING id INTO d2;

INSERT INTO routine_template_exercises
    (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d2, 'Press banca con barra',        5, 5, 180, 1, 'Muñecas alineadas con codos, arco lumbar natural, pies firmes en el suelo. Aumentá peso cada semana.'),
(d2, 'Press militar con barra',      4, 5, 180, 2, 'De pie. Glúteos y core apretados. No arquees la espalda baja. Empuja directo hacia arriba.'),
(d2, 'Dominadas lastradas',          4, 5, 180, 3, 'Si no podés lastrar todavía, hacé el máximo de reps. Rango completo, codos completamente extendidos abajo.'),
(d2, 'Remo Pendlay con barra',       4, 5, 180, 4, 'Torso casi paralelo al piso. La barra parte del suelo cada rep. Explosivo hacia el abdomen.'),
(d2, 'Curl con barra EZ',            3, 8,  90, 5, 'No balancees el cuerpo. Codos fijos. Pico de contracción arriba.'),
(d2, 'Press francés con barra EZ',   3, 8,  90, 6, 'Codos apuntando al techo. Solo los antebrazos se mueven. Excelente para fuerza de tríceps.');

-- =====================================================
-- DÍA 3: HIPERTROFIA - PIERNAS + GLÚTEOS
-- =====================================================
INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 3, 'Día 3: Hipertrofia — Piernas y Glúteos')
RETURNING id INTO d3;

INSERT INTO routine_template_exercises
    (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d3, 'Sentadilla búlgara con mancuernas', 4, 10, 90, 1, 'Pie trasero en banco. Rodilla frontal no pasa la punta del pie. Una de las mejores para pierna unilateral.'),
(d3, 'Hip thrust con barra',              4, 12, 90, 2, 'El mejor ejercicio para glúteos. Aprieta fuerte arriba y mantén 1 segundo. Carga progresiva.'),
(d3, 'Prensa a 45° pies altos',          3, 12, 90, 3, 'Posición alta del pie activa más glúteo e isquiotibial. Diferente estímulo a la sentadilla.'),
(d3, 'Extensión de cuádriceps',          3, 15, 60, 4, 'Aislamiento puro de cuádriceps. Control total, no tires. Mantén 1s arriba.'),
(d3, 'Curl femoral sentado',             3, 12, 60, 5, 'La posición sentada estira más el recto femoral. Mayor rango de movimiento que acostado.'),
(d3, 'Elevaciones de pantorrilla sentado', 4, 15, 60, 6, 'Trabaja el músculo sóleo (profundo). Mantén 2s arriba y baja lento.');

-- =====================================================
-- DÍA 4: HIPERTROFIA - EMPUJE (Pecho / Hombros / Tríceps)
-- =====================================================
INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 4, 'Día 4: Hipertrofia — Empuje')
RETURNING id INTO d4;

INSERT INTO routine_template_exercises
    (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d4, 'Press inclinado con mancuernas',    4, 10, 90, 1, 'Inclinación 30-45°. Máximo estiramiento pectoral en la bajada. Contrae fuerte arriba.'),
(d4, 'Press Arnold',                      4, 12, 90, 2, 'Rotación completa del movimiento. Trabaja los 3 fascículos del deltoides. No escatimes el rango.'),
(d4, 'Fondos en paralelas con peso',      3, 12, 90, 3, 'Cuerpo ligeramente inclinado adelante para mayor activación pectoral. Si pesás poco, usá chaleco.'),
(d4, 'Elevaciones laterales en cable',    4, 15, 60, 4, 'El cable mantiene tensión constante durante todo el movimiento, a diferencia de la mancuerna.'),
(d4, 'Aperturas en cable bajo',           3, 15, 60, 5, 'Enfatiza la parte superior e interna del pecho. Contrae en la cima del movimiento.'),
(d4, 'Extensiones de tríceps en polea',   3, 12, 60, 6, 'Codos fijos al costado. Extiende completamente. El tríceps es 2/3 del brazo: no lo descuides.');

-- =====================================================
-- DÍA 5: HIPERTROFIA - TRACCIÓN (Espalda / Bíceps)
-- =====================================================
INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 5, 'Día 5: Hipertrofia — Tracción')
RETURNING id INTO d5;

INSERT INTO routine_template_exercises
    (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d5, 'Dominadas pronadas',                    4, 10, 90, 1, 'Rango completo. Colgá peso cuando las domines bien. Escápulas hacia abajo y atrás durante todo el movimiento.'),
(d5, 'Remo con barra prono',                  4, 10, 90, 2, 'Codos cerca del cuerpo. Aprieta escápulas al final de cada rep. Descarga el ego y usá técnica perfecta.'),
(d5, 'Remo en polea baja agarre neutro',      3, 12, 90, 3, 'Estira completamente al frente antes de cada repetición. La fase excéntrica es igual de importante.'),
(d5, 'Pullover en polea alta',                3, 15, 60, 4, 'Trabaja gran dorsal y serrato. Brazos semi-extendidos. Sentís el estiramiento en el costado.'),
(d5, 'Face pulls con cuerda',                 3, 20, 60, 5, 'Salud de los hombros. Nunca lo saltees. Fortalece el manguito rotador y deltoides posterior.'),
(d5, 'Curl con mancuernas inclinado',         3, 12, 60, 6, 'En banco inclinado 45°. Máximo estiramiento del bíceps largo. Lento en la bajada.'),
(d5, 'Curl martillo bilateral',               3, 12, 60, 7, 'Trabaja braquiorradial y braquial. Complementa el curl clásico para brazos más gruesos.');

END $$;
