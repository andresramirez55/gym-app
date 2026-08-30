import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { workoutApi } from '../services/api';
import type { WorkoutLog } from '../types';

const PRIMARY = '#5E5CE6';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
}

function totalVolume(log: WorkoutLog): number {
  return log.exercise_logs.reduce((acc, ex) => {
    return acc + ex.sets.reduce((s, set) => s + (set.weight || 0) * (set.reps || 0), 0);
  }, 0);
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await workoutApi.getHistory(user!.id, 20);
      setLogs(history);
    } catch (error) {
      // empty history
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = (logId: number) => {
    Alert.alert('Eliminar sesión', '¿Eliminar este entrenamiento del historial?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await workoutApi.deleteLog(user!.id, logId);
            setLogs(prev => prev.filter(l => l.id !== logId));
          } catch {
            Alert.alert('Error', 'No se pudo eliminar');
          }
        },
      },
    ]);
  };

  const handleDeleteAll = () => {
    Alert.alert('Resetear historial', '¿Eliminar TODO el historial de entrenamientos? Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Resetear todo', style: 'destructive', onPress: async () => {
          try {
            await workoutApi.deleteAll(user!.id);
            setLogs([]);
          } catch {
            Alert.alert('Error', 'No se pudo resetear');
          }
        },
      },
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

  const totalMinutes = logs.reduce((acc, l) => acc + (l.duration || 0), 0);
  const totalExercises = logs.reduce((acc, l) => acc + l.exercise_logs.length, 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Historial</Text>
            <Text style={styles.subtitle}>{logs.length} entrenamientos registrados</Text>
          </View>
          {logs.length > 0 && (
            <TouchableOpacity style={styles.resetBtn} onPress={handleDeleteAll}>
              <Text style={styles.resetBtnText}>Resetear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats row */}
      {logs.length > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{logs.length}</Text>
            <Text style={styles.statLabel}>Sesiones</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalMinutes}</Text>
            <Text style={styles.statLabel}>Minutos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalExercises}</Text>
            <Text style={styles.statLabel}>Ejercicios</Text>
          </View>
        </View>
      )}

      <View style={styles.content}>
        {logs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Sin historial aún</Text>
            <Text style={styles.emptyText}>
              Completá tu primer entrenamiento para verlo acá.
            </Text>
          </View>
        ) : (
          logs.map((log) => {
            const vol = totalVolume(log);
            return (
              <View key={log.id} style={styles.logCard}>
                {/* Card header */}
                <View style={styles.logHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.logDate}>{formatDate(log.completed_at)}</Text>
                    <Text style={styles.logMeta}>
                      {log.exercise_logs.length} ejercicios · {log.duration} min
                    </Text>
                  </View>
                  {vol > 0 && (
                    <View style={styles.volBadge}>
                      <Text style={styles.volBadgeText}>{vol.toLocaleString()} kg</Text>
                      <Text style={styles.volBadgeLabel}>volumen</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteLog(log.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.deleteBtnText}>🗑</Text>
                  </TouchableOpacity>
                </View>

                {/* Exercise list */}
                <View style={styles.exerciseList}>
                  {log.exercise_logs.map((exLog, index) => (
                    <View key={index} style={styles.exerciseRow}>
                      <Text style={styles.exerciseRowName}>{exLog.exercise_name}</Text>
                      <View style={styles.setsRow}>
                        {exLog.sets.map((set, setIndex) => (
                          <View key={setIndex} style={styles.setPill}>
                            <Text style={styles.setPillText}>
                              {set.weight > 0 ? `${set.weight}kg` : ''}{set.weight > 0 && set.reps > 0 ? ' × ' : ''}{set.reps > 0 ? `${set.reps}` : ''}
                              {set.rir !== undefined && set.rir !== null ? ` (RIR ${set.rir === 4 ? '4+' : set.rir})` : ''}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            );
          })
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
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  resetBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  resetBtnText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
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
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: PRIMARY,
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  content: {
    padding: 16,
    paddingTop: 20,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginTop: 8,
  },
  emptyIcon: {
    fontSize: 48,
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
  logCard: {
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
  logHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    fontSize: 16,
  },
  logDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    textTransform: 'capitalize',
  },
  logMeta: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 3,
  },
  volBadge: {
    backgroundColor: '#F0F0FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  volBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY,
  },
  volBadgeLabel: {
    fontSize: 10,
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  exerciseList: {
    gap: 10,
  },
  exerciseRow: {
    gap: 6,
  },
  exerciseRowName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  setsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  setPill: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  setPillText: {
    fontSize: 13,
    color: '#6E6E73',
    fontWeight: '500',
  },
});
