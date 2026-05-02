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

import { TWI_NUMBERS } from '@/constants/twi-data';
import { useProgress } from '@/context/ProgressContext';
import { useColors } from '@/hooks/useColors';
import { speakLetter, speakText, stopSpeech } from '@/utils/speech';

const RANGE_COLORS = [
  ['#E8961E', '#F5B942'],
  ['#2980B9', '#5DADE2'],
  ['#1B7A4B', '#27AE60'],
  ['#8E44AD', '#BB8FCE'],
  ['#C0392B', '#E74C3C'],
];

const RANGES = [
  { label: '1–20', start: 0, end: 19 },
  { label: '21–40', start: 20, end: 39 },
  { label: '41–60', start: 40, end: 59 },
  { label: '61–80', start: 60, end: 79 },
  { label: '81–100', start: 80, end: 99 },
];

export default function NumbersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { updateNumbersProgress } = useProgress();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [rangeIndex, setRangeIndex] = useState(0);
  const [isReciting, setIsReciting] = useState(false);
  const recitingRef = useRef(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const range = RANGES[rangeIndex];
  const colorPair = RANGE_COLORS[rangeIndex % RANGE_COLORS.length];
  const current = TWI_NUMBERS[currentIndex];

  const animateCard = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
    ]).start();
  };

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(TWI_NUMBERS.length - 1, index));
      setCurrentIndex(clamped);
      updateNumbersProgress(clamped);
      animateCard();
      Haptics.selectionAsync();
    },
    [updateNumbersProgress]
  );

  const switchRange = (rIdx: number) => {
    setRangeIndex(rIdx);
    goTo(RANGES[rIdx].start);
    stopRecite();
  };

  const handleSpeak = () => {
    speakText(`${current.number}. ${current.twi}.`, 0.75);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const startRecite = useCallback(() => {
    recitingRef.current = true;
    setIsReciting(true);
    let idx = range.start;

    const reciteNext = () => {
      if (!recitingRef.current || idx > range.end) {
        recitingRef.current = false;
        setIsReciting(false);
        return;
      }
      setCurrentIndex(idx);
      updateNumbersProgress(idx);
      animateCard();
      const item = TWI_NUMBERS[idx];
      speakLetter(
        `${item.number}. ${item.twi}`,
        () => {
          idx++;
          if (recitingRef.current) setTimeout(reciteNext, 600);
        },
        0.75
      );
    };
    reciteNext();
  }, [range, updateNumbersProgress]);

  const stopRecite = useCallback(() => {
    recitingRef.current = false;
    setIsReciting(false);
    stopSpeech();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  useEffect(() => {
    return () => {
      recitingRef.current = false;
      stopSpeech();
    };
  }, []);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const isAtStart = currentIndex <= range.start;
  const isAtEnd = currentIndex >= range.end;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Twi Numbers</Text>
        <View style={[styles.badge, { backgroundColor: colorPair[0] + '22' }]}>
          <Text style={[styles.badgeText, { color: colorPair[0] }]}>
            {current.number} / 100
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === 'web' ? 118 : insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rangeScroll}>
          <View style={styles.rangeRow}>
            {RANGES.map((r, i) => (
              <Pressable
                key={r.label}
                onPress={() => switchRange(i)}
                style={[
                  styles.rangeBtn,
                  {
                    backgroundColor: i === rangeIndex ? RANGE_COLORS[i][0] : colors.muted,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.rangeBtnText,
                    { color: i === rangeIndex ? '#fff' : colors.mutedForeground },
                  ]}
                >
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={colorPair as [string, string]}
            style={styles.numCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.bigNum}>{current.number}</Text>
            <Text style={styles.twiWord}>{current.twi}</Text>
          </LinearGradient>
        </Animated.View>

        <Pressable
          onPress={handleSpeak}
          style={({ pressed }) => [
            styles.speakBtn,
            { backgroundColor: colorPair[0], opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="volume-2" size={20} color="#fff" />
          <Text style={styles.speakBtnText}>Hear Pronunciation</Text>
        </Pressable>

        <View style={styles.navRow}>
          <Pressable
            onPress={() => goTo(currentIndex - 1)}
            disabled={isAtStart || isReciting}
            style={({ pressed }) => [
              styles.navBtn,
              { backgroundColor: colors.card, opacity: isAtStart || isReciting ? 0.35 : pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="chevron-left" size={30} color={colors.text} />
          </Pressable>

          <View style={styles.numGrid}>
            {TWI_NUMBERS.slice(range.start, range.end + 1).map((item, i) => {
              const idx = range.start + i;
              const isActive = idx === currentIndex;
              return (
                <Pressable
                  key={item.number}
                  onPress={() => goTo(idx)}
                  style={[
                    styles.numGridItem,
                    { backgroundColor: isActive ? colorPair[0] : colors.muted },
                  ]}
                >
                  <Text
                    style={[
                      styles.numGridText,
                      { color: isActive ? '#fff' : colors.mutedForeground },
                    ]}
                  >
                    {item.number}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => goTo(currentIndex + 1)}
            disabled={isAtEnd || isReciting}
            style={({ pressed }) => [
              styles.navBtn,
              { backgroundColor: colors.card, opacity: isAtEnd || isReciting ? 0.35 : pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="chevron-right" size={30} color={colors.text} />
          </Pressable>
        </View>

        <Pressable
          onPress={isReciting ? stopRecite : startRecite}
          style={({ pressed }) => [
            styles.reciteBtn,
            { backgroundColor: isReciting ? '#E74C3C' : colorPair[0], opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Feather name={isReciting ? 'square' : 'play-circle'} size={20} color="#fff" />
          <Text style={styles.reciteBtnText}>
            {isReciting ? 'Stop Reciting' : `Auto Recite ${range.label}`}
          </Text>
        </Pressable>
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
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  content: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, gap: 20 },
  rangeScroll: { width: '100%' },
  rangeRow: { flexDirection: 'row', gap: 10, paddingVertical: 4 },
  rangeBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  rangeBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  numCard: {
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
    gap: 8,
  },
  bigNum: { fontSize: 100, fontFamily: 'Inter_700Bold', color: '#fff' },
  twiWord: { fontSize: 20, fontFamily: 'Inter_600SemiBold', color: 'rgba(255,255,255,0.9)' },
  speakBtn: {
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
  numGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  numGridItem: { width: 32, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  numGridText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
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
});
