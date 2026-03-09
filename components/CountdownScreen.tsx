import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import {
  calculateDaysUntilPayday,
  getMoodCategory
} from '@/utils/dateCalculations';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PaydayPreferences {
  id?: string;
  user_id: string;
  frequency: 'monthly' | 'bi-weekly';
  payment_days: number[];
  interests: string[];
  created_at?: string;
  updated_at?: string;
}

interface CountdownScreenProps {
  onReset: () => void;
}

const MOOD_IMAGES: Record<string, string[]> = {
  happy: [
    'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg',
    'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg'
  ],
  neutral: [
    'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg',
    'https://images.pexels.com/photos/356378/pexels-photo-356378.jpeg'
  ],
  worried: [
    'https://images.pexels.com/photos/1420701/pexels-photo-1420701.jpeg',
    'https://images.pexels.com/photos/3772618/pexels-photo-3772618.jpeg'
  ],
  sad: [
    'https://images.pexels.com/photos/2194261/pexels-photo-2194261.jpeg',
    'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg'
  ]
};

export default function CountdownScreen({ onReset }: CountdownScreenProps) {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<PaydayPreferences | null>(
    null
  );

  const [selectedCategory, setSelectedCategory] = useState<string>('neutral');
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    loadPreferences();
  }, []);


  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem('payday_preferences');

      if (!stored) {
        return;
      }

      const data = JSON.parse(stored);

      setPreferences(data);

      const days = calculateDaysUntilPayday(
        data.frequency,
        data.payment_days
      );

      setDaysRemaining(days);

      const mood = getMoodCategory(days);

      setSelectedCategory(mood);
      setImageIndex(0);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const images = MOOD_IMAGES[selectedCategory] || [];
  const imageUrl = images[imageIndex];


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

        {imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}

        <TouchableOpacity style={styles.resetButton} onPress={onReset}>
          <Text style={styles.resetButtonText}>Cambiar ajustes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    alignItems: 'center'
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30
  },

  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20
  },

  image: {
    width: '100%',
    height: '100%'
  },

  imageControls: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20
  },

  controlText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '700'
  },

  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },

  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 6,
    borderRadius: 8,
    backgroundColor: '#e0e0e0'
  },

  categorySelected: {
    backgroundColor: '#007AFF'
  },

  categoryText: {
    color: '#000',
    fontWeight: '600'
  },

  resetButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 20
  },

  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },

  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20
  }
});