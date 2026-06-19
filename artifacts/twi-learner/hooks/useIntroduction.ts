import { useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { playAudioForId } from '@/utils/speech';

/**
 * Plays the introduction audio once every time the screen comes into focus.
 * Delay (ms) lets the screen finish its enter animation before audio starts.
 */
export function useIntroduction(delayMs = 400) {
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        playAudioForId('introduction');
      }, delayMs);

      return () => clearTimeout(timer);
    }, [delayMs])
  );
}
