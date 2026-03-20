import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Modal,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useAuth } from '../contexts/AuthContext';
import { routineApi, workoutApi } from '../services/api';
import type { Routine, WorkoutLog } from '../types';

const PRIMARY = '#5E5CE6';

const GOAL_LABELS: Record<string, string> = {
  gain_muscle: '💪 Ganar músculo',
  lose_weight: '🔥 Perder peso',
  strength: '🏋️ Fuerza',
  endurance: '🏃 Resistencia',
};

const GOAL_GRADIENTS: Record<string, { colors: string[]; start: [number, number]; end: [number, number] }> = {
  gain_muscle: {
    colors: ['#5E5CE6', '#8E8CE6', '#BF5AF2'],
    start: [0, 0],
    end: [1, 1],
  },
  lose_weight: {
    colors: ['#FF6B35', '#FF8F35', '#FFB135'],
    start: [0, 0],
    end: [1, 1],
  },
  strength: {
    colors: ['#64D2FF', '#5E9CE6', '#5E5CE6'],
    start: [0, 0],
    end: [1, 1],
  },
  endurance: {
    colors: ['#30D158', '#4DDB6F', '#6FE587'],
    start: [0, 0],
    end: [1, 1],
  },
};

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon, ...
  const diff = (day === 0 ? -6 : 1 - day); // adjust to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export default function HomeScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [weekStats, setWeekStats] = useState<{
    sessions: number;
    minutes: number;
    volume: number;
    days: number[]; // 0=Mon .. 6=Sun
  } | null>(null);
  const [weekCompletedDays, setWeekCompletedDays] = useState<Map<number, Date[]>>(new Map());
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importText, setImportText] = useState('');
  const [importGoal, setImportGoal] = useState('gain_muscle');
  const [importDuration, setImportDuration] = useState('8');
  const [importFrequency, setImportFrequency] = useState('6');
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadRoutine();
      loadWeekStats();
      loadWeekCompletedDays();
    }
  }, [user]);

  // Refrescar datos cuando la pantalla recibe focus
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadWeekCompletedDays();
        loadWeekStats();
      }
    }, [user])
  );

  const loadWeekCompletedDays = async () => {
    try {
      const history: WorkoutLog[] = await workoutApi.getHistory(user!.id, 30);
      const weekStart = getWeekStart();
      const thisWeek = history.filter(log => new Date(log.completed_at) >= weekStart);

      const map = new Map<number, Date[]>();
      thisWeek.forEach(log => {
        const dates = map.get(log.routine_day_id) || [];
        dates.push(new Date(log.completed_at));
        map.set(log.routine_day_id, dates);
      });

      setWeekCompletedDays(map);
    } catch (_) {}
  };


  const loadWeekStats = async () => {
    try {
      const history: WorkoutLog[] = await workoutApi.getHistory(user!.id, 30);
      const weekStart = getWeekStart();
      const thisWeek = history.filter(log => new Date(log.completed_at) >= weekStart);

      const sessions = thisWeek.length;
      const minutes = thisWeek.reduce((acc, l) => acc + (l.duration || 0), 0);
      const volume = thisWeek.reduce((acc, l) =>
        acc + l.exercise_logs.reduce((a, ex) =>
          a + ex.sets.reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0), 0), 0);

      // Which days of the week (0=Mon..6=Sun) had a workout
      const days = Array.from(new Set(thisWeek.map(log => {
        const d = new Date(log.completed_at).getDay(); // 0=Sun
        return d === 0 ? 6 : d - 1; // convert to 0=Mon
      })));

      setWeekStats({ sessions, minutes, volume, days });
    } catch (_) {}
  };

  const loadRoutine = async () => {
    try {
      const activeRoutine = await routineApi.getActive(user!.id);
      console.log('📋 Routine loaded:', {
        name: activeRoutine.name,
        week_number: activeRoutine.week_number,
        duration_weeks: activeRoutine.duration_weeks,
        days_remaining: activeRoutine.days_remaining,
        isCompleted: activeRoutine.week_number >= activeRoutine.duration_weeks,
      });
      setRoutine(activeRoutine);
    } catch (error) {
      setRoutine(null);
    } finally {
      setLoading(false);
    }
  };

  const confirmGenerateRoutine = () => {
    Alert.alert(
      '¿Generar nueva rutina?',
      'Esto va a reemplazar tu rutina actual. Tu historial de entrenamientos se mantendrá intacto.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Generar', style: 'default', onPress: handleGenerateRoutine },
      ]
    );
  };

  const handleGenerateRoutine = async () => {
    setLoading(true);
    try {
      const newRoutine = await routineApi.generate({
        user_id: user!.id,
        goal: user!.goal,
        frequency: user!.frequency,
      });
      setRoutine(newRoutine);
      Alert.alert('¡Listo!', 'Tu nueva rutina está lista');
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar la rutina');
    } finally {
      setLoading(false);
    }
  };

  const openImportModal = () => {
    setImportText('');
    setImportGoal('gain_muscle');
    setImportDuration('8');
    setImportFrequency('6');
    setImportModalVisible(true);
  };

  const closeImportModal = () => {
    setImportModalVisible(false);
    setImportText('');
  };

  const handleImportRoutine = async () => {
    if (!importText.trim()) {
      Alert.alert('Error', 'Por favor ingresá el texto de la rutina');
      return;
    }

    const duration = parseInt(importDuration);
    const frequency = parseInt(importFrequency);

    if (isNaN(duration) || duration < 1 || duration > 52) {
      Alert.alert('Error', 'Duración debe ser entre 1 y 52 semanas');
      return;
    }

    if (isNaN(frequency) || frequency < 1 || frequency > 7) {
      Alert.alert('Error', 'Frecuencia debe ser entre 1 y 7 días');
      return;
    }

    setImportLoading(true);
    try {
      const newRoutine = await routineApi.import({
        user_id: user!.id,
        text: importText,
        goal: importGoal,
        duration_weeks: duration,
        frequency: frequency,
      });

      setRoutine(newRoutine);
      closeImportModal();
      Alert.alert('¡Éxito!', 'Rutina importada correctamente');
    } catch (error: any) {
      const errorMsg = error.response?.data || error.message || 'Error desconocido';
      Alert.alert('Error', `No se pudo importar la rutina:\n${errorMsg}`);
    } finally {
      setImportLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: signOut },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  const progressPct = routine && routine.duration_weeks > 0
    ? Math.min(100, Math.max(0, Math.round((routine.week_number / routine.duration_weeks) * 100)))
    : 0;

  // Solo mostrar banner si los valores son válidos Y realmente completaste
  const isRoutineCompleted = routine
    ? routine.week_number >= 1 &&
      routine.duration_weeks > 0 &&
      routine.week_number > routine.duration_weeks // Pasaste de la última semana
    : false;

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hola, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.goalChip}>{GOAL_LABELS[user?.goal || ''] || user?.goal}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {!routine ? (
          /* Empty state */
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🚀</Text>
            <Text style={styles.emptyTitle}>¡Empecemos!</Text>
            <Text style={styles.emptyText}>
              Generá tu rutina personalizada con IA basada en tu objetivo y disponibilidad.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleGenerateRoutine} activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>✨ Generar mi rutina</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Routine Info Card */}
            <LinearGradient
              colors={GOAL_GRADIENTS[routine.goal]?.colors as any || GOAL_GRADIENTS.gain_muscle.colors as any}
              start={GOAL_GRADIENTS[routine.goal]?.start || [0, 0]}
              end={GOAL_GRADIENTS[routine.goal]?.end || [1, 1]}
              style={styles.routineCardGradient}
            >
              <View style={styles.routineCardContent}>
                <Text style={styles.routineName}>{routine.name}</Text>
                <Text style={styles.routineDesc}>{routine.description}</Text>

                {/* Progress */}
                <View style={styles.progressSection}>
                  <View style={styles.progressCircleRow}>
                    <AnimatedCircularProgress
                      size={100}
                      width={8}
                      fill={progressPct}
                      tintColor={GOAL_GRADIENTS[routine.goal]?.colors[0] || PRIMARY}
                      backgroundColor="#E5E5EA"
                      rotation={0}
                      lineCap="round"
                      duration={800}
                    >
                      {(fill: number) => (
                        <View style={styles.progressCircleContent}>
                          <Text style={styles.progressCirclePct}>{Math.round(fill)}%</Text>
                          <Text style={styles.progressCircleLabel}>completo</Text>
                        </View>
                      )}
                    </AnimatedCircularProgress>

                    <View style={styles.progressTextContainer}>
                      <Text style={styles.progressWeek}>
                        Semana {routine.week_number} de {routine.duration_weeks}
                      </Text>
                      <Text style={styles.progressDays}>
                        {routine.days_remaining > 0
                          ? `${routine.days_remaining} ${routine.days_remaining === 1 ? 'workout' : 'workouts'} restantes`
                          : isRoutineCompleted
                            ? 'Completada'
                            : 'En progreso'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>

            {/* Routine Completion Banner */}
            {isRoutineCompleted && (
              <View style={styles.completionBanner}>
                <Text style={styles.completionIcon}>🎉</Text>
                <Text style={styles.completionTitle}>¡Rutina completada!</Text>
                <Text style={styles.completionText}>
                  Completaste todas las semanas de tu rutina actual. ¿Listo para generar una nueva?
                </Text>
                <TouchableOpacity
                  style={styles.completionButton}
                  onPress={handleGenerateRoutine}
                  activeOpacity={0.85}
                >
                  <Text style={styles.completionButtonText}>✨ Generar nueva rutina</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Weekly Summary */}
            {weekStats && weekStats.sessions > 0 && (
              <View style={styles.weekCard}>
                <Text style={styles.weekTitle}>Esta semana</Text>
                <View style={styles.weekStatsRow}>
                  <View style={styles.weekStat}>
                    <Text style={styles.weekStatValue}>{weekStats.sessions}</Text>
                    <Text style={styles.weekStatLabel}>sesiones</Text>
                  </View>
                  <View style={styles.weekStatDivider} />
                  <View style={styles.weekStat}>
                    <Text style={styles.weekStatValue}>{weekStats.minutes}</Text>
                    <Text style={styles.weekStatLabel}>minutos</Text>
                  </View>
                  <View style={styles.weekStatDivider} />
                  <View style={styles.weekStat}>
                    <Text style={styles.weekStatValue}>
                      {weekStats.volume >= 1000
                        ? `${(weekStats.volume / 1000).toFixed(1)}t`
                        : `${weekStats.volume}kg`}
                    </Text>
                    <Text style={styles.weekStatLabel}>volumen</Text>
                  </View>
                </View>
                <View style={styles.weekDaysRow}>
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((label, i) => (
                    <View
                      key={i}
                      style={[styles.weekDay, weekStats.days.includes(i) && styles.weekDayActive]}
                    >
                      <Text style={[styles.weekDayText, weekStats.days.includes(i) && styles.weekDayTextActive]}>
                        {label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Days */}
            <Text style={styles.sectionTitle}>Días de entrenamiento</Text>

            {routine.days.map((day, index) => {
              const completionDates = weekCompletedDays.get(day.id) || [];
              const completionCount = completionDates.length;
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isCompletedToday = completionDates.some(date => {
                const completionDate = new Date(date);
                completionDate.setHours(0, 0, 0, 0);
                return completionDate.getTime() === today.getTime();
              });
              const hasCompletions = completionCount > 0;

              return (
                <TouchableOpacity
                  key={day.id}
                  style={[
                    styles.dayCard,
                    hasCompletions && styles.dayCardWithCompletions,
                    isCompletedToday && styles.dayCardCompletedToday
                  ]}
                  onPress={() => navigation.navigate('DayDetail', { day, routineId: routine.id })}
                  activeOpacity={0.75}
                >
                  <View style={[
                    styles.dayIndex,
                    { backgroundColor: hasCompletions ? '#30D158' : DAY_COLORS[index % DAY_COLORS.length] }
                  ]}>
                    <Text style={styles.dayIndexText}>{hasCompletions ? '✓' : index + 1}</Text>
                  </View>
                  <View style={styles.dayInfo}>
                    <Text style={styles.dayName}>{day.day_name}</Text>
                    <Text style={styles.dayExercises}>{day.exercises.length} ejercicios</Text>

                    {hasCompletions && (
                      <View style={styles.completionIndicatorRow}>
                        {Array.from({ length: completionCount }).map((_, i) => (
                          <View key={i} style={styles.completionDot} />
                        ))}
                        <Text style={styles.completionCountText}>
                          {completionCount}x esta semana
                        </Text>
                      </View>
                    )}

                    {isCompletedToday && (
                      <View style={styles.completedTodayBadge}>
                        <Text style={styles.completedTodayBadgeText}>Completado hoy</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
              );
            })}

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.secondaryButton, { flex: 1 }]}
                onPress={() => navigation.navigate('History')}
                activeOpacity={0.75}
              >
                <Text style={styles.secondaryButtonIcon}>📊</Text>
                <Text style={styles.secondaryButtonText}>Historial</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, { flex: 1 }]}
                onPress={() => navigation.navigate('Calendar')}
                activeOpacity={0.75}
              >
                <Text style={styles.secondaryButtonIcon}>📅</Text>
                <Text style={styles.secondaryButtonText}>Calendario</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, { flex: 1 }]}
                onPress={() => navigation.navigate('Progress')}
                activeOpacity={0.75}
              >
                <Text style={styles.secondaryButtonIcon}>📈</Text>
                <Text style={styles.secondaryButtonText}>Progreso</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.generateButton} onPress={confirmGenerateRoutine} activeOpacity={0.75}>
              <View style={styles.generateButtonContent}>
                <Text style={styles.generateButtonIcon}>✨</Text>
                <Text style={styles.generateButtonText}>Generar nueva rutina</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.importButton} onPress={openImportModal} activeOpacity={0.75}>
              <View style={styles.generateButtonContent}>
                <Text style={styles.importButtonIcon}>📄</Text>
                <Text style={styles.importButtonText}>Importar desde texto</Text>
              </View>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.credits}>
            Hecho con <Text style={styles.creditsHeart}>♥</Text> por Andres Ramirez
          </Text>
        </View>
      </View>
    </ScrollView>

      {/* Modal de Importar Rutina */}
      <Modal
      visible={importModalVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={closeImportModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={closeImportModal}>
            <Text style={styles.modalCloseButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Importar Rutina</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalInstructions}>
            Pegá tu rutina en cualquier formato. La IA la interpretará automáticamente.
          </Text>

          <TextInput
            style={styles.importTextInput}
            value={importText}
            onChangeText={setImportText}
            placeholder="Ejemplo:&#10;&#10;Día 1: Pecho&#10;Press banca 4x8-10&#10;Press inclinado 3x10-12&#10;&#10;Día 2: Espalda&#10;Dominadas 4x8&#10;Remo 3x10&#10;..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />

          <Text style={styles.formLabel}>Objetivo:</Text>
          <View style={styles.goalButtonsRow}>
            {Object.entries(GOAL_LABELS).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.goalButton,
                  importGoal === key && styles.goalButtonActive
                ]}
                onPress={() => setImportGoal(key)}
              >
                <Text style={[
                  styles.goalButtonText,
                  importGoal === key && styles.goalButtonTextActive
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.formLabel}>Duración (semanas):</Text>
          <TextInput
            style={styles.formInput}
            value={importDuration}
            onChangeText={setImportDuration}
            placeholder="8"
            keyboardType="numeric"
            maxLength={2}
          />

          <Text style={styles.formLabel}>Frecuencia (días por semana):</Text>
          <TextInput
            style={styles.formInput}
            value={importFrequency}
            onChangeText={setImportFrequency}
            placeholder="6"
            keyboardType="numeric"
            maxLength={1}
          />

          <TouchableOpacity
            style={[styles.parseButton, importLoading && styles.parseButtonDisabled]}
            onPress={handleImportRoutine}
            disabled={importLoading}
            activeOpacity={0.8}
          >
            {importLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.parseButtonText}>Importar con IA</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
    </>
  );
}

