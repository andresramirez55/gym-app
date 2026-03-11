import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { workoutApi } from '../services/api';
import type { WorkoutLog } from '../types';

const PRIMARY = '#5E5CE6';
const SUCCESS = '#30D158';

interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
}

export default function CalendarScreen({ navigation }: any) {
  const { user } = useAuth();
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper functions
  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('es-AR', {
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDayShort = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const getDaysInMonth = (year: number, month: number): DayCell[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Calculate offset (0=Sun, 1=Mon, etc. - adjust to start on Monday)
    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days: DayCell[] = [];

    // Previous month overflow days
    for (let i = startOffset - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Next month overflow to complete 42 cells
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  };

  const getWorkoutsByDate = (logs: WorkoutLog[]): Record<string, WorkoutLog[]> => {
    const map: Record<string, WorkoutLog[]> = {};

    logs.forEach((log) => {
      // Extract date without time: 'YYYY-MM-DD'
      const dateKey = log.completed_at.split(' ')[0];

      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(log);
    });

    return map;
  };

  const calculateStreak = (logs: WorkoutLog[]): number => {
    if (logs.length === 0) return 0;

    // Extract unique workout dates, sorted newest first
    const workoutDates = Array.from(
      new Set(logs.map((log) => log.completed_at.split(' ')[0]))
    ).sort().reverse();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let checkDate = new Date(today);

    // Walk backwards from today
    for (const dateStr of workoutDates) {
      const workoutDate = new Date(dateStr);
      workoutDate.setHours(0, 0, 0, 0);

      if (workoutDate.getTime() === checkDate.getTime()) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (workoutDate < checkDate) {
        break;
      }
    }

    // Special case: if no workout today but yesterday, still count streak
    if (streak === 0) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDateKey(yesterday);

      if (workoutDates.includes(yesterdayStr)) {
        streak = 1;
        checkDate = new Date(yesterday);
        checkDate.setDate(checkDate.getDate() - 1);

        for (const dateStr of workoutDates) {
          if (dateStr === yesterdayStr) continue;

          const workoutDate = new Date(dateStr);
          workoutDate.setHours(0, 0, 0, 0);

          if (workoutDate.getTime() === checkDate.getTime()) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else if (workoutDate < checkDate) {
            break;
          }
        }
      }
    }

    return streak;
  };

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const history = await workoutApi.getHistory(user.id, 999);
      setWorkoutLogs(history);
    } catch (error) {
      console.error('Failed to load workout history:', error);
      setWorkoutLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadData();
      }
    }, [user])
  );

  // Memoized calculations
  const calendarDays = useMemo(() => {
    return getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  }, [currentMonth]);

  const workoutsByDate = useMemo(() => {
    return getWorkoutsByDate(workoutLogs);
  }, [workoutLogs]);

  const currentStreak = useMemo(() => {
    return calculateStreak(workoutLogs);
  }, [workoutLogs]);

  const handleDayPress = (dateKey: string) => {
    const workouts = workoutsByDate[dateKey];

    if (!workouts || workouts.length === 0) {
      return;
    }

    if (selectedDate === dateKey) {
      setSelectedDate(null); // Collapse
    } else {
      setSelectedDate(dateKey); // Expand
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
    setSelectedDate(null); // Clear selection when changing months
  };

  const isCurrentMonthView = (): boolean => {
    const now = new Date();
    return (
      currentMonth.getFullYear() === now.getFullYear() &&
      currentMonth.getMonth() === now.getMonth()
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  const today = new Date();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Calendario</Text>
        <Text style={styles.subtitle}>Tu progreso mensual</Text>
      </View>

      <View style={styles.content}>
        {/* Streak Badge */}
        {currentStreak > 0 && (
          <View style={styles.streakCard}>
            <Text style={styles.streakIcon}>🔥</Text>
            <View>
              <Text style={styles.streakText}>{currentStreak} días seguidos</Text>
              <Text style={styles.streakLabel}>¡Seguí así!</Text>
            </View>
          </View>
        )}

        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigateMonth('prev')}>
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{formatMonthYear(currentMonth)}</Text>
          <TouchableOpacity
            style={[styles.navButton, isCurrentMonthView() && styles.navButtonDisabled]}
            onPress={() => navigateMonth('next')}
            disabled={isCurrentMonthView()}
          >
            <Text style={[styles.navButtonText, isCurrentMonthView() && styles.navButtonTextDisabled]}>
              →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarCard}>
          {/* Weekday Headers */}
          <View style={styles.weekdayRow}>
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
              <View key={i} style={styles.weekdayCell}>
                <Text style={styles.weekdayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Days Grid */}
          <View style={styles.calendarGrid}>
            {Array.from({ length: 6 }).map((_, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((dayCell, dayIndex) => {
                  const dateKey = formatDateKey(dayCell.date);
                  const hasWorkout = workoutsByDate[dateKey]?.length > 0;
                  const isToday = isSameDay(dayCell.date, today);
                  const isSelected = selectedDate === dateKey;

                  return (
                    <TouchableOpacity
                      key={dayIndex}
                      style={[
                        styles.dayCell,
                        !dayCell.isCurrentMonth && styles.dayCellOtherMonth,
                        isToday && styles.dayCellToday,
                        isSelected && styles.dayCellSelected,
                      ]}
                      onPress={() => handleDayPress(dateKey)}
                      disabled={!hasWorkout}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dayNumber,
                          !dayCell.isCurrentMonth && styles.dayNumberOtherMonth,
                        ]}
                      >
                        {dayCell.date.getDate()}
                      </Text>
                      {hasWorkout && <View style={styles.workoutIndicator} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* Workout Details Section */}
        {selectedDate && workoutsByDate[selectedDate] && (
          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>
              Entrenamientos del {formatDayShort(selectedDate)}
            </Text>

            {workoutsByDate[selectedDate].map((log) => {
              const totalVolume = log.exercise_logs.reduce(
                (acc, ex) =>
                  acc +
                  ex.sets.reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0),
                0
              );

              return (
                <View key={log.id} style={styles.workoutDetailCard}>
                  {/* Header */}
                  <View style={styles.workoutHeader}>
                    <Text style={styles.workoutTime}>
                      ⏰ {log.completed_at.split(' ')[1].slice(0, 5)}
                    </Text>
                    <Text style={styles.workoutDuration}>⏱ {log.duration} min</Text>
                    {totalVolume > 0 && (
                      <Text style={styles.workoutVolume}>
                        💪 {totalVolume >= 1000
                          ? `${(totalVolume / 1000).toFixed(1)}t`
                          : `${totalVolume}kg`}
                      </Text>
                    )}
                  </View>

                  {/* Exercise List */}
                  <View style={styles.exerciseList}>
                    {log.exercise_logs.map((ex, idx) => (
                      <View key={idx} style={styles.exerciseRow}>
                        <Text style={styles.exerciseName}>• {ex.exercise_name}</Text>
                        <View style={styles.setsRow}>
                          {ex.sets.map((set, setIdx) => (
                            <View key={setIdx} style={styles.setPill}>
                              <Text style={styles.setPillText}>
                                {set.weight > 0 ? `${set.weight}kg` : ''}
                                {set.weight > 0 && set.reps > 0 ? ' × ' : ''}
                                {set.reps > 0 ? `${set.reps}` : ''}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Empty State */}
        {workoutLogs.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>Sin entrenamientos aún</Text>
            <Text style={styles.emptyText}>
              Empezá a entrenar para ver tu calendario y racha de días
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

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
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 24,
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
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  content: {
    padding: 16,
    paddingTop: 20,
  },
  streakCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: SUCCESS,
  },
  streakIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  streakText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  streakLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 20,
    color: PRIMARY,
    fontWeight: '700',
  },
  navButtonTextDisabled: {
    color: '#C7C7CC',
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    textTransform: 'capitalize',
  },
  calendarCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
  },
  calendarGrid: {
    gap: 4,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#F8F8FC',
  },
  dayCellOtherMonth: {
    opacity: 0.3,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: PRIMARY,
    backgroundColor: 'rgba(94, 92, 230, 0.1)',
  },
  dayCellSelected: {
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  dayNumberOtherMonth: {
    color: '#C7C7CC',
  },
  workoutIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SUCCESS,
  },
  detailsSection: {
    marginTop: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  workoutDetailCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  workoutTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  workoutDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  workoutVolume: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY,
  },
  exerciseList: {
    gap: 8,
  },
  exerciseRow: {
    gap: 6,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  setsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  setPill: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  setPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6E6E73',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});
