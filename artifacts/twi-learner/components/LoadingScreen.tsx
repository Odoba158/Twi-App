import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
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
  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'web' ? 40 : insets.bottom || 40;

  // Fade in the whole screen
  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Pulsing glow on the progress bar
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // Slow progress: ~8 seconds total
  useEffect(() => {
    let current = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    const interval = setInterval(() => {
      const increment = current < 20 ? 1 : current < 50 ? 1.5 : current < 80 ? 2 : current < 95 ? 1.5 : 1;
      current = Math.min(current + increment, 100);
      const rounded = Math.round(current);
      setProgress(rounded);

      Animated.timing(barWidth, {
        toValue: rounded,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();

      if (rounded >= 100) {
        clearInterval(interval);
        timeoutId = setTimeout(onFinish, 600);
      }
    }, 120);

    return () => {
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Loading tips that rotate
  const tips = [
    'Loading Twi alphabet...',
    'Preparing numbers...',
    'Setting up word library...',
    'Almost ready...',
  ];
  const tipIndex = progress < 25 ? 0 : progress < 50 ? 1 : progress < 80 ? 2 : 3;

  return (
    <LinearGradient
      colors={['#1a0a2e', '#16213e', '#0f3460']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <Animated.View style={[styles.content, { opacity: fadeIn }]}>
        {/* Decorative circles */}
        <View style={[styles.decorCircle, styles.decorCircle1]} />
        <View style={[styles.decorCircle, styles.decorCircle2]} />

        <Image
          source={require('../assets/images/icon.png')}
          style={styles.appIcon}
        />
        <Text style={styles.title}>Twi Alphabet{'\n'}& Numeral Reciter</Text>
        <Text style={styles.subtitle}>{tips[tipIndex]}</Text>

        {/* Stylish progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressBarOuter,
                {
                  width: barWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            >
              <LinearGradient
                colors={['#E8961E', '#F5B942', '#CE1126']}
                style={styles.progressBarGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
            {/* Glow effect */}
            <Animated.View
              style={[
                styles.progressGlow,
                {
                  opacity: pulseAnim,
                  width: barWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>

          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>Loading</Text>
            <Text style={styles.progressPercent}>{progress}%</Text>
          </View>
        </View>
      </Animated.View>

      <View style={[styles.footer, { paddingBottom: bottomPad + 10 }]}>
        <View style={styles.footerDivider} />
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
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(232, 150, 30, 0.1)',
  },
  decorCircle1: {
    width: 300,
    height: 300,
    top: '10%',
    right: -80,
  },
  decorCircle2: {
    width: 200,
    height: 200,
    bottom: '15%',
    left: -60,
  },
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 26,
    marginBottom: 24,
    shadowColor: '#E8961E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
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
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 44,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarOuter: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarGradient: {
    flex: 1,
    borderRadius: 4,
  },
  progressGlow: {
    position: 'absolute',
    top: -2,
    left: 0,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(232, 150, 30, 0.3)',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  progressPercent: {
    color: '#F5B942',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  footerDivider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 1,
  },
  footerText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 18,
  },
});
