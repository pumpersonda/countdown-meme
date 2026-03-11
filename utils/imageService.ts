import type { ImageProvider } from './imageProvider';
import { HuggingFaceProvider } from './providers/huggingface';
import { LoremFlickrProvider } from './providers/loremflickr';

const MOOD_KEYWORDS: Record<string, string[]> = {
  happy: ['happy', 'excited', 'celebrating', 'joyful'],
  neutral: ['calm', 'relaxed', 'peaceful', 'waiting patiently'],
  worried: ['worried', 'anxious', 'stressed', 'nervous'],
  sad: ['sad', 'tired', 'broke', 'desperate'],
};

const INTEREST_TRANSLATIONS: Record<string, string> = {
  gatos: 'cats',
  mascotas: 'pets',
  memes: 'memes',
  videojuegos: 'video games',
  películas: 'movies',
  series: 'tv shows',
  música: 'music',
  deportes: 'sports',
  comida: 'food',
  viajes: 'travel',
};

const hfToken = process.env.EXPO_PUBLIC_HF_TOKEN;

// Swap this out for any ImageProvider implementation (e.g. OpenAI, fal.ai, Pollinations)
const provider: ImageProvider = hfToken
  ? new HuggingFaceProvider(hfToken)
  : new LoremFlickrProvider();

export function buildPrompt(mood: string, interests: string[]): string {
  const moodKeywords = MOOD_KEYWORDS[mood] ?? MOOD_KEYWORDS.neutral;
  const moodWord = moodKeywords[Math.floor(Math.random() * moodKeywords.length)];

  const translatedInterests = interests
    .map((i) => INTEREST_TRANSLATIONS[i] ?? i)
    .join(', ');

  return translatedInterests
    ? `funny meme about ${translatedInterests}, feeling ${moodWord}, humorous illustration`
    : `funny meme feeling ${moodWord}, humorous illustration`;
}

export async function generateImage(mood: string, interests: string[]): Promise<string> {
  const prompt = buildPrompt(mood, interests);
  return provider.generateImage(prompt);
}
