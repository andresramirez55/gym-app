// Mock API para testing sin backend
import type {
  User,
  CreateUserRequest,
  Routine,
  GenerateRoutineRequest,
  LogWorkoutRequest,
  WorkoutLog,
  WeightProgress,
} from '../types';

// Datos de prueba
const mockUser: User = {
  id: 1,
  name: 'Juan Pérez',
  email: 'juan@example.com',
  goal: 'gain_muscle',
  frequency: 5,
  created_at: '2024-01-15 10:00:00',
};

const mockRoutine: Routine = {
  id: 1,
  user_id: 1,
  name: 'Rutina de Hipertrofia 5 Días',
  description: 'Rutina diseñada para maximizar la ganancia muscular con 5 días de entrenamiento por semana',
  goal: 'gain_muscle',
  frequency: 5,
  is_active: true,
  days: [
    {
      id: 1,
      day_number: 1,
      day_name: 'Día 1 - Pecho y Tríceps',
      exercises: [
        {
          id: 1,
          routine_day_id: 1,
          name: 'Press Banca',
          sets: 4,
          reps: 10,
          rest_seconds: 90,
          order: 1,
          notes: 'Baja la barra hasta tocar el pecho',
          created_at: '2024-01-15 10:00:00',
        },
        {
          id: 2,
          routine_day_id: 1,
          name: 'Press Inclinado con Mancuernas',
          sets: 3,
          reps: 12,
          rest_seconds: 60,
          order: 2,
          created_at: '2024-01-15 10:00:00',
        },
        {
          id: 3,
          routine_day_id: 1,
          name: 'Aperturas con Mancuernas',
          sets: 3,
          reps: 15,
          rest_seconds: 60,
          order: 3,
          created_at: '2024-01-15 10:00:00',
        },
        {
          id: 4,
          routine_day_id: 1,
          name: 'Fondos en Paralelas',
          sets: 3,
          reps: 12,
          rest_seconds: 60,
          order: 4,
          created_at: '2024-01-15 10:00:00',
        },
        {
          id: 5,
          routine_day_id: 1,
          name: 'Press Francés',
          sets: 3,
          reps: 12,
          rest_seconds: 60,
          order: 5,
          created_at: '2024-01-15 10:00:00',
        },
      ],
    },
    {
      id: 2,
      day_number: 2,
      day_name: 'Día 2 - Espalda y Bíceps',
      exercises: [
        {
          id: 6,
          routine_day_id: 2,
          name: 'Dominadas',
          sets: 4,
          reps: 10,
          rest_seconds: 90,
          order: 1,
          created_at: '2024-01-15 10:00:00',
        },
        {
          id: 7,
          routine_day_id: 2,
          name: 'Remo con Barra',
          sets: 4,
          reps: 10,
          rest_seconds: 90,
          order: 2,
          created_at: '2024-01-15 10:00:00',
        },
        {
          id: 8,
          routine_day_id: 2,
          name: 'Jalón al Pecho',
          sets: 3,
          reps: 12,
          rest_seconds: 60,
          order: 3,
          created_at: '2024-01-15 10:00:00',
        },
        {
          id: 9,
          routine_day_id: 2,
          name: 'Curl con Barra',
          sets: 3,
          reps: 12,
          rest_seconds: 60,
          order: 4,
          created_at: '2024-01-15 10:00:00',
        },
      ],
    },
    {
      id: 3,
      day_number: 3,
      day_name: 'Día 3 - Piernas',
      exercises: [
        {
          id: 10,
          routine_day_id: 3,
          name: 'Sentadillas',
          sets: 4,
          reps: 10,
          rest_seconds: 120,
          order: 1,
          notes: 'Baja hasta romper paralelo',
          created_at: '2024-01-15 10:00:00',
        },
        {
          id: 11,
          routine_day_id: 3,
          name: 'Prensa de Piernas',
          sets: 4,
          reps: 12,
          rest_seconds: 90,
          order: 2,
          created_at: '2024-01-15 10:00:00',
        },
        {
          id: 12,
          routine_day_id: 3,
          name: 'Peso Muerto Rumano',
          sets: 3,
          reps: 12,
          rest_seconds: 90,
          order: 3,
          created_at: '2024-01-15 10:00:00',
        },
        {
          id: 13,
          routine_day_id: 3,
          name: 'Extensiones de Cuádriceps',
          sets: 3,
          reps: 15,
          rest_seconds: 60,
          order: 4,
          created_at: '2024-01-15 10:00:00',
        },
      ],
    },
    {
      id: 4,
      day_number: 4,
      day_name: 'Día 4 - Hombros',
      exercises: [
        {
          id: 14,
          routine_day_id: 4,
          name: 'Press Militar',
          sets: 4,
          reps: 10,
          rest_seconds: 90,
          order: 1,
          created_at: '2024-01-15 10:00:00',
        },
        {
          id: 15,
          routine_day_id: 4,
          name: 'Elevaciones Laterales',
          sets: 4,
          reps: 12,
          rest_seconds: 60,
          order: 2,
          created_at: '2024-01-15 10:00:00',
        },
        {
          id: 16,
          routine_day_id: 4,
          name: 'Pájaros',
          sets: 3,
          reps: 15,
          rest_seconds: 60,
          order: 3,
          created_at: '2024-01-15 10:00:00',
        },
      ],
    },
    {
      id: 5,
      day_number: 5,
      day_name: 'Día 5 - Full Body',
      exercises: [
        {
          id: 17,
          routine_day_id: 5,
          name: 'Peso Muerto',
          sets: 4,
          reps: 8,
          rest_seconds: 120,
          order: 1,
          created_at: '2024-01-15 10:00:00',
        },
        {
          id: 18,
          routine_day_id: 5,
          name: 'Press Banca',
          sets: 3,
          reps: 10,
          rest_seconds: 90,
          order: 2,
          created_at: '2024-01-15 10:00:00',
        },
        {
          id: 19,
          routine_day_id: 5,
          name: 'Sentadillas',
          sets: 3,
          reps: 10,
          rest_seconds: 90,
          order: 3,
          created_at: '2024-01-15 10:00:00',
        },
      ],
    },
  ],
  created_at: '2024-01-15 10:00:00',
};

