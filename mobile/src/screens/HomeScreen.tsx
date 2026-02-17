import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { routineApi } from '../services/api';
import type { Routine } from '../types';

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
      // No hay rutina activa
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
      Alert.alert('¡Éxito!', 'Rutina generada y lista para usar');
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar la rutina');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
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
        <View>
          <Text style={styles.greeting}>Hola, {user?.name}! 👋</Text>
          <Text style={styles.subtitle}>
            {user?.goal} • {user?.frequency} días/semana
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {!routine ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No tienes rutina activa</Text>
          <Text style={styles.emptyText}>
            Genera una rutina personalizada con IA basada en tus objetivos
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGenerateRoutine}>
            <Text style={styles.primaryButtonText}>✨ Generar Rutina con IA</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.routine}>
          <View style={styles.routineHeader}>
            <Text style={styles.routineName}>{routine.name}</Text>
            <Text style={styles.routineDescription}>{routine.description}</Text>
          </View>

          <Text style={styles.sectionTitle}>Días de Entrenamiento</Text>

          {routine.days.map((day) => (
            <TouchableOpacity
              key={day.id}
              style={styles.dayCard}
              onPress={() => navigation.navigate('DayDetail', { day, routineId: routine.id })}
            >
              <View>
                <Text style={styles.dayName}>{day.day_name}</Text>
                <Text style={styles.dayInfo}>{day.exercises.length} ejercicios</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.secondaryButtonText}>Ver Historial</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.regenerateButton} onPress={handleGenerateRoutine}>
            <Text style={styles.regenerateButtonText}>Generar Nueva Rutina</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  banner: {
    backgroundColor: '#FFD60A',
    padding: 8,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  routine: {
    padding: 20,
  },
  routineHeader: {
    marginBottom: 24,
  },
  routineName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  routineDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  dayCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dayName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dayInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  arrow: {
    fontSize: 24,
    color: '#007AFF',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 250,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  regenerateButton: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  regenerateButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
