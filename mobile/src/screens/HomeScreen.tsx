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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
  const [todayCompletedDays, setTodayCompletedDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (user) {
      loadRoutine();
      loadWeekStats();
      loadTodayWorkouts();
    }
  }, [user]);

  // Refrescar workouts de hoy cuando la pantalla recibe focus
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadTodayWorkouts();
        loadWeekStats();
      }
    }, [user])
  );

  const loadTodayWorkouts = async () => {
    try {
      const history: WorkoutLog[] = await workoutApi.getHistory(user!.id, 10);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Filtrar workouts de hoy
      const todayWorkouts = history.filter(log => {
        const logDate = new Date(log.completed_at);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
      });

      // Extraer routine_day_id de los workouts de hoy
      const completedDayIds = new Set(todayWorkouts.map(log => log.routine_day_id));
      setTodayCompletedDays(completedDayIds);
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
            <View style={styles.routineCard}>
              <Text style={styles.routineName}>{routine.name}</Text>
              <Text style={styles.routineDesc}>{routine.description}</Text>

              {/* Progress */}
              <View style={styles.progressSection}>
                <View style={styles.progressRow}>
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
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progressPct}%` as any }]} />
                </View>
                <Text style={styles.progressPct}>{progressPct}% completado</Text>
              </View>
            </View>

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
              const isCompletedToday = todayCompletedDays.has(day.id);
              return (
                <TouchableOpacity
                  key={day.id}
                  style={[styles.dayCard, isCompletedToday && styles.dayCardCompleted]}
                  onPress={() => navigation.navigate('DayDetail', { day, routineId: routine.id })}
                  activeOpacity={0.75}
                >
                  <View style={[
                    styles.dayIndex,
                    { backgroundColor: isCompletedToday ? '#30D158' : DAY_COLORS[index % DAY_COLORS.length] }
                  ]}>
                    <Text style={styles.dayIndexText}>{isCompletedToday ? '✓' : index + 1}</Text>
                  </View>
                  <View style={styles.dayInfo}>
                    <Text style={styles.dayName}>{day.day_name}</Text>
                    <Text style={styles.dayExercises}>{day.exercises.length} ejercicios</Text>
                    {isCompletedToday && (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedBadgeText}>Completado hoy</Text>
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
                <Text style={styles.secondaryButtonText}>📊 Historial</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, { flex: 1 }]}
                onPress={() => navigation.navigate('Calendar')}
                activeOpacity={0.75}
              >
                <Text style={styles.secondaryButtonText}>📅 Calendario</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, { flex: 1 }]}
                onPress={() => navigation.navigate('Progress')}
                activeOpacity={0.75}
              >
                <Text style={styles.secondaryButtonText}>📈 Progresión</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.generateButton} onPress={confirmGenerateRoutine} activeOpacity={0.75}>
              <Text style={styles.generateButtonText}>✨ Generar nueva rutina</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.credits}>Creado por Andres Ramirez</Text>
      </View>
    </ScrollView>
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
  routineCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressWeek: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY,
  },
  progressDays: {
    fontSize: 12,
    color: '#8E8E93',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#DDDDE6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: PRIMARY,
    borderRadius: 4,
  },
  progressPct: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'right',
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
  secondaryButtonText: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: PRIMARY,
    borderStyle: 'dashed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  generateButtonText: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: '600',
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
  credits: {
    color: '#C0C0C8',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    fontSize: 12,
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
});
