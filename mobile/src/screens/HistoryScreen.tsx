import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { workoutApi } from '../services/api';
import type { WorkoutLog } from '../types';

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
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial</Text>
        <Text style={styles.subtitle}>{logs.length} entrenamientos registrados</Text>
      </View>

      {logs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aún no has registrado entrenamientos</Text>
        </View>
      ) : (
        logs.map((log) => (
          <View key={log.id} style={styles.logCard}>
            <View style={styles.logHeader}>
              <Text style={styles.logDate}>{new Date(log.completed_at).toLocaleDateString()}</Text>
              <Text style={styles.logDuration}>{log.duration} min</Text>
            </View>

            {log.exercise_logs.map((exLog, index) => (
              <View key={index} style={styles.exerciseLog}>
                <Text style={styles.exerciseName}>{exLog.exercise_name}</Text>
                <View style={styles.setsContainer}>
                  {exLog.sets.map((set, setIndex) => (
                    <Text key={setIndex} style={styles.setInfo}>
                      {set.weight}kg × {set.reps}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  logCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  },
  logDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logDuration: {
    fontSize: 14,
    color: '#666',
  },
  exerciseLog: {
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  setsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  setInfo: {
    fontSize: 13,
    color: '#666',
    backgroundColor: '#F5F5F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
