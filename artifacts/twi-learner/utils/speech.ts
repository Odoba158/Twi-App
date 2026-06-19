import { Audio } from 'expo-av';
import { AUDIO_MAP } from '@/constants/audio-map';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

// ─── Sound cache: preloaded Audio.Sound objects ───────────────────────────────
const soundCache: Record<string, Audio.Sound> = {};
let activeSound: Audio.Sound | null = null;
let currentOnDoneTimer: ReturnType<typeof setTimeout> | null = null;

/** Call once at app startup to preload every audio asset into memory */
export const preloadAllSounds = async () => {
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  const keys = Object.keys(AUDIO_MAP);
  await Promise.all(
    keys.map(async (key) => {
      try {
        const { sound } = await Audio.Sound.createAsync(AUDIO_MAP[key], {
          shouldPlay: false,
        });
        soundCache[key] = sound;
      } catch (e) {
        // skip missing files silently
      }
    })
  );
};

/** Play a preloaded sound by ID. Falls back to creating if not cached. */
export const playAudioForId = async (id: string, onDone?: () => void) => {
  try {
    // Stop whatever is currently playing
    if (activeSound) {
      try {
        await activeSound.stopAsync();
        await activeSound.setPositionAsync(0);
      } catch (_) {}
      activeSound = null;
    }

    const key = id.toString();
    let sound = soundCache[key];

    if (!sound) {
      const audioRes = AUDIO_MAP[key];
      if (!audioRes) {
        console.warn(`No audio found for ID: ${key}`);
        if (onDone) onDone();
        return;
      }
      const created = await Audio.Sound.createAsync(audioRes, { shouldPlay: false });
      sound = created.sound;
      soundCache[key] = sound;
    }

    activeSound = sound;

    // Rewind to start
    await sound.setPositionAsync(0);

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
      await activeSound.setPositionAsync(0);
    } catch (_) {}
    activeSound = null;
  }
};
