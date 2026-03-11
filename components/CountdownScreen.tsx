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
  changeSetup: () => void;
}

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

  gatos: {
    happy: [
      'https://m.media-amazon.com/images/I/71nZPk6ytzL._AC_SL1500_.jpg',
      'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg',
      'https://thumbs.dreamstime.com/b/gato-feliz-con-sonrisa-divertida-en-la-cartulina-aislada-blanco-103832511.jpg?w=768'
    ],
    neutral: [
      'https://imgs.search.brave.com/pZl85ZUK0r9SLiA92fhJrf_cV94q3XZVVr_LMu2tnpU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9paDEu/cmVkYnViYmxlLm5l/dC9pbWFnZS41OTE4/MDUzODcyLjA0NjYv/cHAsNTA0eDQ5OC1w/YWQsNjAweDYwMCxm/OGY4ZjgudTIuanBn',
      'https://imgs.search.brave.com/VD_-oZ7TTtj0OdLlr0EagIlsZwxdU35LHUUlRqEuyD0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9paDEu/cmVkYnViYmxlLm5l/dC9pbWFnZS4zMDE4/NTMxNDU4Ljc1Mjkv/ZnBvc3RlcixzbWFs/bCx3YWxsX3RleHR1/cmUsc3F1YXJlX3By/b2R1Y3QsNjAweDYw/MC5qcGc'
    ],
    worried: [
      'https://imgs.search.brave.com/M_6XYvS7zlKhgxMqQt3Oyh9aCmAg8TNpCvzl9zMDhhA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTMw/NDA4MTc3Ny9waG90/by9icml0aXNoLXNo/b3J0aGFpci1jYXQu/anBnP3M9NjEyeDYx/MiZ3PTAmaz0yMCZj/PWR0NVZjNUtSRmlp/Q2o2TmlGUl9rcVJa/a2NreVdsMWVqS0lw/ZjJ1T3VjaWM9'
    ],
    sad: [
      'https://imgs.search.brave.com/EQCAlzdEhvcoJW1lxT33rcKGPaHR63GylmFZHYhfCRE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YTQuZ2lwaHkuY29t/L21lZGlhL3YxLlky/bGtQVGM1TUdJM05q/RXhjV1YyY0RCcGRU/VTJhRGR3TTJ0MWFu/cGxObll6Tkhsck1X/eHFOMkp6YkRad2R6/aHRhWFZsT1NabGNE/MTJNVjluYVdaelgz/TmxZWEpqYUNaamRE/MW4vN0F6RVhkSWIx/d3lDVFdKbnRiL2dp/cGh5LmdpZg.gif',
      'https://imgs.search.brave.com/GE5ue18SErDh6cbTpcsMMAA-fWcT0jFH5AWUUPEntt0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvaGQvc2Fk/LWNhdC1waWN0dXJl/cy1wZ2k0ZDA5NGVi/YTdiMTl0LmpwZw'
    ]
  },
  mascotas: {
    happy: [
      'https://imgs.search.brave.com/0uUff7ADCphi-svC1cUEv9YSJxG-RT2YuLu3r72NmOY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLndh/aHVwLmNvbS9tZWRp/YS90bXBfbWVtZV9p/bWFnZXMvYTE5MWI4/MWYtYTAwNC00NGJm/LWJlZTgtZmI4NzI1/YmNlZmNlLnBuZw', // perro feliz
      'https://imgs.search.brave.com/tv9qjDo0OYoU9_BEKsGTL2dYiJQKJAKRZRYtvu8RaqQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLmlt/Z2ZsaXAuY29tLzQv/MjA4amdiLmpwZw'
    ],
    neutral: [
      'https://imgs.search.brave.com/mJA6mqA2je7DRmm0iuF0j8ZWhkvr-wlLSOCDcQGXnCU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvNDgy/MDE1NDk4L3Bob3Rv/L3NlcmlvdXMtZG9n/LWluLWdsYXNzZXMt/cmVhZGluZy1hLWJv/b2suanBnP3M9NjEy/eDYxMiZ3PTAmaz0y/MCZjPVROVnA5enl4/Sjd3Y3BqTEY1Yk5M/YVE2UFhoYzJRMUsx/RnJIX3dmM2JOYVE9',
      'https://imgs.search.brave.com/VPO40WUjX35tM16Pyv8cCVOhklH3k3p9x2Q5goS_CKE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS50ZW5vci5jb20v/MnJtNnpVQUR2bGdB/QUFBTS9kb2ctc2Vy/aW91cy5naWY.gif'
    ],
    worried: [
      'https://imgs.search.brave.com/cC6l2TZEFPxufRdushWdwgrNlR8AYMlyfg0CW2XKWYE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTM1/NTcxNTE5My9waG90/by93b3JyaWVkLWRv/Zy1pbi1jYXItbmVy/dm91cy1kb2ctaW4t/Y2FyLmpwZz9zPTYx/Mng2MTImdz0wJms9/MjAmYz1PaGpGX2Y2/QklhcmM5WE1qOXhf/dHdhcFVoYXZ1ZzUz/dlFuemdzNjloUFFJ/PQ'
    ],
    sad: [
      'https://imgs.search.brave.com/E-xQkaWkaErpK1po_4izeQRGVLk4cW51fwxMRa7hqM4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLmlt/Z2ZsaXAuY29tLzQv/YWVtNGYuanBn'
    ]
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

export default function CountdownScreen({ changeSetup }: CountdownScreenProps) {
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

      // Chosse one randomly
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
          onPress={changeSetup}
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
          onPress={changeSetup}
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