import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INTERESTS = [
  'gatos',
  'mascotas',
  'memes',
  'videojuegos',
  'películas',
  'series',
  'música',
  'deportes',
  'comida',
  'viajes'
];

const PRIMARY_COLORS = [
  '#007AFF', // Azul original
  '#FF3B30', // Rojo
  '#34C759', // Verde
  '#FF9500', // Naranja
  '#5856D6', // Morado
  '#AF52DE', // Violeta
  '#FF2D55', // Rosa fuerte
  '#00C7BE'  // Turquesa
];

interface SetupScreenProps {
  onComplete: () => void;
}

export default function SetupScreen({ onComplete }: SetupScreenProps) {
  const [frequency, setFrequency] = useState<'monthly' | 'bi-weekly'>(
    'monthly'
  );
  const [paymentDay1, setPaymentDay1] = useState('');
  const [paymentDay2, setPaymentDay2] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [primaryColor, setPrimaryColor] = useState('#007AFF');
  const [loading, setLoading] = useState(false);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmit = async () => {
    const day1 = parseInt(paymentDay1);
    const day2 = parseInt(paymentDay2);

    if (isNaN(day1) || day1 < 1 || day1 > 31) {
      alert('Por favor ingresa un día de pago válido (1-31)');
      return;
    }

    if (frequency === 'bi-weekly') {
      if (isNaN(day2) || day2 < 1 || day2 > 31) {
        alert('Por favor ingresa días de pago válidos para quincenal (1-31)');
        return;
      }
    }

    const paymentDays =
      frequency === 'monthly' ? [day1] : [day1, day2].sort((a, b) => a - b);

    setLoading(true);

    try {
      const preferences = {
        frequency,
        payment_days: paymentDays,
        interests: selectedInterests,
        primary_color: primaryColor,
        updated_at: new Date().toISOString()
      };

      await AsyncStorage.setItem(
        'payday_preferences',
        JSON.stringify(preferences)
      );

      onComplete();
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('No se pudieron guardar las preferencias. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>¿Cuándo te pagan?</Text>

        <View style={styles.frequencyContainer}>
          <TouchableOpacity
            style={[
              styles.frequencyButton,
              frequency === 'monthly' && {
                backgroundColor: primaryColor,
                borderColor: primaryColor
              }
            ]}
            onPress={() => setFrequency('monthly')}
          >
            <Text
              style={[
                styles.frequencyText,
                frequency === 'monthly' && { color: '#fff' }
              ]}
            >
              Mensual
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.frequencyButton,
              frequency === 'bi-weekly' && {
                backgroundColor: primaryColor,
                borderColor: primaryColor
              }
            ]}
            onPress={() => setFrequency('bi-weekly')}
          >
            <Text
              style={[
                styles.frequencyText,
                frequency === 'bi-weekly' && { color: '#fff' }
              ]}
            >
              Quincenal
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            {frequency === 'monthly'
              ? 'Día de pago del mes (1-31):'
              : 'Primer día de pago (1-31):'}
          </Text>

          <TextInput
            style={styles.input}
            value={paymentDay1}
            onChangeText={setPaymentDay1}
            keyboardType="number-pad"
            placeholder="ej. 15"
            placeholderTextColor="#999"
          />

          {frequency === 'bi-weekly' && (
            <>
              <Text style={styles.label}>Segundo día de pago (1-31):</Text>

              <TextInput
                style={styles.input}
                value={paymentDay2}
                onChangeText={setPaymentDay2}
                keyboardType="number-pad"
                placeholder="ej. 30"
                placeholderTextColor="#999"
              />
            </>
          )}
        </View>

        <View style={styles.interestsContainer}>
          <Text style={styles.label}>Tus intereses:</Text>

          <View style={styles.tagsContainer}>
            {INTERESTS.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.tag,
                  selectedInterests.includes(interest) && {
                    backgroundColor: primaryColor,
                    borderColor: primaryColor
                  }
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedInterests.includes(interest) && { color: '#fff' }
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* === NUEVA SECCIÓN: Color de los botones === */}
        <View style={styles.colorContainer}>
          <Text style={styles.label}>Color de los botones:</Text>
          <View style={styles.colorsContainer}>
            {PRIMARY_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: color },
                  primaryColor === color && styles.colorSwatchSelected
                ]}
                onPress={() => setPrimaryColor(color)}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: primaryColor },
            loading && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  content: {
    padding: 20,
    paddingTop: 60
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 30,
    textAlign: 'center'
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center'
  },
  frequencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666'
  },
  inputContainer: {
    marginBottom: 30
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 16
  },
  interestsContainer: {
    marginBottom: 30
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  tag: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666'
  },
  colorContainer: {
    marginBottom: 30
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start'
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#e0e0e0'
  },
  colorSwatchSelected: {
    borderColor: '#1a1a1a',
    borderWidth: 4
  },
  submitButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40
  },
  submitButtonDisabled: {
    opacity: 0.6
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff'
  }
});