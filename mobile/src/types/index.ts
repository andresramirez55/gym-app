// User types
export interface User {
  id: number;
  name: string;
  email: string;
  goal: string;
  frequency: number;
  created_at: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  goal: string;
  frequency: number;
}

// Routine types
export interface Exercise {
  id: number;
  routine_day_id: number;
  name: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  order: number;
  notes?: string;
  created_at: string;
}

export interface RoutineDay {
  id: number;
  day_number: number;
  day_name: string;
  exercises: Exercise[];
}

export interface Routine {
  id: number;
  user_id: number;
  name: string;
  description: string;
  goal: string;
  frequency: number;
  is_active: boolean;
  duration_weeks: number;
  week_number: number;
  days_remaining: number;
  days: RoutineDay[];
  created_at: string;
}

export interface GenerateRoutineRequest {
  user_id: number;
  goal: string;
  frequency: number;
}

// Workout types
export interface SetLog {
  set_number: number;
  weight: number;
  reps: number;
  rir?: number; // Reps in Reserve (0-4+), opcional
}

export interface ExerciseLog {
  exercise_id: number;
  sets: SetLog[];
}

export interface LogWorkoutRequest {
  user_id: number;
  routine_id: number;
  routine_day_id: number;
  duration: number;
  exercise_logs: ExerciseLog[];
  notes?: string;
}

export interface ExerciseLogDetail {
  exercise_name: string;
  sets: SetLog[];
}

export interface WorkoutLog {
  id: number;
  routine_day_id: number;
  completed_at: string;
  duration: number;
  exercise_logs: ExerciseLogDetail[];
  notes?: string;
}

// Routine suggestion types (sugerencia automática de Claude al completar un ciclo)
export interface RoutineSuggestionExercise {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
}

export interface RoutineSuggestionDay {
  day_name: string;
  exercises: RoutineSuggestionExercise[];
}

export interface RoutineSuggestionPreview {
  user_id: number;
  name: string;
  goal: string;
  duration_weeks: number;
  frequency: number;
  days: RoutineSuggestionDay[];
}

export interface RoutineSuggestion {
  id: number;
  routine_id: number;
  diagnosis: string;
  routine: RoutineSuggestionPreview;
  created_at: string;
}

export interface WeightProgressEntry {
  date: string;
  max_weight: number;
}

export interface WeightProgress {
  exercise_name: string;
  entries: WeightProgressEntry[];
}
