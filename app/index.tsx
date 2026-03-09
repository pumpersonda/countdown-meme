import { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import SetupScreen from '@/components/SetupScreen';
import CountdownScreen from '@/components/CountdownScreen';
import { supabase } from '@/lib/supabase';

export default function Index() {
  const [hasPreferences, setHasPreferences] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPreferences();
  }, []);

  const checkPreferences = async () => {
    try {
      const { data } = await supabase
        .from('payday_preferences')
        .select('id')
        .eq('user_id', 'default-user')
        .maybeSingle();

      setHasPreferences(!!data);
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

  const handleReset = () => {
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
        <CountdownScreen onReset={handleReset} />
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
