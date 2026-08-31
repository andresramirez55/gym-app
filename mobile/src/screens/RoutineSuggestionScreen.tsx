import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { suggestionApi } from '../services/api';
import type { RoutineSuggestion } from '../types';

const PRIMARY = '#5E5CE6';

export default function RoutineSuggestionScreen({ navigation }: any) {
  const { user } = useAuth();
  const [suggestion, setSuggestion] = useState<RoutineSuggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answerText, setAnswerText] = useState('');

  useEffect(() => {
    loadSuggestion();
  }, []);

  const loadSuggestion = async () => {
    try {
      const data = await suggestionApi.getCurrent(user!.id);
      setSuggestion(data);
    } catch (error) {
      setSuggestion(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!suggestion) return;
    if (!answerText.trim()) {
      Alert.alert('Pegá la respuesta', 'Pegá acá el JSON completo que te devolvió Claude.');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await suggestionApi.submitAnswer(suggestion.id, answerText.trim());
      setSuggestion(updated);
      setAnswerText('');
    } catch (error: any) {
      Alert.alert(
        'No pude interpretar la respuesta',
        error?.response?.data?.error ||
          'Revisá que hayas pegado el JSON completo que te devolvió Claude, sin texto extra alrededor.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleApply = () => {
    if (!suggestion) return;
    Alert.alert(
      '¿Activar esta rutina?',
      'Esto va a reemplazar tu rutina actual. Tu historial de entrenamientos se mantiene intacto.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Activar',
          onPress: async () => {
            setSubmitting(true);
            try {
              await suggestionApi.apply(suggestion.id);
              Alert.alert('¡Listo! 🎉', 'Tu nueva rutina ya está activa.', [
                { text: 'OK', onPress: () => navigation.navigate('Home') },
              ]);
            } catch (error) {
              Alert.alert('Error', 'No se pudo activar la rutina.');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const handleDismiss = () => {
    if (!suggestion) return;
    Alert.alert('¿Descartar?', 'Podés seguir con tu rutina actual y pedir la sugerencia más adelante.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Descartar',
        style: 'destructive',
        onPress: async () => {
          setSubmitting(true);
          try {
            await suggestionApi.dismiss(suggestion.id);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', 'No se pudo descartar la sugerencia.');
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (!suggestion) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyText}>No hay ninguna sugerencia pendiente.</Text>
      </View>
    );
  }

  const hasReview = suggestion.status === 'pending' && !!suggestion.routine;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.diagnosisCard}>
          <Text style={styles.diagnosisTitle}>🎓 Tu ciclo terminó</Text>
          <Text style={styles.diagnosisText}>
            {hasReview
              ? '¿Algo no te cierra? Volvé a la conversación con Claude, pedile los cambios que quieras, y pegá la respuesta corregida acá abajo - se actualiza la vista sin perder nada. Recién cuando estés conforme, activala.'
              : 'Mantené presionado el texto de abajo para copiarlo, pegalo en Claude (la app, la web, o el chat donde estés hablando con Claude), y pegá su respuesta completa más abajo. Si algo no te cierra podés seguir pidiendo cambios en esa misma conversación antes de pegar la versión final.'}
          </Text>
        </View>

        <Text style={styles.sectionLabel}>PROMPT PARA COPIAR</Text>
        <TextInput
          style={styles.promptBox}
          value={suggestion.prompt}
          editable={false}
          multiline
          selectTextOnFocus
        />

        <Text style={styles.sectionLabel}>
          {hasReview ? 'PEGAR UNA RESPUESTA CORREGIDA (opcional)' : 'RESPUESTA DE CLAUDE'}
        </Text>
        <TextInput
          style={styles.answerBox}
          value={answerText}
          onChangeText={setAnswerText}
          placeholder="Pegá acá el JSON completo que te devolvió Claude..."
          placeholderTextColor="#C0C0C8"
          multiline
        />

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, { marginBottom: hasReview ? 24 : 0 }]}
          onPress={handleSubmitAnswer}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting && !hasReview ? (
            <ActivityIndicator size="small" color={PRIMARY} />
          ) : (
            <Text style={styles.secondaryButtonText}>
              {hasReview ? '🔄 Actualizar con esta respuesta' : 'Enviar respuesta'}
            </Text>
          )}
        </TouchableOpacity>

        {hasReview && suggestion.routine && (
          <>
            <Text style={styles.routineName}>{suggestion.routine.name}</Text>
            <Text style={styles.routineMeta}>
              {suggestion.routine.duration_weeks} semanas · {suggestion.routine.frequency} días/semana
            </Text>

            {suggestion.routine.days.map((day, dayIndex) => (
              <View key={dayIndex} style={styles.dayCard}>
                <Text style={styles.dayName}>{day.day_name}</Text>
                {day.exercises.map((ex, exIndex) => (
                  <View key={exIndex} style={styles.exerciseRow}>
                    <View style={styles.exerciseHeader}>
                      <Text style={styles.exerciseName}>{ex.name}</Text>
                      <Text style={styles.exerciseSets}>{ex.sets} × {ex.reps}</Text>
                    </View>
                    {ex.notes ? <Text style={styles.exerciseNotes}>💡 {ex.notes}</Text> : null}
                  </View>
                ))}
              </View>
            ))}

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.button, styles.dismissButton]}
                onPress={handleDismiss}
                disabled={submitting}
              >
                <Text style={styles.dismissButtonText}>Descartar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.applyButton]}
                onPress={handleApply}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.applyButtonText}>✨ Activar rutina</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {!hasReview && (
          <TouchableOpacity
            style={[styles.button, styles.dismissButton, { marginTop: 16 }]}
            onPress={handleDismiss}
            disabled={submitting}
          >
            <Text style={styles.dismissButtonText}>Descartar</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FC',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8FC',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  diagnosisCard: {
    backgroundColor: '#F0F0FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0DFFC',
  },
  diagnosisTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 8,
  },
  diagnosisText: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  promptBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    padding: 14,
    fontSize: 12,
    color: '#3C3C43',
    lineHeight: 18,
    minHeight: 160,
    maxHeight: 280,
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  answerBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    padding: 14,
    fontSize: 13,
    color: '#1C1C1E',
    lineHeight: 18,
    minHeight: 120,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  secondaryButton: {
    backgroundColor: '#F0F0FF',
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
  secondaryButtonText: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: '700',
  },
  routineName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  routineMeta: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
    marginBottom: 16,
  },
  dayCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dayName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 10,
  },
  exerciseRow: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 8,
  },
  exerciseSets: {
    fontSize: 13,
    color: '#6E6E73',
    fontWeight: '600',
  },
  exerciseNotes: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  button: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButton: {
    backgroundColor: '#F2F2F7',
  },
  dismissButtonText: {
    color: '#6E6E73',
    fontSize: 15,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: PRIMARY,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
});
