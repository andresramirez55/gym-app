import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import * as Updates from 'expo-updates';
import { registerForPushNotifications } from './src/utils/pushNotifications';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import DayDetailScreen from './src/screens/DayDetailScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import RoutineSuggestionScreen from './src/screens/RoutineSuggestionScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      registerForPushNotifications(user.id);
    }
  }, [user]);

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
            <Stack.Screen
              name="Calendar"
              component={CalendarScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="RoutineSuggestion"
              component={RoutineSuggestionScreen}
              options={{ headerShown: true, title: 'Sugerencia de Claude' }}
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
        // Verificar updates (temporalmente habilitado en desarrollo también)
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          // Reiniciar la app para aplicar el update
          await Updates.reloadAsync();
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
