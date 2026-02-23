import axios from 'axios';

// Nota: Necesitás registrarte en RapidAPI y obtener tu API key gratuita
// https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
// Luego agregá EXPO_PUBLIC_EXERCISEDB_API_KEY en tu archivo .env
const EXERCISEDB_API_KEY = process.env.EXPO_PUBLIC_EXERCISEDB_API_KEY || '';
const EXERCISEDB_BASE_URL = 'https://exercisedb.p.rapidapi.com';

const exerciseDBApi = axios.create({
  baseURL: EXERCISEDB_BASE_URL,
  headers: {
    'X-RapidAPI-Key': EXERCISEDB_API_KEY,
    'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
  },
  timeout: 10000,
});

export interface ExerciseInfo {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
  description: string;
  difficulty: string;
  category: string;
}

// Cache para evitar llamadas repetidas a la API
const exerciseCache: { [key: string]: ExerciseInfo | null } = {};

/**
 * Busca un ejercicio por nombre en ExerciseDB
 * Retorna el ejercicio con GIF y detalles, o null si no se encuentra
 */
export async function searchExercise(exerciseName: string): Promise<ExerciseInfo | null> {
  // Normalizar nombre para cache
  const normalizedName = exerciseName.toLowerCase().trim();

  // Verificar cache
  if (exerciseCache[normalizedName] !== undefined) {
    return exerciseCache[normalizedName];
  }

  try {
    // Buscar por nombre
    const response = await exerciseDBApi.get<ExerciseInfo[]>('/exercises/name/' + encodeURIComponent(normalizedName));

    if (response.data && response.data.length > 0) {
      const exercise = response.data[0];
      exerciseCache[normalizedName] = exercise;
      return exercise;
    }

    // Si no encuentra exactamente, intentar búsqueda más amplia
    const searchResponse = await exerciseDBApi.get<ExerciseInfo[]>('/exercises');
    const match = searchResponse.data.find(ex =>
      ex.name.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(ex.name.toLowerCase())
    );

    exerciseCache[normalizedName] = match || null;
    return match || null;
  } catch (error) {
    console.warn('Error fetching exercise from ExerciseDB:', error);
    exerciseCache[normalizedName] = null;
    return null;
  }
}

/**
 * Mapeo manual de ejercicios en español a nombres en inglés para mejor match
 */
