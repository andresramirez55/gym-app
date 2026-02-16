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
} from '../types';
import {
  mockUserApi,
  mockRoutineApi,
  mockWorkoutApi,
  mockStorage,
} from './mockApi';
import { API_BASE_URL, USE_MOCK_API } from '../config/environment';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

  update: async (id: number, data: Partial<CreateUserRequest>): Promise<User> => {
    if (USE_MOCK_API) return mockUserApi.update(id, data);
    const response = await api.put<User>(`/api/users?id=${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK_API) return mockUserApi.delete(id);
    await api.delete(`/api/users?id=${id}`);
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
