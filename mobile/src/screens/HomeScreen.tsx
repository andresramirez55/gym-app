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
import { useAuth } from '../contexts/AuthContext';
import { routineApi } from '../services/api';
import type { Routine } from '../types';

const PRIMARY = '#5E5CE6';

const GOAL_LABELS: Record<string, string> = {
  gain_muscle: '💪 Ganar músculo',
  lose_weight: '🔥 Perder peso',
  strength: '🏋️ Fuerza',
  endurance: '🏃 Resistencia',
};

export default function HomeScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRoutine();
    }
  }, [user]);

  const loadRoutine = async () => {
    try {
      const activeRoutine = await routineApi.getActive(user!.id);
      setRoutine(activeRoutine);
    } catch (error) {
      setRoutine(null);
    } finally {
      setLoading(false);
    }
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

  const progressPct = routine
    ? Math.round((routine.week_number / routine.duration_weeks) * 100)
    : 0;

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
                      ? `${routine.days_remaining}d restantes`
                      : 'Cambiando rutina...'}
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progressPct}%` as any }]} />
                </View>
                <Text style={styles.progressPct}>{progressPct}% completado</Text>
              </View>
            </View>

            {/* Days */}
            <Text style={styles.sectionTitle}>Días de entrenamiento</Text>

            {routine.days.map((day, index) => (
              <TouchableOpacity
                key={day.id}
                style={styles.dayCard}
                onPress={() => navigation.navigate('DayDetail', { day, routineId: routine.id })}
                activeOpacity={0.75}
              >
                <View style={[styles.dayIndex, { backgroundColor: DAY_COLORS[index % DAY_COLORS.length] }]}>
                  <Text style={styles.dayIndexText}>{index + 1}</Text>
                </View>
                <View style={styles.dayInfo}>
                  <Text style={styles.dayName}>{day.day_name}</Text>
                  <Text style={styles.dayExercises}>{day.exercises.length} ejercicios</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))}

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
                onPress={() => navigation.navigate('Progress')}
                activeOpacity={0.75}
              >
                <Text style={styles.secondaryButtonText}>📈 Progresión</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.ghostButton} onPress={handleGenerateRoutine} activeOpacity={0.75}>
              <Text style={styles.ghostButtonText}>Generar nueva rutina</Text>
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
  ghostButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  ghostButtonText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  credits: {
    color: '#C0C0C8',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    fontSize: 12,
  },
});