const spanishToEnglishMap: { [key: string]: string } = {
  // Pecho
  'press banca': 'bench press',
  'press banca con barra': 'barbell bench press',
  'press banca con mancuernas': 'dumbbell bench press',
  'press de banca': 'bench press',
  'press inclinado': 'incline bench press',
  'press banca inclinado': 'incline bench press',
  'press inclinado con mancuernas': 'incline dumbbell press',
  'press cerrado': 'close grip bench press',
  'aperturas con mancuernas': 'dumbbell fly',
  'aperturas en cable': 'cable fly',
  'aperturas en polea': 'cable fly',
  'fondos en paralelas': 'dips',
  'fondos': 'dips',
  'pullover con mancuerna': 'dumbbell pullover',
  'pullover': 'pullover',
  'flexiones': 'push up',

  // Espalda
  'dominadas': 'pull up',
  'dominadas pronadas': 'pull up',
  'dominadas asistidas': 'assisted pull up',
  'jalón al pecho': 'lat pulldown',
  'jalón': 'lat pulldown',
  'remo con barra': 'barbell row',
  'remo con mancuerna': 'dumbbell row',
  'remo en polea': 'cable row',
  'remo en polea baja': 'seated cable row',
  'remo pendlay': 'pendlay row',
  'remo en t': 't bar row',
  'peso muerto': 'deadlift',
  'peso muerto rumano': 'romanian deadlift',
  'hiperextensiones': 'hyperextension',
  'buenos días': 'good morning',
  'face pulls': 'face pull',

  // Hombros
  'press militar': 'military press',
  'press militar con barra': 'overhead press',
  'press militar con mancuernas': 'dumbbell shoulder press',
  'press arnold': 'arnold press',
  'arnold press': 'arnold press',
  'elevaciones laterales': 'lateral raise',
  'elevaciones frontales': 'front raise',
  'pájaros': 'reverse fly',

  // Piernas
  'sentadilla': 'squat',
  'sentadilla con barra': 'barbell squat',
  'sentadillas': 'squat',
  'sentadilla frontal': 'front squat',
  'sentadilla búlgara': 'bulgarian split squat',
  'sentadilla goblet': 'goblet squat',
  'sentadilla sumo': 'sumo squat',
  'prensa': 'leg press',
  'prensa de piernas': 'leg press',
  'prensa a 45': 'leg press',
  'extensión de cuádriceps': 'leg extension',
  'extensiones de cuádriceps': 'leg extension',
  'curl femoral': 'leg curl',
  'curl de isquiotibiales': 'leg curl',
  'curl nórdico': 'nordic curl',
  'zancadas': 'lunge',
  'zancadas con mancuernas': 'dumbbell lunge',
  'zancada': 'lunge',
  'step-ups': 'step up',

  // Glúteos
  'hip thrust': 'hip thrust',
  'hip thrust con barra': 'barbell hip thrust',
  'abducción de cadera': 'hip abduction',
  'abducción en máquina': 'hip abduction machine',

  // Pantorrillas
  'elevaciones de gemelos': 'calf raise',
  'elevaciones de pantorrilla': 'calf raise',
  'elevación de pantorrillas': 'calf raise',

  // Bíceps
  'curl con barra': 'barbell curl',
  'curl de bíceps': 'bicep curl',
  'curl de bíceps con barra': 'barbell curl',
  'curl martillo': 'hammer curl',
  'curl de concentración': 'concentration curl',
  'curl concentrado': 'concentration curl',
  'curl con mancuernas': 'dumbbell curl',
  'curl inclinado': 'incline dumbbell curl',
  'curl con barra ez': 'ez bar curl',

  // Tríceps
  'press francés': 'skull crusher',
  'extensión de tríceps': 'tricep extension',
  'extensiones de tríceps': 'tricep extension',
  'extensión tríceps en polea': 'cable tricep extension',
  'extensiones de tríceps en polea': 'cable pushdown',
  'fondos de tríceps': 'tricep dips',
  'extensión tríceps barra ez': 'ez bar tricep extension',

  // Abdomen
  'plancha': 'plank',
  'plancha abdominal': 'plank',
  'crunches': 'crunch',
  'abdominales': 'crunch',
  'elevaciones de piernas': 'leg raise',
  'sit-ups': 'sit up',
  'abdominales en rueda': 'ab wheel rollout',
  'escaladores': 'mountain climber',
  'mountain climbers': 'mountain climber',

  // CrossFit/Funcional
  'burpees': 'burpee',
  'kettlebell swing': 'kettlebell swing',
  'wall balls': 'wall ball',
  'box jumps': 'box jump',
  'saltos al cajón': 'box jump',
  'saltos en box': 'box jump',
  'farmer walk': 'farmers walk',
  'saltos en estrella': 'jumping jack',
};

/**
 * Busca ejercicio traduciendo el nombre si es necesario
 */
export async function searchExerciseWithTranslation(exerciseName: string): Promise<ExerciseInfo | null> {
  const normalized = exerciseName.toLowerCase().trim();

  // Intentar primero con el nombre original
  let result = await searchExercise(normalized);
  if (result) return result;

  // Si no encuentra, intentar con traducción
  const englishName = spanishToEnglishMap[normalized];
  if (englishName) {
    result = await searchExercise(englishName);
    if (result) return result;
  }

  // Intentar buscar palabras clave del nombre
  for (const [spanish, english] of Object.entries(spanishToEnglishMap)) {
    if (normalized.includes(spanish)) {
      result = await searchExercise(english);
      if (result) return result;
    }
  }

  return null;
}
