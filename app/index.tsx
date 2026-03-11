import { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SetupScreen from '@/components/SetupScreen';
import CountdownScreen from '@/components/CountdownScreen';
import { requestNotificationPermissions } from '@/utils/requestNotificationPermissions';

export default function Index() {
  const [hasPreferences, setHasPreferences] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestNotificationPermissions();
    checkPreferences();
  }, []);

  const checkPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem('payday_preferences');

      setHasPreferences(!!stored);
    } catch (error) {
      console.error('Error checking preferences:', error);
      setHasPreferences(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setHasPreferences(true);
  };

  const handleReset = async () => {
    try {
      await AsyncStorage.removeItem('payday_preferences');
    } catch (error) {
      console.error('Error clearing preferences:', error);
    }

    setHasPreferences(false);
  };

  const changeSetup = async () => {
    setHasPreferences(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {hasPreferences ? (
        <CountdownScreen changeSetup={changeSetup} />
      ) : (
        <SetupScreen onComplete={handleSetupComplete} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});