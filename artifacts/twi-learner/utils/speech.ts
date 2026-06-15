import { Audio } from 'expo-av';
import { AUDIO_MAP } from '@/constants/audio-map';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

let currentSound: Audio.Sound | null = null;
let currentOnDoneTimer: ReturnType<typeof setTimeout> | null = null;

export const playAudioForId = async (id: string, onDone?: () => void) => {
  try {
    await stopSpeech();
    
    const audioRes = AUDIO_MAP[id.toString()];
    if (!audioRes) {
      console.warn(`No audio found for ID: ${id}`);
      if (onDone) onDone();
      return;
    }

    const { sound } = await Audio.Sound.createAsync(audioRes);
    currentSound = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        if (onDone) onDone();
      }
    });

    await sound.playAsync();
  } catch (error) {
    console.error('Error playing audio:', error);
    if (onDone) onDone();
  }
};

// Kept for backward compatibility during transition, redirects to ID playback if possible
export const speakText = async (text: string, rate = 0.8) => {
  // If the text matches an ID directly, play it.
  // Otherwise, we might need a fallback, or just do nothing.
  // We'll map known patterns from the UI to IDs.
  
  // E.g. "1. Baako." -> extract "1"
  const numMatch = text.match(/^(\d+)\./);
  if (numMatch) {
    return playAudioForId(numMatch[1]);
  }

  // E.g. "A. Twi name: A..." -> extract "A"
  const letterMatch = text.match(/^([A-ZƐƆ])\./);
  if (letterMatch) {
    // Map Epsilon and Opsilon
    let id = letterMatch[1];
    if (id === 'Ɛ') id = 'EPS';
    if (id === 'Ɔ') id = 'OPS';
    return playAudioForId(id);
  }
};

export const speakLetter = async (
  letter: string,
  onDone: () => void,
  rate = 0.65,
  useTts = false
) => {
  if (useTts) {
    if (currentOnDoneTimer) {
      clearTimeout(currentOnDoneTimer);
      currentOnDoneTimer = null;
    }
    await stopSpeech();

    // Map special Twi letters for TTS spelling to make them clean
    let speakChar = letter;
    if (speakChar.toUpperCase() === 'Ɛ') speakChar = 'E';
    if (speakChar.toUpperCase() === 'Ɔ') speakChar = 'O';

    const estimatedMs = Math.max(700, 300 / rate);

    if (Platform.OS === 'web') {
      Speech.speak(speakChar, { language: 'en-GB', rate });
      currentOnDoneTimer = setTimeout(onDone, estimatedMs);
    } else {
      Speech.speak(speakChar, {
        language: 'en-GB',
        rate,
        onDone,
      });
    }
    return;
  }

  // For spelling, letter is 'B', 'a', 'a', 'k', 'o' etc.
  // Convert to upper case and map to EPS/OPS
  let id = letter.toUpperCase();
  if (id === 'Ɛ') id = 'EPS';
  if (id === 'Ɔ') id = 'OPS';
  
  // If it's a number recite pattern like "1. Baako"
  const numMatch = letter.match(/^(\d+)\./);
  if (numMatch) {
    id = numMatch[1];
  }

  // If it's an alphabet recite pattern like "A. [a]"
  const letterMatch = letter.match(/^([a-zA-ZƐƆɛɔ])\./);
  if (letterMatch) {
    id = letterMatch[1].toUpperCase();
    if (id === 'Ɛ') id = 'EPS';
    if (id === 'Ɔ') id = 'OPS';
  }

  await playAudioForId(id, onDone);
};

export const stopSpeech = async () => {
  if (currentOnDoneTimer) {
    clearTimeout(currentOnDoneTimer);
    currentOnDoneTimer = null;
  }
  if (currentSound) {
    await currentSound.stopAsync();
    await currentSound.unloadAsync();
    currentSound = null;
  }
};
