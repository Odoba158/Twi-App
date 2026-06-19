import { useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Audio } from 'expo-av';
import { AUDIO_MAP } from '@/constants/audio-map';

/**
 * Plays the introduction audio every time this screen comes into focus.
 * Creates its own Sound instance so it's independent of the shared speech cache.
 */
export function useIntroduction(delayMs = 500) {
  useFocusEffect(
    useCallback(() => {
      let sound: Audio.Sound | null = null;
      let cancelled = false;

      const play = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, delayMs));
          if (cancelled) return;

          const audioRes = AUDIO_MAP['introduction'];
          if (!audioRes) return;

          const created = await Audio.Sound.createAsync(audioRes, {
            shouldPlay: true,
          });
          if (cancelled) {
            created.sound.unloadAsync();
            return;
          }
          sound = created.sound;
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              sound?.unloadAsync();
              sound = null;
            }
          });
        } catch (e) {
          // silently skip if intro audio is missing or fails
        }
      };

      play();

      return () => {
        cancelled = true;
        sound?.stopAsync().then(() => sound?.unloadAsync());
      };
    }, [delayMs])
  );
}