const DAY_COLORS = ['#5E5CE6', '#FF6B35', '#30D158', '#FF9F0A', '#64D2FF', '#BF5AF2'];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: PRIMARY,
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: -0.3,
  },
  goalChip: {
    marginTop: 6,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 4,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    paddingTop: 24,
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    color: '#6E6E73',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  routineCardGradient: {
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  routineCardContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    margin: 2,
  },
  routineName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  routineDesc: {
    fontSize: 14,
    color: '#6E6E73',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressSection: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 14,
  },
  progressCircleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  progressCircleContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCirclePct: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  progressCircleLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressTextContainer: {
    flex: 1,
  },
  progressWeek: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 4,
  },
  progressDays: {
    fontSize: 12,
    color: '#8E8E93',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 14,
  },
  dayCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  dayCardCompleted: {
    backgroundColor: '#F0FFF4',
    borderWidth: 1.5,
    borderColor: '#30D158',
  },
  dayIndex: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  dayIndexText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  dayExercises: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  completedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#30D158',
  },
  arrow: {
    fontSize: 22,
    color: '#C7C7CC',
    fontWeight: '300',
  },
  dayCardWithCompletions: {
    borderWidth: 1.5,
    borderColor: '#C6F6D5',
    backgroundColor: '#F9FFF9',
  },
  dayCardCompletedToday: {
    backgroundColor: '#F0FFF4',
    borderColor: '#30D158',
  },
  completionIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  completionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#30D158',
  },
  completionCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#30D158',
    marginLeft: 4,
  },
  completedTodayBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  completedTodayBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  primaryButton: {
    backgroundColor: PRIMARY,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  secondaryButtonIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  secondaryButtonText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: PRIMARY,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  generateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generateButtonIcon: {
    fontSize: 18,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  importButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: PRIMARY,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  importButtonIcon: {
    fontSize: 18,
  },
  importButtonText: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  weekCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  weekTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 14,
  },
  weekStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weekStat: {
    flex: 1,
    alignItems: 'center',
  },
  weekStatValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: PRIMARY,
  },
  weekStatLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    fontWeight: '600',
  },
  weekStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#EBEBF0',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  weekDay: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayActive: {
    backgroundColor: PRIMARY,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
  },
  weekDayTextActive: {
    color: 'white',
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  footerDivider: {
    width: 60,
    height: 2,
    backgroundColor: '#EBEBF0',
    borderRadius: 1,
    marginBottom: 16,
  },
  credits: {
    color: '#8E8E93',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  creditsHeart: {
    color: '#FF6B6B',
    fontSize: 14,
  },
  completionBanner: {
    backgroundColor: '#FFFBF0',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#FFD700',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  completionIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 10,
    textAlign: 'center',
  },
  completionText: {
    fontSize: 15,
    color: '#6E6E73',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  completionButton: {
    backgroundColor: PRIMARY,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  completionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal de importación
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: PRIMARY,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  modalCloseButton: {
    fontSize: 28,
    color: 'white',
    fontWeight: '300',
  },
  modalExampleButton: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalInstructions: {
    fontSize: 15,
    color: '#6E6E73',
    marginBottom: 12,
    fontWeight: '500',
  },
  exampleContainer: {
    marginBottom: 20,
  },
  exampleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  exampleBox: {
    backgroundColor: '#F8F8FC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  exampleText: {
    fontSize: 12,
    color: '#3C3C43',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  importTextInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    minHeight: 300,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    fontFamily: 'monospace',
    marginBottom: 20,
  },
  parseButton: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  parseButtonDisabled: {
    opacity: 0.5,
  },
  parseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  goalButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  goalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    backgroundColor: 'white',
  },
  goalButtonActive: {
    borderColor: PRIMARY,
    backgroundColor: `${PRIMARY}15`,
  },
  goalButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  goalButtonTextActive: {
    color: PRIMARY,
    fontWeight: '600',
  },
});
