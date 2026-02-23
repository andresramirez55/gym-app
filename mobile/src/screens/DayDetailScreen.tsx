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
  StatusBar,
  Linking,
  Modal,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { workoutApi, routineApi } from '../services/api';
import type { RoutineDay, SetLog, WorkoutLog } from '../types';
import { getExerciseAlternatives, type ExerciseAlternative } from '../constants/exerciseAlternatives';
import { searchExerciseWithTranslation, type ExerciseInfo } from '../services/exerciseDB';

interface Props {
  route: any;
  navigation: any;
}

const PRIMARY = '#5E5CE6';

export default function DayDetailScreen({ route, navigation }: Props) {
  const { day, routineId } = route.params as { day: RoutineDay; routineId?: number };
  const { user } = useAuth();
  const [startTime] = useState(new Date());
  const [sets, setSets] = useState<{ [exerciseId: number]: SetLog[] }>({});
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [restTimer, setRestTimer] = useState<{ exerciseId: number; timeLeft: number } | null>(null);
  const [lastSession, setLastSession] = useState<{ [exerciseName: string]: SetLog[] }>({});
  const [replacementModal, setReplacementModal] = useState<{ visible: boolean; exerciseId: number; exerciseName: string } | null>(null);
  const [exerciseInfoModal, setExerciseInfoModal] = useState<{ visible: boolean; exerciseName: string; info: ExerciseInfo | null; loading: boolean } | null>(null);

  const storageKey = `workout_progress_${day.id}`;

  // Restore in-progress workout on mount + load last session
  useEffect(() => {
    AsyncStorage.getItem(storageKey).then((saved) => {
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.sets) setSets(parsed.sets);
          if (parsed.completedExercises) {
            setCompletedExercises(new Set(parsed.completedExercises));
          }
        } catch (_) {}
      }
    });

    // Load last session data for each exercise
    workoutApi.getHistory(user!.id, 10).then((history: WorkoutLog[]) => {
      const map: { [exerciseName: string]: SetLog[] } = {};
      for (const log of history) {
        for (const exLog of log.exercise_logs) {
          if (!map[exLog.exercise_name] && exLog.sets.length > 0) {
            map[exLog.exercise_name] = exLog.sets;
          }
        }
      }
      setLastSession(map);
    }).catch(() => {});
  }, []);

  // Auto-save whenever sets or completedExercises change
  useEffect(() => {
    AsyncStorage.setItem(
      storageKey,
      JSON.stringify({ sets, completedExercises: Array.from(completedExercises) })
    );
  }, [sets, completedExercises]);

  // Rest timer countdown
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

  const openExerciseInfo = async (exerciseName: string) => {
    setExerciseInfoModal({ visible: true, exerciseName, info: null, loading: true });

    try {
      const info = await searchExerciseWithTranslation(exerciseName);
      setExerciseInfoModal({ visible: true, exerciseName, info, loading: false });
    } catch (error) {
      setExerciseInfoModal({ visible: true, exerciseName, info: null, loading: false });
    }
  };

  const closeExerciseInfo = () => setExerciseInfoModal(null);

  const openYouTubeFallback = (exerciseName: string) => {
    const query = encodeURIComponent(`como hacer ${exerciseName}`);
    Linking.openURL(`https://www.youtube.com/results?search_query=${query}`);
  };

  const openReplaceModal = (exerciseId: number, exerciseName: string) => {
    setReplacementModal({ visible: true, exerciseId, exerciseName });
  };

  const closeReplaceModal = () => {
    setReplacementModal(null);
  };

  const handleReplaceExercise = async (newExerciseName: string) => {
    if (!replacementModal) return;

    try {
      const exerciseToUpdate = day.exercises.find(ex => ex.id === replacementModal.exerciseId);
      if (!exerciseToUpdate) return;

      await routineApi.updateExercise(replacementModal.exerciseId, {
        name: newExerciseName,
        sets: exerciseToUpdate.sets,
        reps: exerciseToUpdate.reps,
        rest_seconds: exerciseToUpdate.rest_seconds,
        notes: exerciseToUpdate.notes || '',
      });

      Alert.alert('¡Listo!', `Ejercicio reemplazado: ${replacementModal.exerciseName} → ${newExerciseName}`, [
        { text: 'OK', onPress: () => {
          closeReplaceModal();
          navigation.goBack();
        }},
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo reemplazar el ejercicio');
    }
  };

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

  const completeExercise = (exerciseId: number) => {
    const exerciseSets = sets[exerciseId] || [];
    if (exerciseSets.length === 0) {
      Alert.alert('Sin series', 'Agrega al menos una serie antes de completar el ejercicio.');
      return;
    }
    const updated = new Set(completedExercises);
    updated.add(exerciseId);
    setCompletedExercises(updated);
  };

  const uncompleteExercise = (exerciseId: number) => {
    const updated = new Set(completedExercises);
    updated.delete(exerciseId);
    setCompletedExercises(updated);
  };

  const handleFinishWorkout = async () => {
    const exerciseLogs = Object.entries(sets)
      .filter(([_, exerciseSets]) => exerciseSets.length > 0)
      .map(([exerciseId, exerciseSets]) => ({
        exercise_id: parseInt(exerciseId, 10),
        sets: exerciseSets,
      }));

    if (exerciseLogs.length === 0) {
      Alert.alert('Sin datos', 'Registrá al menos un ejercicio antes de finalizar.');
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

      await AsyncStorage.removeItem(storageKey);

      Alert.alert('¡Excelente! 💪', `Entrenamiento de ${duration || 1} min registrado`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el entrenamiento');
    }
  };

  const completedCount = completedExercises.size;
  const totalCount = day.exercises.length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{day.day_name}</Text>
        <View style={styles.progressChip}>
          <Text style={styles.progressChipText}>{completedCount}/{totalCount} listos</Text>
        </View>
      </View>

      <View style={styles.content}>
        {day.exercises.map((exercise, exIndex) => {
          const exerciseSets = sets[exercise.id] || [];
          const isResting = restTimer?.exerciseId === exercise.id;
          const isDone = completedExercises.has(exercise.id);

          return (
            <View
              key={exercise.id}
              style={[styles.exerciseCard, isDone && styles.exerciseCardDone]}
            >
              {/* Card header */}
              <View style={styles.cardHeader}>
                <View style={[styles.exNumber, isDone && styles.exNumberDone]}>
                  <Text style={styles.exNumberText}>{exIndex + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.exerciseNameRow}>
                    <Text style={[styles.exerciseName, isDone && styles.exerciseNameDone, { flex: 1 }]}>
                      {exercise.name}
                    </Text>
                    <TouchableOpacity
                      style={styles.replaceBtn}
                      onPress={() => openReplaceModal(exercise.id, exercise.name)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.replaceBtnText}>⇄</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.infoBtn}
                      onPress={() => openExerciseInfo(exercise.name)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.infoBtnText}>ℹ️</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.exerciseMeta}>
                    {exercise.sets} × {exercise.reps} reps · {exercise.rest_seconds}s descanso
                  </Text>
                  {lastSession[exercise.name] && (
                    <Text style={styles.lastSessionText}>
                      Última vez: {lastSession[exercise.name].map(s =>
                        s.weight > 0 ? `${s.weight}kg×${s.reps}` : `${s.reps} reps`
                      ).join(' · ')}
                    </Text>
                  )}
                </View>
                {isDone && (
                  <TouchableOpacity onPress={() => uncompleteExercise(exercise.id)} style={styles.editBtn}>
                    <Text style={styles.editBtnText}>Editar</Text>
                  </TouchableOpacity>
                )}
              </View>

              {exercise.notes ? (
                <View style={styles.notesRow}>
                  <Text style={styles.notesText}>💡 {exercise.notes}</Text>
                </View>
              ) : null}

              {/* Sets */}
              {exerciseSets.length > 0 && (
                <View style={styles.setsTable}>
                  <View style={styles.setsTableHeader}>
                    <Text style={[styles.setsTableLabel, { width: 52 }]}>SERIE</Text>
                    <Text style={[styles.setsTableLabel, { flex: 1 }]}>PESO (kg)</Text>
                    <Text style={[styles.setsTableLabel, { flex: 1 }]}>REPS</Text>
                    {!isDone && <View style={{ width: 36 }} />}
                  </View>
                  {exerciseSets.map((set, index) => (
                    <View key={index} style={styles.setRow}>
                      <View style={styles.setNumberBadge}>
                        <Text style={styles.setNumberText}>{set.set_number}</Text>
                      </View>
                      <TextInput
                        style={[styles.setInput, isDone && styles.setInputDone]}
                        placeholder="0"
                        placeholderTextColor="#C0C0C8"
                        keyboardType="numeric"
                        editable={!isDone}
                        value={set.weight ? set.weight.toString() : ''}
                        onChangeText={(v) => updateSet(exercise.id, index, 'weight', v)}
                      />
                      <TextInput
                        style={[styles.setInput, isDone && styles.setInputDone]}
                        placeholder="0"
                        placeholderTextColor="#C0C0C8"
                        keyboardType="numeric"
                        editable={!isDone}
                        value={set.reps ? set.reps.toString() : ''}
                        onChangeText={(v) => updateSet(exercise.id, index, 'reps', v)}
                      />
                      {!isDone && (
                        <TouchableOpacity
                          style={styles.removeBtn}
                          onPress={() => removeSet(exercise.id, index)}
                        >
                          <Text style={styles.removeBtnText}>✕</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {!isDone && (
                <>
                  <TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(exercise.id)}>
                    <Text style={styles.addSetBtnText}>+ Agregar serie</Text>
                  </TouchableOpacity>

                  {exerciseSets.length > 0 && (
                    <TouchableOpacity
                      style={styles.completeBtn}
                      onPress={() => completeExercise(exercise.id)}
                    >
                      <Text style={styles.completeBtnText}>✓  Ejercicio terminado</Text>
                    </TouchableOpacity>
                  )}

                  {/* Rest Timer */}
                  {isResting ? (
                    <View style={styles.timerBox}>
                      <Text style={styles.timerTime}>{formatTime(restTimer!.timeLeft)}</Text>
                      <Text style={styles.timerLabel}>DESCANSANDO</Text>
                      <TouchableOpacity style={styles.cancelTimerBtn} onPress={cancelRest}>
                        <Text style={styles.cancelTimerText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.restBtn}
                      onPress={() => startRest(exercise.id, exercise.rest_seconds)}
                    >
                      <Text style={styles.restBtnText}>
                        ⏱  Descanso ({exercise.rest_seconds}s)
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              {isDone && (
                <View style={styles.doneBadge}>
                  <Text style={styles.doneBadgeText}>✓  {exerciseSets.length} series completadas</Text>
                </View>
              )}
            </View>
          );
        })}

        <TouchableOpacity style={styles.finishBtn} onPress={handleFinishWorkout} activeOpacity={0.85}>
          <Text style={styles.finishBtnText}>Finalizar entrenamiento</Text>
        </TouchableOpacity>
      </View>

      {/* Replacement Modal */}
      <Modal
        visible={replacementModal?.visible || false}
        animationType="slide"
        transparent={true}
        onRequestClose={closeReplaceModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reemplazar ejercicio</Text>
              <TouchableOpacity onPress={closeReplaceModal} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Elegí un ejercicio alternativo para reemplazar: {replacementModal?.exerciseName}
            </Text>
            <FlatList
              data={replacementModal ? getExerciseAlternatives(replacementModal.exerciseName) : []}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.alternativeItem}
                  onPress={() => handleReplaceExercise(item.name)}
                >
                  <Text style={styles.alternativeName}>{item.name}</Text>
                  <Text style={styles.alternativeCategory}>{item.category}</Text>
                </TouchableOpacity>
              )}
              style={styles.alternativesList}
            />
          </View>
        </View>
      </Modal>

      {/* Exercise Info Modal */}
      <Modal
        visible={exerciseInfoModal?.visible || false}
        animationType="fade"
        transparent={true}
        onRequestClose={closeExerciseInfo}
      >
        <View style={styles.exerciseModalOverlay}>
          <View style={styles.exerciseModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{exerciseInfoModal?.exerciseName}</Text>
              <TouchableOpacity onPress={closeExerciseInfo} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {exerciseInfoModal?.loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={PRIMARY} />
                <Text style={styles.loadingText}>Cargando demostración...</Text>
              </View>
            ) : exerciseInfoModal?.info ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.gifContainer}>
                  <Image
                    source={{ uri: exerciseInfoModal.info.gifUrl }}
                    style={styles.exerciseGif}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.exerciseDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Músculo objetivo:</Text>
                    <Text style={styles.detailValue}>{exerciseInfoModal.info.target}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Parte del cuerpo:</Text>
                    <Text style={styles.detailValue}>{exerciseInfoModal.info.bodyPart}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Equipo:</Text>
                    <Text style={styles.detailValue}>{exerciseInfoModal.info.equipment}</Text>
                  </View>
                </View>
              </ScrollView>
            ) : (
              <View style={styles.noInfoContainer}>
                <Text style={styles.noInfoText}>
                  No pudimos encontrar una demostración para este ejercicio.
                </Text>
                <TouchableOpacity
                  style={styles.youtubeButton}
                  onPress={() => {
                    closeExerciseInfo();
                    openYouTubeFallback(exerciseInfoModal?.exerciseName || '');
                  }}
                >
                  <Text style={styles.youtubeButtonText}>▶ Buscar en YouTube</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: PRIMARY,
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  progressChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  progressChipText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    paddingTop: 20,
  },
  exerciseCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  exerciseCardDone: {
    backgroundColor: '#F0FFF4',
    borderWidth: 1.5,
    borderColor: '#30D158',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 12,
  },
  exNumber: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exNumberDone: {
    backgroundColor: '#30D158',
  },
  exNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  replaceBtn: {
    backgroundColor: '#FF9F0A',
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  replaceBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoBtn: {
    backgroundColor: '#007AFF',
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBtnText: {
    fontSize: 14,
  },
  exerciseNameDone: {
    color: '#1C7A38',
  },
  exerciseMeta: {
    fontSize: 13,
    color: '#8E8E93',
  },
  lastSessionText: {
    fontSize: 12,
    color: PRIMARY,
    marginTop: 3,
    fontWeight: '500',
    opacity: 0.75,
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
  },
  editBtnText: {
    color: '#1C7A38',
    fontSize: 13,
    fontWeight: '600',
  },
  notesRow: {
    backgroundColor: '#F0F0FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 13,
    color: PRIMARY,
    lineHeight: 18,
  },
  setsTable: {
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EBEBF0',
  },
  setsTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8FC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  setsTableLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F5',
  },
  setNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
  },
  setNumberText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6E6E73',
    textAlign: 'center',
  },
  setInput: {
    flex: 1,
    backgroundColor: '#F8F8FC',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
    color: '#1C1C1E',
    fontWeight: '600',
  },
  setInputDone: {
    backgroundColor: '#E8F5E9',
    color: '#1C7A38',
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
  },
  removeBtnText: {
    fontSize: 13,
    color: '#FF3B30',
    fontWeight: '600',
  },
  addSetBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#DDDDE6',
    borderStyle: 'dashed',
    marginBottom: 10,
  },
  addSetBtnText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  completeBtn: {
    backgroundColor: '#30D158',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#30D158',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  completeBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  doneBadgeText: {
    color: '#30D158',
    fontSize: 14,
    fontWeight: '700',
  },
  restBtn: {
    backgroundColor: '#F0F0FF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDF5',
  },
  restBtnText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  timerBox: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFF8EC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FF9F0A',
  },
  timerTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF9F0A',
    letterSpacing: -1,
  },
  timerLabel: {
    fontSize: 11,
    color: '#8E8E93',
    letterSpacing: 1.5,
    marginTop: 2,
    marginBottom: 12,
  },
  cancelTimerBtn: {
    backgroundColor: '#FF9F0A',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cancelTimerText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  finishBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 16,
    padding: 18,
    margin: 4,
    marginTop: 8,
    marginBottom: 32,
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  finishBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#8E8E93',
    fontWeight: '600',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
    lineHeight: 20,
  },
  alternativesList: {
    marginBottom: 20,
  },
  alternativeItem: {
    backgroundColor: '#F8F8FC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EBEBF0',
  },
  alternativeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  alternativeCategory: {
    fontSize: 13,
    color: PRIMARY,
    fontWeight: '500',
  },
  exerciseModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E8E93',
  },
  gifContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    alignItems: 'center',
  },
  exerciseGif: {
    width: '100%',
    height: 300,
  },
  exerciseDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  noInfoContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noInfoText: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  youtubeButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  youtubeButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
