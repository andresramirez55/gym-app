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
  gifUrl: string;
  target: string; // Músculo objetivo
  bodyPart: string; // Parte del cuerpo
  equipment: string; // Equipo necesario
  instructions?: string[];
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
  'press banca': 'bench press',
  'press banca con barra': 'barbell bench press',
  'press inclinado': 'incline bench press',
  'sentadilla': 'squat',
  'sentadilla con barra': 'barbell squat',
  'peso muerto': 'deadlift',
  'peso muerto rumano': 'romanian deadlift',
  'dominadas': 'pull up',
  'remo con barra': 'barbell row',
  'curl con barra': 'barbell curl',
  'press militar': 'military press',
  'press arnold': 'arnold press',
  'elevaciones laterales': 'lateral raise',
  'fondos': 'dips',
  'hip thrust': 'hip thrust',
  'zancadas': 'lunge',
  'prensa': 'leg press',
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
