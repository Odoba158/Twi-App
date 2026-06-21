import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TWI_ALPHABET } from '@/constants/twi-data';
import { useProgress } from '@/context/ProgressContext';
import { useColors } from '@/hooks/useColors';
import { useIntroduction } from '@/hooks/useIntroduction';
import { speakLetter, stopSpeech, playAudioForId } from '@/utils/speech';

export default function AlphabetScreen() {
  const colors = useColors();
  const { isIntroPlaying } = useIntroduction();
  const insets = useSafeAreaInsets();
  const { updateAlphabetProgress } = useProgress();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReciting, setIsReciting] = useState(false);
  const [reciteMode, setReciteMode] = useState<'letter' | 'example'>('letter');
  const recitingRef = useRef(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const current = TWI_ALPHABET[currentIndex];

  const animateCard = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
    ]).start();
  };

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(TWI_ALPHABET.length - 1, index));
      setCurrentIndex(clamped);
      updateAlphabetProgress(clamped);
      animateCard();
      Haptics.selectionAsync();
    },
    [updateAlphabetProgress]
  );

  const handleSpeakLetterOnly = () => {
    playAudioForId(current.id + '1');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSpeakWithExample = () => {
    playAudioForId(current.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const startRecite = useCallback((mode: 'letter' | 'example') => {
    recitingRef.current = true;
    setIsReciting(true);
    setReciteMode(mode);
    let idx = 0;

    const reciteNext = () => {
      if (!recitingRef.current || idx >= TWI_ALPHABET.length) {
        recitingRef.current = false;
        setIsReciting(false);
        return;
      }
      setCurrentIndex(idx);
      updateAlphabetProgress(idx);
      animateCard();
      const item = TWI_ALPHABET[idx];
      const audioKey = mode === 'letter' ? (item.id + '1') : item.id;
      playAudioForId(
        audioKey,
        () => {
          idx++;
          if (recitingRef.current) {
            reciteNext();
          }
        }
      );
    };
    reciteNext();
  }, [updateAlphabetProgress]);

  const stopRecite = () => {
    recitingRef.current = false;
    setIsReciting(false);
    stopSpeech();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  useEffect(() => {
    return () => {
      recitingRef.current = false;
      stopSpeech();
    };
  }, []);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View 
      style={[styles.container, { backgroundColor: colors.background, opacity: isIntroPlaying ? 0.6 : 1 }]} 
      pointerEvents={isIntroPlaying ? 'none' : 'auto'}
    >
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Twi Alphabet</Text>
        <View style={[styles.badge, { backgroundColor: current.color + '22' }]}>
          <Text style={[styles.badgeText, { color: current.color }]}>
            {currentIndex + 1} / {TWI_ALPHABET.length}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === 'web' ? 118 : insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={[current.color, current.color + 'BB']}
            style={styles.letterCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.bigLetter}>{current.letter}</Text>
            <Text style={styles.smallLetter}>{current.lowerCase}</Text>
            <View style={styles.twiNameBadge}>
              <Text style={styles.twiNameText}>{current.twiName}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={[styles.wordBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.exampleWord, { color: current.color }]}>{current.exampleWord}</Text>
          <Text style={[styles.meaning, { color: colors.mutedForeground }]}>{current.meaning}</Text>
        </View>

        <View style={styles.speakButtonContainer}>
          <Pressable
            onPress={handleSpeakLetterOnly}
            style={({ pressed }) => [
              styles.speakBtn,
              { backgroundColor: current.color, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="volume-2" size={18} color="#fff" />
            <Text style={styles.speakBtnText}>Hear Pronunciation</Text>
          </Pressable>

          <Pressable
            onPress={handleSpeakWithExample}
            style={({ pressed }) => [
              styles.speakBtnSecondary,
              { borderColor: current.color, borderWidth: 2, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="book-open" size={18} color={current.color} />
            <Text style={[styles.speakBtnTextSecondary, { color: current.color }]}>Hear with Example</Text>
          </Pressable>
        </View>

        <View style={styles.navRow}>
          <Pressable
            onPress={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0 || isReciting}
            style={({ pressed }) => [
              styles.navBtn,
              { backgroundColor: colors.card, opacity: currentIndex === 0 || isReciting ? 0.35 : pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="chevron-left" size={30} color={colors.text} />
          </Pressable>

          <View style={styles.letterGrid}>
            {TWI_ALPHABET.map((item, i) => (
              <Pressable
                key={item.id}
                onPress={() => goTo(i)}
                style={[
                  styles.gridItem,
                  {
                    backgroundColor: i === currentIndex ? item.color : colors.muted,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.gridText,
                    { color: i === currentIndex ? '#fff' : colors.mutedForeground },
                  ]}
                >
                  {item.letter}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => goTo(currentIndex + 1)}
            disabled={currentIndex === TWI_ALPHABET.length - 1 || isReciting}
            style={({ pressed }) => [
              styles.navBtn,
              {
                backgroundColor: colors.card,
                opacity: currentIndex === TWI_ALPHABET.length - 1 || isReciting ? 0.35 : pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="chevron-right" size={30} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.reciteRow}>
          <Pressable
            onPress={() => isReciting ? stopRecite() : startRecite('letter')}
            style={({ pressed }) => [
              styles.reciteBtn,
              {
                backgroundColor: isReciting && reciteMode === 'letter' ? '#E74C3C' : colors.secondary,
                opacity: pressed ? 0.85 : 1,
                flex: 1,
              },
            ]}
          >
            <Feather name={isReciting && reciteMode === 'letter' ? 'square' : 'play-circle'} size={18} color="#fff" />
            <Text style={styles.reciteBtnText}>
              {isReciting && reciteMode === 'letter' ? 'Stop Recite' : 'Recite Letters'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => isReciting ? stopRecite() : startRecite('example')}
            style={({ pressed }) => [
              styles.reciteBtn,
              {
                backgroundColor: isReciting && reciteMode === 'example' ? '#E74C3C' : colors.secondary,
                opacity: pressed ? 0.85 : 1,
                flex: 1,
              },
            ]}
          >
            <Feather name={isReciting && reciteMode === 'example' ? 'square' : 'play-circle'} size={18} color="#fff" />
            <Text style={styles.reciteBtnText}>
              {isReciting && reciteMode === 'example' ? 'Stop Recite' : 'Recite with Examples'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 76,
    paddingBottom: 12,
  },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  content: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, gap: 20 },
  letterCard: {
    width: 220,
    height: 220,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  bigLetter: { fontSize: 100, fontFamily: 'Inter_700Bold', color: '#fff', lineHeight: 108 },
  smallLetter: { fontSize: 28, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_500Medium', marginTop: -8 },
  twiNameBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
  },
  twiNameText: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: 1 },
  wordBox: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  exampleWord: { fontSize: 28, fontFamily: 'Inter_700Bold', marginBottom: 6 },
  meaning: { fontSize: 16, fontFamily: 'Inter_400Regular' },
  speakButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flexWrap: 'wrap',
  },
  speakBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  speakBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 50,
    backgroundColor: 'transparent',
  },
  speakBtnTextSecondary: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  speakBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' },
  navBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  letterGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  gridItem: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  reciteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  reciteBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  reciteRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
});
