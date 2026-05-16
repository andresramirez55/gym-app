-- Migración 007: Programa PHUL + duración recomendada en templates

-- Agregamos recommended_duration_weeks a los templates
-- (permite que al generar rutina se use la duración correcta para cada programa)
ALTER TABLE routine_templates
    ADD COLUMN IF NOT EXISTS recommended_duration_weeks INTEGER NOT NULL DEFAULT 12;

-- ============================================================
-- PHUL — Power Hypertrophy Upper Lower (Josh Bryant)
-- El programa de 4 días más popular y probado para ganar masa
-- ============================================================
DO $$
DECLARE
    tmpl_id INTEGER;
    d1 INTEGER; d2 INTEGER; d3 INTEGER; d4 INTEGER;
BEGIN

INSERT INTO routine_templates (name, description, goal, frequency, recommended_duration_weeks)
VALUES (
    'PHUL — Power Hypertrophy Upper Lower',
    'El programa de 4 días más usado del mundo, creado por Josh Bryant. Combina 2 días de fuerza pura (3-5 reps) con 2 días de hipertrofia (8-12 reps). Ganás fuerza Y músculo al mismo tiempo. Miércoles: caminata o descanso activo.',
    'gain_muscle',
    4,
    12
) RETURNING id INTO tmpl_id;

-- =====================================================
-- DÍA 1: UPPER POWER — Fuerza Tren Superior (Lunes)
-- =====================================================
INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 1, 'Día 1: Upper Power — Fuerza Tren Superior')
RETURNING id INTO d1;

INSERT INTO routine_template_exercises
    (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d1, 'Press banca con barra',          4, 5,  180, 1, 'DÍA DE FUERZA: 3-5 reps pesado. Muñecas alineadas, arco natural, pies firmes. Subí 2.5kg cada semana.'),
(d1, 'Press inclinado con mancuernas', 3, 8,  120, 2, 'Accesorio de pecho superior. 6-10 reps controlado. Bajá hasta estirar bien el pecho antes de subir.'),
(d1, 'Remo con barra',                 4, 5,  180, 3, 'DÍA DE FUERZA: fuerza de espalda pura. 3-5 reps. Torso a 45°, codos cerca del cuerpo, aprieta escápulas.'),
(d1, 'Jalón al pecho',                 3, 8,  120, 4, 'Accesorio de espalda. 6-10 reps. Agarre ancho pronado, tira con codos hacia abajo y atrás.'),
(d1, 'Press militar con barra',        3, 6,  120, 5, 'Hombros de pie: 5-8 reps. Core apretado, glúteos activados, empujá directo hacia arriba.'),
(d1, 'Face pulls en cable',            3, 15,  60, 6, 'SALUD DEL HOMBRO: no saltear nunca. Cuerda a altura de cara, tirá hacia la frente, codos arriba y afuera.'),
(d1, 'Curl con barra',                 3, 8,   90, 7, 'Bíceps: 6-10 reps. Sin balanceo de cuerpo. Codos fijos en los costados. Contracción completa arriba.'),
(d1, 'Skull crushers con barra EZ',    3, 8,   90, 8, 'Tríceps: 6-10 reps. Codos apuntando al techo, solo antebrazos se mueven. Control total en la bajada.');

-- =====================================================
-- DÍA 2: LOWER POWER — Fuerza Tren Inferior (Martes)
-- =====================================================
INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 2, 'Día 2: Lower Power — Fuerza Tren Inferior')
RETURNING id INTO d2;

INSERT INTO routine_template_exercises
    (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d2, 'Sentadilla con barra',           4, 5,  240, 1, 'DÍA DE FUERZA: 3-5 reps pesado. Profundidad completa, rodillas alineadas con pies. Subí 2.5kg por semana.'),
(d2, 'Peso muerto convencional',       4, 5,  240, 2, 'DÍA DE FUERZA: 3-5 reps. Espalda neutral, cadera atrás, empujá el piso. Descansá completo entre series.'),
(d2, 'Prensa a 45°',                   4, 12, 120, 3, 'Volumen de cuád: 10-15 reps. Después del trabajo pesado el cuerpo está activado. Rango completo.'),
(d2, 'Curl femoral acostado',          4, 8,  120, 4, 'Isquiotibiales: 6-10 reps. Control total, no rebotas en el punto de máximo estiramiento abajo.'),
(d2, 'Elevaciones de gemelos de pie',  4, 8,   90, 5, '6-10 reps con carga. 2 segundos arriba, bajá lento hasta el estiramiento completo.'),
(d2, 'Plancha frontal',                3, 45,  60, 6, 'Core: 45 segundos. Cuerpo recto como tabla. No bajes las caderas ni el mentón al pecho.');

