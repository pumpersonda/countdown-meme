import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { supabase, PaydayPreferences } from '@/lib/supabase';

const INTERESTS = [
  'cats',
  'pets',
  'memes',
  'video games',
  'movies',
  'series',
  'music',
  'sports',
  'food',
  'travel',
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
      alert('Please enter a valid payment day (1-31)');
      return;
    }

    if (frequency === 'bi-weekly') {
      if (isNaN(day2) || day2 < 1 || day2 > 31) {
        alert('Please enter valid payment days for bi-weekly (1-31)');
        return;
      }
    }

    const paymentDays =
      frequency === 'monthly' ? [day1] : [day1, day2].sort((a, b) => a - b);

    setLoading(true);

    try {
      const userId = 'default-user';

      const { data: existing } = await supabase
        .from('payday_preferences')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      const preferences: Partial<PaydayPreferences> = {
        user_id: userId,
        frequency,
        payment_days: paymentDays,
        interests: selectedInterests,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        await supabase
          .from('payday_preferences')
          .update(preferences)
          .eq('user_id', userId);
      } else {
        await supabase.from('payday_preferences').insert(preferences);
      }

      onComplete();
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>When do you get paid?</Text>

        <View style={styles.frequencyContainer}>
          <TouchableOpacity
            style={[
              styles.frequencyButton,
              frequency === 'monthly' && styles.frequencyButtonActive,
            ]}
            onPress={() => setFrequency('monthly')}
          >
            <Text
              style={[
                styles.frequencyText,
                frequency === 'monthly' && styles.frequencyTextActive,
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.frequencyButton,
              frequency === 'bi-weekly' && styles.frequencyButtonActive,
            ]}
            onPress={() => setFrequency('bi-weekly')}
          >
            <Text
              style={[
                styles.frequencyText,
                frequency === 'bi-weekly' && styles.frequencyTextActive,
              ]}
            >
              Bi-weekly
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            {frequency === 'monthly'
              ? 'Payment day of the month (1-31):'
              : 'First payment day (1-31):'}
          </Text>
          <TextInput
            style={styles.input}
            value={paymentDay1}
            onChangeText={setPaymentDay1}
            keyboardType="number-pad"
            placeholder="e.g., 15"
            placeholderTextColor="#999"
          />

          {frequency === 'bi-weekly' && (
            <>
              <Text style={styles.label}>Second payment day (1-31):</Text>
              <TextInput
                style={styles.input}
                value={paymentDay2}
                onChangeText={setPaymentDay2}
                keyboardType="number-pad"
                placeholder="e.g., 30"
                placeholderTextColor="#999"
              />
            </>
          )}
        </View>

        <View style={styles.interestsContainer}>
          <Text style={styles.label}>Your Interests:</Text>
          <View style={styles.tagsContainer}>
            {INTERESTS.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.tag,
                  selectedInterests.includes(interest) && styles.tagSelected,
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedInterests.includes(interest) &&
                      styles.tagTextSelected,
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Saving...' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 30,
    textAlign: 'center',
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  frequencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  frequencyTextActive: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
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
    marginBottom: 16,
  },
  interestsContainer: {
    marginBottom: 30,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tagSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  tagTextSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
