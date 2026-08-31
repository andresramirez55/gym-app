import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  User,
  CreateUserRequest,
  Routine,
  GenerateRoutineRequest,
  LogWorkoutRequest,
  WorkoutLog,
  WeightProgress,
  RoutineSuggestion,
} from '../types';
import {
  mockUserApi,
  mockRoutineApi,
  mockWorkoutApi,
  mockStorage,
} from './mockApi';
import { API_BASE_URL, USE_MOCK_API } from '../config/environment';

console.log('🔧 API Configuration loaded:');
console.log('  API_BASE_URL:', API_BASE_URL);
console.log('  USE_MOCK_API:', USE_MOCK_API);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error Response:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

// User API
export const userApi = {
  create: async (data: CreateUserRequest): Promise<User> => {
    if (USE_MOCK_API) return mockUserApi.create(data);
    const response = await api.post<User>('/api/users', data);
    return response.data;
  },

  get: async (id: number): Promise<User> => {
    if (USE_MOCK_API) return mockUserApi.get(id);
    const response = await api.get<User>(`/api/users?id=${id}`);
    return response.data;
  },

  getByEmail: async (email: string): Promise<User> => {
    if (USE_MOCK_API) return mockUserApi.get(1);
    const response = await api.get<User>(`/api/users?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateUserRequest>): Promise<User> => {
    if (USE_MOCK_API) return mockUserApi.update(id, data);
    const response = await api.put<User>(`/api/users?id=${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK_API) return mockUserApi.delete(id);
    await api.delete(`/api/users?id=${id}`);
  },

  registerPushToken: async (userId: number, pushToken: string): Promise<void> => {
    if (USE_MOCK_API) return;
    await api.put(`/api/users/push-token?user_id=${userId}`, { push_token: pushToken });
  },
};

// Routine suggestion API (prompt manual para pedirle a Claude la próxima rutina)
export const suggestionApi = {
  getCurrent: async (userId: number): Promise<RoutineSuggestion | null> => {
    if (USE_MOCK_API) return null;
    try {
      const response = await api.get<RoutineSuggestion>(`/api/routines/suggestions?user_id=${userId}`);
      return response.data;
    } catch (error) {
      return null; // 404 = no hay ninguna sugerencia activa
    }
  },

  submitAnswer: async (suggestionId: number, answer: string): Promise<RoutineSuggestion> => {
    const response = await api.post<RoutineSuggestion>(
      `/api/routines/suggestions/submit?id=${suggestionId}`,
      { answer }
    );
    return response.data;
  },

  apply: async (suggestionId: number): Promise<{ routine_id: number }> => {
    const response = await api.post(`/api/routines/suggestions/apply?id=${suggestionId}`);
    return response.data;
  },

  dismiss: async (suggestionId: number): Promise<void> => {
    await api.post(`/api/routines/suggestions/dismiss?id=${suggestionId}`);
  },
};

// Routine API
export const routineApi = {
  generate: async (data: GenerateRoutineRequest): Promise<Routine> => {
    if (USE_MOCK_API) return mockRoutineApi.generate(data);
    const response = await api.post<Routine>('/api/routines/generate', data);
    return response.data;
  },

  get: async (id: number): Promise<Routine> => {
    if (USE_MOCK_API) return mockRoutineApi.get(id);
    const response = await api.get<Routine>(`/api/routines?id=${id}`);
    return response.data;
  },

  getActive: async (userId: number): Promise<Routine> => {
    if (USE_MOCK_API) return mockRoutineApi.getActive(userId);
    const response = await api.get<Routine>(`/api/routines/active?user_id=${userId}`);
    return response.data;
  },

  create: async (data: {
    user_id: number;
    name: string;
    goal: string;
    duration_weeks: number;
    frequency: number;
    days: Array<{
      day_name: string;
      exercises: Array<{
        name: string;
        sets: number;
        reps: string;
        rest_seconds: number;
        notes: string;
      }>;
    }>;
  }): Promise<Routine> => {
    const response = await api.post<Routine>('/api/routines', data);
    return response.data;
  },

  import: async (data: {
    user_id: number;
    text: string;
    goal: string;
    duration_weeks: number;
    frequency: number;
  }): Promise<Routine> => {
    const response = await api.post<Routine>('/api/routines/import', data);
    return response.data;
  },

  updateExercise: async (
    exerciseId: number,
    data: { name: string; sets: number; reps: string; rest_seconds: number; notes: string }
  ): Promise<void> => {
    await api.put(`/api/exercises?id=${exerciseId}`, data);
  },
};

// Workout API
export const workoutApi = {
  log: async (data: LogWorkoutRequest): Promise<{ id: number; completed_at: string; duration: number }> => {
    if (USE_MOCK_API) return mockWorkoutApi.log(data);
    const response = await api.post('/api/workouts/log', data);
    return response.data;
  },

  getHistory: async (userId: number, limit: number = 10): Promise<WorkoutLog[]> => {
    if (USE_MOCK_API) return mockWorkoutApi.getHistory(userId, limit);
    const response = await api.get<WorkoutLog[]>(
      `/api/workouts/history?user_id=${userId}&limit=${limit}`
    );
    return response.data;
  },

  getProgress: async (userId: number, exerciseId: number): Promise<WeightProgress> => {
    if (USE_MOCK_API) return mockWorkoutApi.getProgress(userId, exerciseId);
    const response = await api.get<WeightProgress>(
      `/api/workouts/progress?user_id=${userId}&exercise_id=${exerciseId}`
    );
    return response.data;
  },

  deleteLog: async (userId: number, logId: number): Promise<void> => {
    await api.delete(`/api/workouts/history?user_id=${userId}&id=${logId}`);
  },

  deleteAll: async (userId: number): Promise<void> => {
    await api.delete(`/api/workouts/history?user_id=${userId}`);
  },
};

// Storage helper for user session
export const storage = {
  saveUserId: async (userId: number) => {
    if (USE_MOCK_API) return mockStorage.saveUserId(userId);
    await AsyncStorage.setItem('userId', userId.toString());
  },

  getUserId: async (): Promise<number | null> => {
    if (USE_MOCK_API) return mockStorage.getUserId();
    const id = await AsyncStorage.getItem('userId');
    return id ? parseInt(id, 10) : null;
  },

  clearUserId: async () => {
    if (USE_MOCK_API) return mockStorage.clearUserId();
    await AsyncStorage.removeItem('userId');
  },
};
