import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Vibration,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { workoutApi } from '../services/api';
import type { RoutineDay, SetLog } from '../types';

interface Props {
  route: any;
  navigation: any;
}

export default function DayDetailScreen({ route, navigation }: Props) {
  const { day, routineId } = route.params as { day: RoutineDay; routineId?: number };
  const { user } = useAuth();
  const [startTime] = useState(new Date());
  const [sets, setSets] = useState<{ [exerciseId: number]: SetLog[] }>({});
  const [restTimer, setRestTimer] = useState<{ exerciseId: number; timeLeft: number } | null>(null);

  useEffect(() => {
    if (!restTimer) return;
    if (restTimer.timeLeft <= 0) {
      Vibration.vibrate([0, 400, 200, 400]);
      Alert.alert('¡Listo!', '¡Tiempo de descanso terminado!');
      setRestTimer(null);
      return;
    }
    const interval = setInterval(() => {
      setRestTimer(prev => prev ? { ...prev, timeLeft: prev.timeLeft - 1 } : null);
    }, 1000);
    return () => clearInterval(interval);
  }, [restTimer]);

  const startRest = (exerciseId: number, seconds: number) => {
    setRestTimer({ exerciseId, timeLeft: seconds });
  };

  const cancelRest = () => setRestTimer(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
  };

  const addSet = (exerciseId: number) => {
    const exerciseSets = sets[exerciseId] || [];
    const newSet: SetLog = {
      set_number: exerciseSets.length + 1,
      weight: 0,
      reps: 0,
    };
    setSets({ ...sets, [exerciseId]: [...exerciseSets, newSet] });
  };

  const updateSet = (exerciseId: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
    const exerciseSets = [...(sets[exerciseId] || [])];
    exerciseSets[setIndex] = { ...exerciseSets[setIndex], [field]: parseFloat(value) || 0 };
    setSets({ ...sets, [exerciseId]: exerciseSets });
  };

  const removeSet = (exerciseId: number, setIndex: number) => {
    const exerciseSets = sets[exerciseId].filter((_, i) => i !== setIndex);
    setSets({ ...sets, [exerciseId]: exerciseSets });
  };

  const handleFinishWorkout = async () => {
    const exerciseLogs = Object.entries(sets)
      .filter(([_, exerciseSets]) => exerciseSets.length > 0)
      .map(([exerciseId, exerciseSets]) => ({
        exercise_id: parseInt(exerciseId, 10),
        sets: exerciseSets,
      }));

    if (exerciseLogs.length === 0) {
      Alert.alert('Error', 'Debes registrar al menos un ejercicio');
      return;
    }

    const duration = Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60);

    try {
      await workoutApi.log({
        user_id: user!.id,
        routine_id: routineId || 0,
        routine_day_id: day.id,
        duration,
        exercise_logs: exerciseLogs,
      });

      Alert.alert('¡Excelente!', 'Entrenamiento registrado', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el entrenamiento');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{day.day_name}</Text>
        <Text style={styles.subtitle}>{day.exercises.length} ejercicios</Text>
      </View>

      {day.exercises.map((exercise) => {
        const exerciseSets = sets[exercise.id] || [];
        const isResting = restTimer?.exerciseId === exercise.id;

        return (
          <View key={exercise.id} style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseInfo}>
              {exercise.sets} series × {exercise.reps} reps • {exercise.rest_seconds}s descanso
            </Text>
            {exercise.notes && <Text style={styles.notes}>{exercise.notes}</Text>}

            {exerciseSets.map((set, index) => (
              <View key={index} style={styles.setRow}>
                <Text style={styles.setNumber}>Serie {set.set_number}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Peso (kg)"
                  keyboardType="numeric"
                  value={set.weight ? set.weight.toString() : ''}
                  onChangeText={(value) => updateSet(exercise.id, index, 'weight', value)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Reps"
                  keyboardType="numeric"
                  value={set.reps ? set.reps.toString() : ''}
                  onChangeText={(value) => updateSet(exercise.id, index, 'reps', value)}
                />
                <TouchableOpacity onPress={() => removeSet(exercise.id, index)}>
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addButton} onPress={() => addSet(exercise.id)}>
              <Text style={styles.addButtonText}>+ Agregar Serie</Text>
            </TouchableOpacity>

            {/* Rest Timer */}
            {isResting ? (
              <View style={styles.timerContainer}>
                <View style={styles.timerCircle}>
                  <Text style={styles.timerTime}>{formatTime(restTimer!.timeLeft)}</Text>
                  <Text style={styles.timerLabel}>descansando</Text>
                </View>
                <TouchableOpacity style={styles.cancelTimerButton} onPress={cancelRest}>
                  <Text style={styles.cancelTimerText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.restButton}
                onPress={() => startRest(exercise.id, exercise.rest_seconds)}
              >
                <Text style={styles.restButtonText}>
                  ⏱  Iniciar descanso ({exercise.rest_seconds}s)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      <TouchableOpacity style={styles.finishButton} onPress={handleFinishWorkout}>
        <Text style={styles.finishButtonText}>✓ Finalizar Entrenamiento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  exerciseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  exerciseInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    color: '#007AFF',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  setNumber: {
    fontSize: 14,
    fontWeight: '500',
    width: 60,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  removeButton: {
    fontSize: 20,
    color: '#FF3B30',
    padding: 8,
  },
  addButton: {
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  restButton: {
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  restButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  timerCircle: {
    alignItems: 'center',
  },
  timerTime: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  timerLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cancelTimerButton: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#FF9500',
  },
  cancelTimerText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  finishButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 18,
    margin: 20,
    alignItems: 'center',
  },
  finishButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