const mockWorkoutHistory: WorkoutLog[] = [
  {
    id: 1,
    routine_day_id: 1,
    completed_at: '2024-02-14 18:30:00',
    duration: 65,
    exercise_logs: [
      {
        exercise_name: 'Press Banca',
        sets: [
          { set_number: 1, weight: 80, reps: 10 },
          { set_number: 2, weight: 80, reps: 9 },
          { set_number: 3, weight: 80, reps: 8 },
          { set_number: 4, weight: 75, reps: 10 },
        ],
      },
      {
        exercise_name: 'Press Inclinado con Mancuernas',
        sets: [
          { set_number: 1, weight: 30, reps: 12 },
          { set_number: 2, weight: 30, reps: 11 },
          { set_number: 3, weight: 30, reps: 10 },
        ],
      },
    ],
  },
  {
    id: 2,
    routine_day_id: 2,
    completed_at: '2024-02-13 19:00:00',
    duration: 70,
    exercise_logs: [
      {
        exercise_name: 'Dominadas',
        sets: [
          { set_number: 1, weight: 0, reps: 10 },
          { set_number: 2, weight: 0, reps: 9 },
          { set_number: 3, weight: 0, reps: 8 },
          { set_number: 4, weight: 0, reps: 7 },
        ],
      },
    ],
  },
];

// Simular delay de red
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockUserApi = {
  create: async (data: CreateUserRequest): Promise<User> => {
    await delay(500);
    return {
      ...mockUser,
      ...data,
      id: Math.floor(Math.random() * 1000),
      created_at: new Date().toISOString(),
    };
  },

  get: async (id: number): Promise<User> => {
    await delay(300);
    return mockUser;
  },

  update: async (id: number, data: Partial<CreateUserRequest>): Promise<User> => {
    await delay(300);
    return { ...mockUser, ...data };
  },

  delete: async (id: number): Promise<void> => {
    await delay(300);
  },
};

export const mockRoutineApi = {
  generate: async (data: GenerateRoutineRequest): Promise<Routine> => {
    await delay(2000); // Simular generación con IA
    return mockRoutine;
  },

  get: async (id: number): Promise<Routine> => {
    await delay(300);
    return mockRoutine;
  },

  getActive: async (userId: number): Promise<Routine> => {
    await delay(300);
    return mockRoutine;
  },
};

export const mockWorkoutApi = {
  log: async (data: LogWorkoutRequest): Promise<{ id: number; completed_at: string; duration: number }> => {
    await delay(500);
    return {
      id: Math.floor(Math.random() * 1000),
      completed_at: new Date().toISOString(),
      duration: data.duration,
    };
  },

  getHistory: async (userId: number, limit: number = 10): Promise<WorkoutLog[]> => {
    await delay(500);
    return mockWorkoutHistory;
  },

  getProgress: async (userId: number, exerciseId: number): Promise<WeightProgress> => {
    await delay(500);
    return {
      exercise_name: 'Press Banca',
      entries: [
        { date: '2024-02-01', max_weight: 75 },
        { date: '2024-02-05', max_weight: 77.5 },
        { date: '2024-02-08', max_weight: 80 },
        { date: '2024-02-12', max_weight: 80 },
        { date: '2024-02-15', max_weight: 82.5 },
      ],
    };
  },
};

export const mockStorage = {
  saveUserId: async (userId: number) => {
    // En mock mode solo guardamos en memoria
  },

  getUserId: async (): Promise<number | null> => {
    return null; // Siempre empezar sin usuario en mock mode
  },

  clearUserId: async () => {
    // No hacer nada
  },
};
