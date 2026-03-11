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
import { generateImage } from '@/utils/imageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PaydayPreferences {
  id?: string;
  user_id: string;
  frequency: 'monthly' | 'bi-weekly';
  payment_days: number[];
  interests: string[];
  primary_color?: string;
  created_at?: string;
  updated_at?: string;
}

interface CountdownScreenProps {
  onReset: () => void;
}


export default function CountdownScreen({ onReset }: CountdownScreenProps) {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<PaydayPreferences | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#007AFF');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem('payday_preferences');
      if (!stored) return;

      const data: PaydayPreferences = JSON.parse(stored);
      setPreferences(data);
      setPrimaryColor(data.primary_color || '#007AFF');

      const days = calculateDaysUntilPayday(data.frequency, data.payment_days);
      setDaysRemaining(days);

      const mood = getMoodCategory(days);
      fetchImage(mood, data.interests || []);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchImage = async (mood: string, interests: string[]) => {
    setImageLoading(true);
    setImageUrl(null);
    try {
      const url = await generateImage(mood, interests);
      setImageUrl(url);
      // base64 data URIs are already in memory — no network load needed
      if (url.startsWith('data:')) {
        setImageLoading(false);
      }
      // remote URLs: onLoadEnd on <Image> will turn off the spinner
    } catch (error) {
      console.error('Error generating image:', error);
      setImageLoading(false);
    }
  };

  const handleRefreshImage = () => {
    if (!preferences) return;
    const mood = getMoodCategory(daysRemaining ?? 99);
    fetchImage(mood, preferences.interests || []);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  if (daysRemaining === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No payday preferences found</Text>
        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: primaryColor }]}
          onPress={onReset}
        >
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

        <View style={styles.imageContainer}>
          {imageLoading && (
            <ActivityIndicator size="large" color={primaryColor} style={styles.imageLoader} />
          )}
          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={[styles.image, imageLoading && { display: 'none' }]}
              resizeMode="contain"
              onLoadEnd={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
          )}
        </View>

<TouchableOpacity
          style={[styles.refreshButton, { borderColor: primaryColor }]}
          onPress={handleRefreshImage}
          disabled={imageLoading}
        >
          <Text style={[styles.refreshButtonText, { color: primaryColor }]}>
            Otra imagen
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: primaryColor }]}
          onPress={onReset}
        >
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

  imageLoader: {
    flex: 1,
  },

refreshButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 12,
  },

  refreshButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },

  resetButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 12,
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