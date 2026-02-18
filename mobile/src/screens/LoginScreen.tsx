import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import { userApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const GOALS = [
  { value: 'gain_muscle', label: 'Ganar Músculo', icon: '💪' },
  { value: 'lose_weight', label: 'Perder Peso', icon: '🔥' },
  { value: 'strength', label: 'Fuerza', icon: '🏋️' },
  { value: 'endurance', label: 'Resistencia', icon: '🏃' },
];

const FREQUENCIES = [
  { value: 2, label: '2 días' },
  { value: 3, label: '3 días' },
  { value: 4, label: '4 días' },
  { value: 5, label: '5 días' },
];

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [goal, setGoal] = useState('gain_muscle');
  const [frequency, setFrequency] = useState(5);

  const handleRegister = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const user = await userApi.create({ name, email, goal, frequency });
      await signIn(user.id);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo conectar. Verifica tu conexión a internet.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Preparando tu entrenamiento...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} bounces={false}>
      <StatusBar barStyle="light-content" />

      {/* Hero Header */}
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>🏋️</Text>
        <Text style={styles.heroTitle}>GymApp</Text>
        <Text style={styles.heroSubtitle}>Tu entrenamiento, personalizado con IA</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Cuéntanos sobre vos</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="¿Cómo te llamás?"
            placeholderTextColor="#A0A0A8"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            placeholderTextColor="#A0A0A8"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>¿Cuál es tu objetivo?</Text>
          <View style={styles.goalGrid}>
            {GOALS.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[styles.goalOption, goal === g.value && styles.goalOptionSelected]}
                onPress={() => setGoal(g.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.goalIcon}>{g.icon}</Text>
                <Text style={[styles.goalText, goal === g.value && styles.goalTextSelected]}>
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Días de entrenamiento por semana</Text>
          <View style={styles.freqRow}>
            {FREQUENCIES.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={[styles.freqOption, frequency === f.value && styles.freqOptionSelected]}
                onPress={() => setFrequency(f.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.freqNumber, frequency === f.value && styles.freqNumberSelected]}>
                  {f.value}
                </Text>
                <Text style={[styles.freqLabel, frequency === f.value && styles.freqLabelSelected]}>
                  días
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Empezar ahora →</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Tu sesión se guarda automáticamente. Si ya tenés cuenta, ingresá con el mismo email.
        </Text>

        <Text style={styles.credits}>Creado por Andres Ramirez</Text>
      </View>
    </ScrollView>
  );
}

const PRIMARY = '#5E5CE6';
const PRIMARY_DARK = '#4240B8';

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  hero: {
    backgroundColor: PRIMARY,
    paddingTop: 80,
    paddingBottom: 48,
    alignItems: 'center',
    gap: 8,
  },
  heroIcon: {
    fontSize: 56,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  form: {
    padding: 24,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6E6E73',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: '#1C1C1E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  goalOption: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 14,
    width: '47%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  goalOptionSelected: {
    borderColor: PRIMARY,
    backgroundColor: '#F0F0FF',
  },
  goalIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  goalText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6E6E73',
    textAlign: 'center',
  },
  goalTextSelected: {
    color: PRIMARY,
  },
  freqRow: {
    flexDirection: 'row',
    gap: 12,
  },
  freqOption: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  freqOptionSelected: {
    borderColor: PRIMARY,
    backgroundColor: '#F0F0FF',
  },
  freqNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  freqNumberSelected: {
    color: PRIMARY,
  },
  freqLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  freqLabelSelected: {
    color: PRIMARY,
  },
  button: {
    backgroundColor: PRIMARY,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  disclaimer: {
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  credits: {
    color: '#C0C0C8',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 8,
    fontSize: 12,
  },
});
