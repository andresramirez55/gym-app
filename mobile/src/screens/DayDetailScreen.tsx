import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
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

  const addSet = (exerciseId: number) => {
    const exerciseSets = sets[exerciseId] || [];
    const newSet: SetLog = {
      set_number: exerciseSets.length + 1,
      weight: 0,
      reps: 0,
    };
    setSets({
      ...sets,
      [exerciseId]: [...exerciseSets, newSet],
    });
  };

  const updateSet = (exerciseId: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
    const exerciseSets = [...(sets[exerciseId] || [])];
    exerciseSets[setIndex] = {
      ...exerciseSets[setIndex],
      [field]: parseFloat(value) || 0,
    };
    setSets({
      ...sets,
      [exerciseId]: exerciseSets,
    });
  };

  const removeSet = (exerciseId: number, setIndex: number) => {
    const exerciseSets = sets[exerciseId].filter((_, i) => i !== setIndex);
    setSets({
      ...sets,
      [exerciseId]: exerciseSets,
    });
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
