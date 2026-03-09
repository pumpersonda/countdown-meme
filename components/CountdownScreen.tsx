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
  primary_color?: string;
  created_at?: string;
  updated_at?: string;
}

interface CountdownScreenProps {
  onReset: () => void;
}

// === NUEVA ESTRUCTURA: Imágenes por INTERÉS + por estado de ánimo ===
const IMAGES_DB: Record<string, Record<string, string[]>> = {
  generic: {
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
      'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExNnB3NjdkMDF0ZjhyYTN5M256cnF5M2cxOWJwcnVxdDVsd3Q4Z29rZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/98MaHVwJOmWMz4cz1K/giphy.gif',
      'https://images.pexels.com/photos/2194261/pexels-photo-2194261.jpeg',
      'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg'
    ]
  },

  // Ejemplo completo para "gatos" (puedes copiar esta estructura para los demás intereses)
  gatos: {
    happy: [
      'https://images.pexels.com/photos/104827/pexels-photo-104827.jpeg',
      'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg',
      'https://images.pexels.com/photos/45201/pexels-photo-45201.jpeg'
    ],
    neutral: [
      'https://images.pexels.com/photos/20787/pexels-photo-20787.jpeg',
      'https://images.pexels.com/photos/144098/pexels-photo-144098.jpeg'
    ],
    worried: [
      'https://images.pexels.com/photos/248547/pexels-photo-248547.jpeg'
    ],
    sad: [
      'https://images.pexels.com/photos/25033908/pexels-photo-25033908.jpeg',
      'https://images.pexels.com/photos/1564504/pexels-photo-1564504.jpeg'
    ]
  },

  // Puedes duplicar o personalizar para otros intereses
  mascotas: {
    happy: [
      'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg', // perro feliz
      'https://images.pexels.com/photos/1809343/pexels-photo-1809343.jpeg'
    ],
    neutral: [],
    worried: [],
    sad: []
  },

  // TODO: agrega aquí memes, videojuegos, películas, etc.
  memes: { happy: [], neutral: [], worried: [], sad: [] },
  videojuegos: { happy: [], neutral: [], worried: [], sad: [] },
  películas: { happy: [], neutral: [], worried: [], sad: [] },
  series: { happy: [], neutral: [], worried: [], sad: [] },
  música: { happy: [], neutral: [], worried: [], sad: [] },
  deportes: { happy: [], neutral: [], worried: [], sad: [] },
  comida: { happy: [], neutral: [], worried: [], sad: [] },
  viajes: { happy: [], neutral: [], worried: [], sad: [] }
};

export default function CountdownScreen({ onReset }: CountdownScreenProps) {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<PaydayPreferences | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#007AFF');

  const [selectedCategory, setSelectedCategory] = useState<string>('neutral');
  const [imageIndex, setImageIndex] = useState(0);
  const [currentInterest, setCurrentInterest] = useState<string>('generic'); // ← NUEVO

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

      // === NUEVA LÓGICA: elegimos un interés del usuario al azar ===
      const userInterests = data.interests || [];
      const chosenInterest =
        userInterests.length > 0
          ? userInterests[Math.floor(Math.random() * userInterests.length)]
          : 'generic';

      setCurrentInterest(chosenInterest);

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

  // === NUEVA LÓGICA: imágenes del interés + mood (fallback a generic) ===
  const images =
    IMAGES_DB[currentInterest]?.[selectedCategory] ||
    IMAGES_DB.generic[selectedCategory] ||
    [];

  const imageUrl = images[imageIndex];

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

        {imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}

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

  resetButton: {
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