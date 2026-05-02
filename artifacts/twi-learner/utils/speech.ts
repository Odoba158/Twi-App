import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

let currentOnDoneTimer: ReturnType<typeof setTimeout> | null = null;

export const speakText = (text: string, rate = 0.8) => {
  Speech.stop();
  Speech.speak(text, {
    language: 'en-GB',
    rate,
    pitch: 1.0,
  });
};

export const speakLetter = (
  letter: string,
  onDone: () => void,
  rate = 0.65
) => {
  if (currentOnDoneTimer) {
    clearTimeout(currentOnDoneTimer);
    currentOnDoneTimer = null;
  }
  Speech.stop();

  const estimatedMs = Math.max(800, (letter.length * 300) / rate);

  if (Platform.OS === 'web') {
    Speech.speak(letter, { language: 'en-GB', rate });
    currentOnDoneTimer = setTimeout(onDone, estimatedMs);
  } else {
    Speech.speak(letter, {
      language: 'en-GB',
      rate,
      onDone,
    });
  }
};

export const stopSpeech = () => {
  if (currentOnDoneTimer) {
    clearTimeout(currentOnDoneTimer);
    currentOnDoneTimer = null;
  }
  Speech.stop();
};
