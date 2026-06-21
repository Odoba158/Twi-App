import { Audio } from 'expo-av';
import { AUDIO_MAP } from '@/constants/audio-map';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

// ─── Sound cache: preloaded Audio.Sound objects ───────────────────────────────
let activeSound: Audio.Sound | null = null;
let currentOnDoneTimer: ReturnType<typeof setTimeout> | null = null;

/** Call once at app startup to set up audio mode. We do not preload 200+ sounds to avoid OS resource limits. */
export const preloadAllSounds = async () => {
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  } catch (e) {
    console.warn('Failed to set audio mode:', e);
  }
};

/** Play a sound by ID. Loads on the fly and unloads after playing to free system resources. */
export const playAudioForId = async (id: string, onDone?: () => void) => {
  try {
    // Stop and unload whatever is currently playing
    if (activeSound) {
      try {
        await activeSound.stopAsync();
        await activeSound.unloadAsync();
      } catch (_) {}
      activeSound = null;
    }

    const key = id.toString();
    const audioRes = AUDIO_MAP[key];
    if (!audioRes) {
      console.warn(`No audio found for ID: ${key}`);
      if (key.endsWith('1')) {
        // Fall back to TTS for the single letter name
        const baseLetter = key.slice(0, -1); // e.g. "D" or "EPS" or "OPS"
        let speakChar = baseLetter;
        if (speakChar === 'EPS') speakChar = 'Ɛ';
        if (speakChar === 'OPS') speakChar = 'Ɔ';
        return speakLetter(speakChar, onDone || (() => {}), 0.65, true);
      }
      if (onDone) onDone();
      return;
    }

    const { sound } = await Audio.Sound.createAsync(audioRes, { shouldPlay: false });
    activeSound = sound;

    sound.setOnPlaybackStatusUpdate(async (status) => {
      if (status.isLoaded && status.didJustFinish) {
        try {
          await sound.unloadAsync();
        } catch (_) {}
        if (activeSound === sound) {
          activeSound = null;
        }
        if (onDone) onDone();
      }
    });

    await sound.playAsync();
  } catch (error) {
    console.error('Error playing audio:', error);
    if (onDone) onDone();
  }
};

// Kept for backward compatibility
export const speakText = async (text: string, rate = 0.8) => {
  const numMatch = text.match(/^(\d+)\./);
  if (numMatch) return playAudioForId(numMatch[1]);

  const letterMatch = text.match(/^([A-ZƐƆ])\./);
  if (letterMatch) {
    let id = letterMatch[1];
    if (id === 'Ɛ') id = 'EPS';
    if (id === 'Ɔ') id = 'OPS';
    return playAudioForId(id);
  }
};

export async function speakLetter(
  letter: string,
  onDone: () => void,
  rate = 0.65,
  useTts = false
) {
  if (useTts) {
    if (currentOnDoneTimer) {
      clearTimeout(currentOnDoneTimer);
      currentOnDoneTimer = null;
    }

    let speakChar = letter;
    if (speakChar.toUpperCase() === 'Ɛ') speakChar = 'E';
    if (speakChar.toUpperCase() === 'Ɔ') speakChar = 'O';

    const estimatedMs = Math.max(700, 300 / rate);

    if (Platform.OS === 'web') {
      Speech.speak(speakChar, { language: 'en-GB', rate });
      currentOnDoneTimer = setTimeout(onDone, estimatedMs);
    } else {
      Speech.speak(speakChar, { language: 'en-GB', rate, onDone });
    }
    return;
  }

  let id = letter.toUpperCase();
  if (id === 'Ɛ') id = 'EPS';
  if (id === 'Ɔ') id = 'OPS';

  const numMatch = letter.match(/^(\d+)\./);
  if (numMatch) id = numMatch[1];

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
  if (activeSound) {
    try {
      await activeSound.stopAsync();
      await activeSound.unloadAsync();
    } catch (_) {}
    activeSound = null;
  }
};
