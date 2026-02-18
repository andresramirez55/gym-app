import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { workoutApi } from '../services/api';
import type { WorkoutLog } from '../types';

const PRIMARY = '#5E5CE6';

interface ExerciseProgress {
  name: string;
  entries: { date: string; maxWeight: number }[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

function buildProgress(logs: WorkoutLog[]): ExerciseProgress[] {
  const map: Record<string, { date: string; maxWeight: number }[]> = {};

  // logs come newest first — reverse to get chronological order
  const sorted = [...logs].reverse();

  for (const log of sorted) {
    for (const ex of log.exercise_logs) {
      const maxW = Math.max(...ex.sets.map((s) => s.weight || 0));
      if (maxW === 0) continue;
      if (!map[ex.exercise_name]) map[ex.exercise_name] = [];
      map[ex.exercise_name].push({ date: log.completed_at, maxWeight: maxW });
    }
  }

  return Object.entries(map)
    .map(([name, entries]) => ({ name, entries }))
    .filter((e) => e.entries.length >= 1)
    .sort((a, b) => b.entries.length - a.entries.length);
}

function BarChart({ entries }: { entries: { date: string; maxWeight: number }[] }) {
  const maxVal = Math.max(...entries.map((e) => e.maxWeight));

  return (
    <View style={chart.container}>
      {entries.map((entry, i) => {
        const pct = maxVal > 0 ? entry.maxWeight / maxVal : 0;
        const isLast = i === entries.length - 1;
        return (
          <View key={i} style={chart.row}>
            <Text style={chart.dateLabel}>{formatDate(entry.date)}</Text>
            <View style={chart.barBg}>
              <View
                style={[
                  chart.barFill,
                  {
                    width: `${Math.max(pct * 100, 4)}%` as any,
                    backgroundColor: isLast ? PRIMARY : '#C5C4F5',
                  },
                ]}
              />
            </View>
            <Text style={[chart.weightLabel, isLast && chart.weightLabelLast]}>
              {entry.maxWeight}kg
            </Text>
          </View>
        );
      })}

      {entries.length >= 2 && (() => {
        const first = entries[0].maxWeight;
        const last = entries[entries.length - 1].maxWeight;
        const diff = last - first;
        if (diff === 0) return null;
        const sign = diff > 0 ? '+' : '';
        const color = diff > 0 ? '#30D158' : '#FF3B30';
        return (
          <View style={chart.diffRow}>
            <Text style={[chart.diffText, { color }]}>
              {sign}{diff}kg desde la primera sesión
            </Text>
          </View>
        );
      })()}
    </View>
  );
}

export default function ProgressScreen({ navigation }: any) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<ExerciseProgress[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    workoutApi.getHistory(user!.id, 50).then((logs) => {
      setExercises(buildProgress(logs));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Progresión de peso</Text>
        <Text style={styles.subtitle}>Tocá un ejercicio para ver tu evolución</Text>
      </View>

      <View style={styles.content}>
        {exercises.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📈</Text>
            <Text style={styles.emptyTitle}>Sin datos aún</Text>
            <Text style={styles.emptyText}>
              Completá entrenamientos registrando pesos para ver tu progresión acá.
            </Text>
          </View>
        ) : (
          exercises.map((ex) => {
            const isOpen = selected === ex.name;
            const last = ex.entries[ex.entries.length - 1];
            const first = ex.entries[0];
            const diff = last.maxWeight - first.maxWeight;
            const hasProgress = ex.entries.length >= 2;

            return (
              <TouchableOpacity
                key={ex.name}
                style={[styles.exCard, isOpen && styles.exCardOpen]}
                onPress={() => setSelected(isOpen ? null : ex.name)}
                activeOpacity={0.75}
              >
                <View style={styles.exHeader}>
                  <View style={styles.exInfo}>
                    <Text style={styles.exName}>{ex.name}</Text>
                    <Text style={styles.exMeta}>
                      {ex.entries.length} {ex.entries.length === 1 ? 'sesión' : 'sesiones'} · máx {last.maxWeight}kg
                    </Text>
                  </View>
                  <View style={styles.exRight}>
                    {hasProgress && diff !== 0 && (
                      <View style={[styles.diffBadge, { backgroundColor: diff > 0 ? '#E8FFF0' : '#FFF0F0' }]}>
                        <Text style={[styles.diffBadgeText, { color: diff > 0 ? '#30D158' : '#FF3B30' }]}>
                          {diff > 0 ? '+' : ''}{diff}kg
                        </Text>
                      </View>
                    )}
                    <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
                  </View>
                </View>

                {isOpen && (
                  <View style={styles.chartWrapper}>
                    <BarChart entries={ex.entries} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const chart = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  dateLabel: {
    width: 52,
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'right',
  },
  barBg: {
    flex: 1,
    height: 20,
    backgroundColor: '#F2F2F7',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: 20,
    borderRadius: 6,
  },
  weightLabel: {
    width: 46,
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    textAlign: 'right',
  },
  weightLabelLast: {
    color: PRIMARY,
    fontWeight: '700',
  },
  diffRow: {
    marginTop: 8,
    alignItems: 'center',
  },
  diffText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

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
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  content: {
    padding: 16,
    paddingTop: 20,
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
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
  exCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  exCardOpen: {
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
  exHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exInfo: {
    flex: 1,
  },
  exName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 3,
  },
  exMeta: {
    fontSize: 12,
    color: '#8E8E93',
  },
  exRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  diffBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 11,
    color: '#C7C7CC',
  },
  chartWrapper: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F5',
  },
});
