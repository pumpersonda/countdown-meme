import * as Notifications from 'expo-notifications';

export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();

  if (status !== 'granted') {
    alert('Necesitamos permiso para enviarte notificaciones');
  }
}