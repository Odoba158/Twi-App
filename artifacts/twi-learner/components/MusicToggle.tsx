import React from 'react';
import { Pressable, StyleSheet, Platform, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMusic } from '@/context/MusicContext';
import { useColors } from '@/hooks/useColors';

export function MusicToggle() {
  const { isPlaying, toggleMusic } = useMusic();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const topPad = Platform.OS === 'web' ? 20 : insets.top || 20;

  return (
    <View style={[styles.container, { top: topPad }]} pointerEvents="box-none">
      <Pressable
        onPress={toggleMusic}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.card, opacity: pressed ? 0.7 : 0.95 },
        ]}
      >
        <Feather
          name={isPlaying ? 'music' : 'volume-x'}
          size={20}
          color={isPlaying ? colors.primary : colors.mutedForeground}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    zIndex: 999,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
