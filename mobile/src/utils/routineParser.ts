/**
 * Parser para formato de rutinas
 *
 * Formato esperado:
 * NOMBRE: Rutina PPL
 * DURACION: 8
 * OBJETIVO: gain_muscle
 * FRECUENCIA: 6
 *
 * DIA 1: Push
 * Press banca | 4 | 8-10 | 90
 * Press inclinado | 3 | 10-12 | 60
 *
 * DIA 2: Pull
 * ...
 */

export interface ParsedRoutine {
  name: string;
  duration_weeks: number;
  goal: 'gain_muscle' | 'lose_weight' | 'strength' | 'endurance';
  frequency: number;
  days: ParsedDay[];
}

export interface ParsedDay {
  day_name: string;
  exercises: ParsedExercise[];
}

export interface ParsedExercise {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
}

export interface ParseError {
  line: number;
  message: string;
}

export interface ParseResult {
  success: boolean;
  routine?: ParsedRoutine;
  errors?: ParseError[];
}

const VALID_GOALS = ['gain_muscle', 'lose_weight', 'strength', 'endurance'];

export function parseRoutineText(text: string): ParseResult {
  const errors: ParseError[] = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  if (lines.length === 0) {
    return { success: false, errors: [{ line: 0, message: 'El texto está vacío' }] };
  }

  // Parse header
  let name: string | null = null;
  let duration_weeks: number | null = null;
  let goal: string | null = null;
  let frequency: number | null = null;

  const days: ParsedDay[] = [];
  let currentDay: ParsedDay | null = null;
  let lineNumber = 0;

  for (const line of lines) {
    lineNumber++;

    // Skip empty lines
    if (!line) continue;

    // Parse header fields
    if (line.toUpperCase().startsWith('NOMBRE:')) {
      name = line.substring(7).trim();
      if (!name) {
        errors.push({ line: lineNumber, message: 'El nombre no puede estar vacío' });
      }
      continue;
    }

    if (line.toUpperCase().startsWith('DURACION:')) {
      const durationStr = line.substring(9).trim();
      duration_weeks = parseInt(durationStr);
      if (isNaN(duration_weeks) || duration_weeks < 1 || duration_weeks > 52) {
        errors.push({ line: lineNumber, message: 'Duración debe ser un número entre 1 y 52' });
      }
      continue;
    }

    if (line.toUpperCase().startsWith('OBJETIVO:')) {
      goal = line.substring(9).trim().toLowerCase();
      if (!VALID_GOALS.includes(goal)) {
        errors.push({
          line: lineNumber,
          message: `Objetivo debe ser uno de: ${VALID_GOALS.join(', ')}`
        });
      }
      continue;
    }

    if (line.toUpperCase().startsWith('FRECUENCIA:')) {
      const freqStr = line.substring(11).trim();
      frequency = parseInt(freqStr);
      if (isNaN(frequency) || frequency < 1 || frequency > 7) {
        errors.push({ line: lineNumber, message: 'Frecuencia debe ser un número entre 1 y 7' });
      }
      continue;
    }

    // Parse day header
    if (line.toUpperCase().startsWith('DIA ')) {
      // Save previous day if exists
      if (currentDay && currentDay.exercises.length > 0) {
        days.push(currentDay);
      }

      // Extract day name (everything after "DIA X:")
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) {
        errors.push({ line: lineNumber, message: 'Formato de día inválido. Use: DIA X: Nombre' });
        continue;
      }

      const dayName = line.substring(colonIndex + 1).trim();
      if (!dayName) {
        errors.push({ line: lineNumber, message: 'El nombre del día no puede estar vacío' });
        continue;
      }

      currentDay = {
        day_name: dayName,
        exercises: []
      };
      continue;
    }

    // Parse exercise (must be after a day header)
    if (!currentDay) {
      errors.push({
        line: lineNumber,
        message: 'Ejercicio encontrado antes de declarar un día. Use: DIA X: Nombre'
      });
      continue;
    }

    // Exercise format: name | sets | reps | rest_seconds
    const parts = line.split('|').map(p => p.trim());

    if (parts.length < 3) {
      errors.push({
        line: lineNumber,
        message: 'Formato de ejercicio inválido. Use: nombre | series | reps | descanso'
      });
      continue;
    }

    const exerciseName = parts[0];
    const setsStr = parts[1];
    const repsStr = parts[2];
    const restStr = parts[3] || '60'; // Default 60s

    if (!exerciseName) {
      errors.push({ line: lineNumber, message: 'El nombre del ejercicio no puede estar vacío' });
      continue;
    }

    const sets = parseInt(setsStr);
    if (isNaN(sets) || sets < 1 || sets > 20) {
      errors.push({ line: lineNumber, message: 'Series debe ser un número entre 1 y 20' });
      continue;
    }

    // Validate reps (can be a number or range like "8-10")
    if (!repsStr || !/^\d+(-\d+)?$/.test(repsStr)) {
      errors.push({
        line: lineNumber,
        message: 'Reps debe ser un número (ej: 10) o rango (ej: 8-10)'
      });
      continue;
    }

    const rest_seconds = parseInt(restStr);
    if (isNaN(rest_seconds) || rest_seconds < 0 || rest_seconds > 600) {
      errors.push({ line: lineNumber, message: 'Descanso debe ser un número entre 0 y 600 segundos' });
      continue;
    }

    // Add exercise to current day
    currentDay.exercises.push({
      name: exerciseName,
      sets,
      reps: repsStr,
      rest_seconds,
    });
  }

  // Save last day
  if (currentDay && currentDay.exercises.length > 0) {
    days.push(currentDay);
  }

  // Validate required fields
  if (!name) {
    errors.push({ line: 0, message: 'Falta el campo NOMBRE:' });
  }
  if (!duration_weeks) {
    errors.push({ line: 0, message: 'Falta el campo DURACION:' });
  }
  if (!goal) {
    errors.push({ line: 0, message: 'Falta el campo OBJETIVO:' });
  }
  if (!frequency) {
    errors.push({ line: 0, message: 'Falta el campo FRECUENCIA:' });
  }
  if (days.length === 0) {
    errors.push({ line: 0, message: 'No se encontraron días de entrenamiento' });
  }

  // If there are errors, return them
  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Return parsed routine
  return {
    success: true,
    routine: {
      name: name!,
      duration_weeks: duration_weeks!,
      goal: goal as any,
      frequency: frequency!,
      days,
    }
  };
}

export const EXAMPLE_FORMAT = `NOMBRE: Rutina PPL 6 días
DURACION: 8
OBJETIVO: gain_muscle
FRECUENCIA: 6

DIA 1: Push (Pecho/Hombros/Tríceps)
Press banca | 4 | 8-10 | 90
Press inclinado | 3 | 10-12 | 60
Aperturas | 3 | 12-15 | 45
Press militar | 4 | 8-10 | 90
Elevaciones laterales | 3 | 12-15 | 45

DIA 2: Pull (Espalda/Bíceps)
Dominadas | 4 | 8-10 | 90
Remo con barra | 4 | 8-10 | 90
Jalones | 3 | 10-12 | 60
Curl con barra | 3 | 10-12 | 60

DIA 3: Legs (Piernas)
Sentadilla | 4 | 8-10 | 120
Prensa | 3 | 10-12 | 90
Peso muerto rumano | 3 | 10-12 | 90
Curl femoral | 3 | 12-15 | 60`;