-- =====================================================
-- DÍA 3: UPPER HIPERTROFIA — Tren Superior (Jueves)
-- =====================================================
INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 3, 'Día 3: Upper Hipertrofia — Tren Superior')
RETURNING id INTO d3;

INSERT INTO routine_template_exercises
    (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d3, 'Press inclinado con barra',             4, 10, 120, 1, 'Pecho superior: 8-12 reps. Banco a 30°. Mismo patrón que press plano pero énfasis en porción clavicular.'),
(d3, 'Aperturas con mancuernas plano',        3, 10,  90, 2, 'Aislamiento de pecho: 8-12 reps. Estira bien en la bajada, arco suave hacia el techo al subir.'),
(d3, 'Remo en polea baja',                    4, 10, 120, 3, 'Espalda hipertrofia: 8-12 reps. Estirá completamente al frente antes de cada rep, codos bien atrás.'),
(d3, 'Remo con mancuerna',                    3, 10,  90, 4, 'Unilateral de espalda: 8-12 reps. Rodilla y mano en banco, tira el codo hacia el techo.'),
(d3, 'Elevaciones laterales con mancuernas',  4, 12,  60, 5, 'Deltoides lateral: 8-12 reps. Codos ligeramente flexionados. Hasta altura de hombros, no más.'),
(d3, 'Pájaros en cable',                      3, 15,  60, 6, 'Deltoides posterior: 15-20 reps. Cable bajo, abre hacia atrás. Balance muscular y salud del hombro.'),
(d3, 'Curl inclinado con mancuernas',         3, 10,  90, 7, 'Bíceps: 8-12 reps. En banco a 45°, máximo estiramiento del bíceps largo. Bajá muy despacio.'),
(d3, 'Extensión de tríceps en polea',         3, 10,  90, 8, 'Tríceps: 8-12 reps. Codos pegados al cuerpo, extiende completamente, aprieta al final del movimiento.');

-- =====================================================
-- DÍA 4: LOWER HIPERTROFIA — Tren Inferior (Viernes)
-- =====================================================
INSERT INTO routine_template_days (template_id, day_number, day_name)
VALUES (tmpl_id, 4, 'Día 4: Lower Hipertrofia — Tren Inferior')
RETURNING id INTO d4;

INSERT INTO routine_template_exercises
    (template_day_id, name, sets, reps, rest_seconds, "order", notes) VALUES
(d4, 'Sentadilla frontal',             4, 10, 120, 1, 'Variante de squat: 8-12 reps. Barra en deltoides frontales, codos arriba. Más énfasis en cuádriceps.'),
(d4, 'Zancadas con barra',             3, 10, 120, 2, 'Unilateral de piernas: 8-12 reps por lado. Torso erguido, rodilla trasera cerca del piso.'),
(d4, 'Extensión de cuádriceps',        4, 12,  90, 3, 'Aislamiento de cuád: 10-15 reps. Mantené 1 segundo arriba. No uses momentum.'),
(d4, 'Curl femoral sentado',           4, 12,  90, 4, 'Isquiotibiales: 10-15 reps. Posición sentada = mayor ROM que acostado. Controlá la bajada.'),
(d4, 'Hip thrust con barra',           3, 12,  90, 5, 'Glúteos: 10-12 reps. Hombros en banco, aprieta glúteos arriba y mantené 1 segundo. Carga progresiva.'),
(d4, 'Elevaciones de gemelos sentado', 4, 12,  90, 6, 'Sóleo (músculo profundo): 8-12 reps. Diferente al gemelo de pie. Rango completo, 2 segundos arriba.'),
(d4, 'Crunches en polea',              3, 15,  60, 7, 'Core: 15-20 reps. Polea alta con cuerda, agárrate la nuca, contraé el abdomen hacia las rodillas.');

END $$;
