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
}

export interface WeightProgressEntry {
  date: string;
  max_weight: number;
}

export interface WeightProgress {
  exercise_name: string;
  entries: WeightProgressEntry[];
}
