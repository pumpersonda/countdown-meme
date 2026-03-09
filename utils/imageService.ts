const MOOD_KEYWORDS: Record<string, string[]> = {
  happy: ['happy', 'excited', 'celebration', 'joy'],
  neutral: ['calm', 'relaxed', 'peaceful', 'patient'],
  worried: ['concerned', 'thinking', 'waiting', 'anxious'],
  sad: ['sad', 'tired', 'broke', 'empty wallet'],
};

export function getImageQuery(
  mood: string,
  interests: string[]
): string {
  const moodKeywords = MOOD_KEYWORDS[mood] || MOOD_KEYWORDS.neutral;
  const randomMoodKeyword =
    moodKeywords[Math.floor(Math.random() * moodKeywords.length)];

  if (interests.length > 0) {
    const randomInterest =
      interests[Math.floor(Math.random() * interests.length)];
    return `${randomInterest} ${randomMoodKeyword}`;
  }

  return randomMoodKeyword;
}

export function getPlaceholderImageUrl(query: string): string {
  const encodedQuery = encodeURIComponent(query);
  return `https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800`;
}
