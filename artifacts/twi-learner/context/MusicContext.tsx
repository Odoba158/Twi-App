import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Audio } from 'expo-av';
import { AppState, AppStateStatus } from 'react-native';

interface MusicContextType {
  isPlaying: boolean;
  toggleMusic: () => void;
}

const MusicContext = createContext<MusicContextType>({
  isPlaying: true,
  toggleMusic: () => {},
});

export const useMusic = () => useContext(MusicContext);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          require('../assets/audio/bg_music.m4a'),
          { isLooping: true, volume: 0.05, shouldPlay: true }
        );

        if (isMounted) {
          soundRef.current = sound;
        } else {
          sound.unloadAsync();
        }
      } catch (error) {
        console.warn('Failed to load background music', error);
      }
    };

    initAudio();

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (!soundRef.current) return;
      if (nextAppState === 'active' && isPlaying) {
        soundRef.current.playAsync();
      } else if (nextAppState.match(/inactive|background/)) {
        soundRef.current.pauseAsync();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      isMounted = false;
      subscription.remove();
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (soundRef.current) {
      if (isPlaying) {
        soundRef.current.playAsync();
      } else {
        soundRef.current.pauseAsync();
      }
    }
  }, [isPlaying]);

  const toggleMusic = () => {
    setIsPlaying(prev => !prev);
  };

  return (
    <MusicContext.Provider value={{ isPlaying, toggleMusic }}>
      {children}
    </MusicContext.Provider>
  );
};
