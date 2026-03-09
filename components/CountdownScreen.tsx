import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { supabase, PaydayPreferences } from '@/lib/supabase';
import {
  calculateDaysUntilPayday,
  getMoodCategory,
} from '@/utils/dateCalculations';
import { getImageQuery, getPlaceholderImageUrl } from '@/utils/imageService';

interface CountdownScreenProps {
  onReset: () => void;
}

const MOOD_IMAGES: Record<string, string> = {
  happy:
    'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg?auto=compress&cs=tinysrgb&w=800',
  neutral:
    'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg?auto=compress&cs=tinysrgb&w=800',
  worried:
    'https://images.pexels.com/photos/1420701/pexels-photo-1420701.jpeg?auto=compress&cs=tinysrgb&w=800',
  sad: 'https://images.pexels.com/photos/2194261/pexels-photo-2194261.jpeg?auto=compress&cs=tinysrgb&w=800',
};

export default function CountdownScreen({ onReset }: CountdownScreenProps) {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<PaydayPreferences | null>(
    null
  );

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('payday_preferences')
        .select('*')
        .eq('user_id', 'default-user')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences(data);
        const days = calculateDaysUntilPayday(
          data.frequency,
          data.payment_days
        );
        setDaysRemaining(days);

        const mood = getMoodCategory(days);
        const query = getImageQuery(mood, data.interests);
        setImageUrl(MOOD_IMAGES[mood] || MOOD_IMAGES.neutral);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (daysRemaining === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No payday preferences found</Text>
        <TouchableOpacity style={styles.resetButton} onPress={onReset}>
          <Text style={styles.resetButtonText}>Setup Payday</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Faltan {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'} para que
          te paguen
        </Text>

        {imageUrl ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        ) : null}

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Payment Frequency:</Text>
          <Text style={styles.infoValue}>
            {preferences?.frequency === 'monthly' ? 'Monthly' : 'Bi-weekly'}
          </Text>

          <Text style={styles.infoLabel}>Payment Days:</Text>
          <Text style={styles.infoValue}>
            {preferences?.payment_days.join(', ')}
          </Text>

          {preferences?.interests && preferences.interests.length > 0 && (
            <>
              <Text style={styles.infoLabel}>Your Interests:</Text>
              <Text style={styles.infoValue}>
                {preferences.interests.join(', ')}
              </Text>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={onReset}>
          <Text style={styles.resetButtonText}>Change Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 32,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 30,
    backgroundColor: '#e0e0e0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1a1a1a',
  },
  resetButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 20,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
});
