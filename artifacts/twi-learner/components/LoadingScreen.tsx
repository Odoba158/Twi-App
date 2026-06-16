import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LoadingScreenProps {
  onFinish: () => void;
}

export function LoadingScreen({ onFinish }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const barWidth = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'web' ? 40 : insets.bottom || 40;

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      // Accelerating progress: slow start, faster finish
      const increment = current < 30 ? 2 : current < 60 ? 3 : current < 85 ? 4 : 5;
      current = Math.min(current + increment, 100);
      setProgress(current);

      Animated.timing(barWidth, {
        toValue: current,
        duration: 120,
        useNativeDriver: false,
      }).start();

      if (current >= 100) {
        clearInterval(interval);
        setTimeout(onFinish, 400);
      }
    }, 80);

    return () => clearInterval(interval);
  }, []);

  return (
    <LinearGradient
      colors={['#E8961E', '#CE1126']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <Image
          source={require('../assets/images/icon.png')}
          style={styles.appIcon}
        />
        <Text style={styles.title}>Twi Alphabet{'\n'}& Numeral Reciter</Text>
        <Text style={styles.subtitle}>Preparing your learning experience...</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: barWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: bottomPad + 10 }]}>
        <Text style={styles.footerText}>
          Designed by: Odoba and Joshua Adu{'\n'}supervised by POCO
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  appIcon: {
    width: 96,
    height: 96,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 36,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 18,
  },
});
