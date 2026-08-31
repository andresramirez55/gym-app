import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { userApi } from '../services/api';

// Cómo se ven las notificaciones cuando la app está en primer plano.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Pide permiso de notificaciones (si todavía no se dio), obtiene el push
 * token de Expo y lo registra en el backend para este usuario.
 * Falla en silencio: si el usuario no da permiso, o corre en un simulador,
 * simplemente no se registra el token y la app sigue funcionando normal.
 */
export async function registerForPushNotifications(userId: number): Promise<void> {
  try {
    if (!Device.isDevice) {
      return; // los emuladores/simuladores no soportan push
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );

    await userApi.registerPushToken(userId, tokenResponse.data);
  } catch (error) {
    console.log('Error registering for push notifications:', error);
  }
}
