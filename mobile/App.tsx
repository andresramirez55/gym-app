import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import * as Updates from 'expo-updates';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import DayDetailScreen from './src/screens/DayDetailScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProgressScreen from './src/screens/ProgressScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Podrías mostrar un splash screen aquí
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="DayDetail"
              component={DayDetailScreen}
              options={{ headerShown: true, title: 'Entrenamiento' }}
            />
            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{ headerShown: true, title: 'Historial' }}
            />
            <Stack.Screen
              name="Progress"
              component={ProgressScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    async function checkForUpdates() {
      try {
        // Solo verificar updates en producción (no en desarrollo)
        if (!__DEV__) {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            // Reiniciar la app para aplicar el update
            await Updates.reloadAsync();
          }
        }
      } catch (error) {
        // Silenciar errores de updates para no afectar la experiencia del usuario
        console.log('Error checking for updates:', error);
      }
    }

    checkForUpdates();
  }, []);

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
