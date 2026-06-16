import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeType = 'system' | 'light' | 'dark' | 'jungle' | 'sunset';

interface ThemeContextValue {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  activePalette: 'light' | 'dark' | 'jungle' | 'sunset';
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  setTheme: () => {},
  activePalette: 'light',
});

const STORAGE_KEY = '@twi_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>('system');
  const systemScheme = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        setThemeState(data as ThemeType);
      }
    });
  }, []);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    AsyncStorage.setItem(STORAGE_KEY, newTheme);
  };

  const activePalette =
    theme === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : theme;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, activePalette }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
