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
} from 'react-native';
import { userApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const GOALS = [
  { value: 'gain_muscle', label: 'Ganar Músculo' },
  { value: 'lose_weight', label: 'Perder Peso' },
  { value: 'strength', label: 'Fuerza' },
  { value: 'endurance', label: 'Resistencia' },
];

const FREQUENCIES = [3, 4, 5];

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login fields
  const [userId, setUserId] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [goal, setGoal] = useState('gain_muscle');
  const [frequency, setFrequency] = useState(5);

  const handleLogin = async () => {
    if (!userId) {
      Alert.alert('Error', 'Por favor ingresa tu ID de usuario');
      return;
    }

    setLoading(true);
    try {
      await signIn(parseInt(userId, 10));
    } catch (error) {
      Alert.alert('Error', 'Usuario no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const user = await userApi.create({
        name,
        email,
        goal,
        frequency,
      });
      await signIn(user.id);
      Alert.alert('Éxito', '¡Usuario creado exitosamente!');
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el usuario');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>💪 Gym App</Text>
      <Text style={styles.subtitle}>Tu entrenador personal con IA</Text>

      {!isRegister ? (
        // Login Form
        <View style={styles.form}>
          <Text style={styles.label}>ID de Usuario</Text>
          <TextInput
            style={styles.input}
            value={userId}
            onChangeText={setUserId}
            placeholder="Ingresa tu ID"
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsRegister(true)}>
            <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Register Form
        <View style={styles.form}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Objetivo</Text>
          <View style={styles.optionsContainer}>
            {GOALS.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[styles.option, goal === g.value && styles.optionSelected]}
                onPress={() => setGoal(g.value)}
              >
                <Text style={[styles.optionText, goal === g.value && styles.optionTextSelected]}>
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Días por semana</Text>
          <View style={styles.optionsContainer}>
            {FREQUENCIES.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.option, frequency === f && styles.optionSelected]}
                onPress={() => setFrequency(f)}
              >
                <Text style={[styles.optionText, frequency === f && styles.optionTextSelected]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Registrarse</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsRegister(false)}>
            <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  option: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    minWidth: 80,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  optionTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
});
