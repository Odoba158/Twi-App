import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

import { TWI_WORDS } from '@/constants/twi-data';
import { useProgress } from '@/context/ProgressContext';
import { useColors } from '@/hooks/useColors';
import { speakLetter, speakText, stopSpeech } from '@/utils/speech';

const WORD_COLORS = [
  ['#27AE60', '#2ECC71'],
  ['#E8961E', '#F5B942'],
  ['#8E44AD', '#BB8FCE'],
  ['#2980B9', '#5DADE2'],
  ['#C0392B', '#E74C3C'],
  ['#16A085', '#1ABC9C'],
  ['#D35400', '#E67E22'],
  ['#1B7A4B', '#27AE60'],
  ['#7B5EA7', '#A97FC4'],
  ['#2C3E50', '#34495E'],
  ['#E74C3C', '#F1948A'],
  ['#F39C12', '#F7DC6F'],
  ['#1ABC9C', '#48C9B0'],
  ['#9B59B6', '#C39BD3'],
  ['#3498DB', '#7FB3D3'],
];

const GROUP_TABS = [
  { label: '2 Letters', count: 2, color: '#E74C3C' },
  { label: '3 Letters', count: 3, color: '#E8961E' },
  { label: '4 Letters', count: 4, color: '#2980B9' },
  { label: '5+ Letters', count: 5, color: '#27AE60' },
];

export default function WordsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { incrementWordsProgress } = useProgress();

  const [groupIndex, setGroupIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpelling, setIsSpelling] = useState(false);
  const [activeLetterIdx, setActiveLetterIdx] = useState(-1);
  const spellingRef = useRef(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const filteredWords = useMemo(() => {
    const g = GROUP_TABS[groupIndex];
    if (g.count === 5) return TWI_WORDS.filter(w => w.letters.length >= 5);
    return TWI_WORDS.filter(w => w.letters.length === g.count);
  }, [groupIndex]);

  const safeIndex = Math.min(currentIndex, Math.max(0, filteredWords.length - 1));
  const current = filteredWords[safeIndex] ?? filteredWords[0];
  const colorPair = WORD_COLORS[safeIndex % WORD_COLORS.length];
  const groupColor = GROUP_TABS[groupIndex].color;

  const animateCard = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
    ]).start();
  };

  const stopSpelling = useCallback(() => {
    spellingRef.current = false;
    setIsSpelling(false);
    setActiveLetterIdx(-1);
    stopSpeech();
  }, []);

  const switchGroup = (idx: number) => {
    stopSpelling();
    setGroupIndex(idx);
    setCurrentIndex(0);
    animateCard();
    Haptics.selectionAsync();
  };

  const goTo = useCallback(
    (index: number) => {
      stopSpelling();
      const clamped = Math.max(0, Math.min(filteredWords.length - 1, index));
      setCurrentIndex(clamped);
      setActiveLetterIdx(-1);
      animateCard();
      Haptics.selectionAsync();
    },
    [filteredWords, stopSpelling]
  );

  const handleSpeak = () => {
    if (!current) return;
    speakText(`${current.word}. ${current.meaning}.`, 0.75);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    incrementWordsProgress();
  };

  const startSpelling = useCallback(() => {
    if (!current) return;
    spellingRef.current = true;
    setIsSpelling(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    incrementWordsProgress();

    let idx = 0;
    const spellNext = () => {
      if (!spellingRef.current || idx >= current.letters.length) {
        spellingRef.current = false;
        setIsSpelling(false);
        setActiveLetterIdx(-1);
        return;
      }
      setActiveLetterIdx(idx);
      speakLetter(
        current.letters[idx],
        () => {
          idx++;
          if (spellingRef.current) setTimeout(spellNext, 300);
        },
        0.6
      );
    };
    spellNext();
  }, [current, incrementWordsProgress]);

  useEffect(() => {
    setCurrentIndex(0);
    stopSpelling();
  }, [groupIndex]);

  useEffect(() => {
    return () => {
      spellingRef.current = false;
      stopSpeech();
    };
  }, []);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  if (!current) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Twi Words</Text>
        <View style={[styles.badge, { backgroundColor: groupColor + '22' }]}>
          <Text style={[styles.badgeText, { color: groupColor }]}>
            {safeIndex + 1} / {filteredWords.length}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabRow}
      >
        {GROUP_TABS.map((tab, i) => (
          <Pressable
            key={tab.label}
            onPress={() => switchGroup(i)}
            style={[
              styles.tabBtn,
              {
                backgroundColor: i === groupIndex ? tab.color : colors.muted,
                borderColor: i === groupIndex ? tab.color : 'transparent',
              },
            ]}
          >
            <Text style={[styles.tabBtnText, { color: i === groupIndex ? '#fff' : colors.mutedForeground }]}>
              {tab.label}
            </Text>
            <View style={[styles.tabCount, { backgroundColor: i === groupIndex ? 'rgba(255,255,255,0.25)' : colors.border }]}>
              <Text style={[styles.tabCountText, { color: i === groupIndex ? '#fff' : colors.mutedForeground }]}>
                {i === 3
                  ? TWI_WORDS.filter(w => w.letters.length >= 5).length
                  : TWI_WORDS.filter(w => w.letters.length === tab.count).length}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === 'web' ? 118 : insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={colorPair as [string, string]}
            style={styles.wordCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.wordText}>{current.word}</Text>
            <View style={[styles.catBadge, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
              <Text style={styles.catText}>{current.category}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={[styles.meaningBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.meaningLabel, { color: colors.mutedForeground }]}>Meaning</Text>
          <Text style={[styles.meaningText, { color: colors.text }]}>{current.meaning}</Text>
        </View>

        <View style={[styles.lettersBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.lettersLabel, { color: colors.mutedForeground }]}>Spelling</Text>
          <View style={styles.letterBoxRow}>
            {current.letters.map((letter, i) => (
              <View
                key={i}
                style={[
                  styles.letterBox,
                  {
                    backgroundColor: i === activeLetterIdx ? colorPair[0] : colors.muted,
                    borderColor: i === activeLetterIdx ? colorPair[0] : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.letterBoxText,
                    { color: i === activeLetterIdx ? '#fff' : colors.text },
                  ]}
                >
                  {letter}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            onPress={handleSpeak}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: colorPair[0], flex: 1, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="volume-2" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Hear Word</Text>
          </Pressable>

          <Pressable
            onPress={isSpelling ? stopSpelling : startSpelling}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: isSpelling ? '#E74C3C' : colorPair[1],
                flex: 1,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Feather name={isSpelling ? 'square' : 'type'} size={18} color="#fff" />
            <Text style={styles.actionBtnText}>{isSpelling ? 'Stop' : 'Spell It'}</Text>
          </Pressable>
        </View>

        <View style={styles.navRow}>
          <Pressable
            onPress={() => goTo(safeIndex - 1)}
            disabled={safeIndex === 0}
            style={({ pressed }) => [
              styles.navBtn,
              { backgroundColor: colors.card, opacity: safeIndex === 0 ? 0.35 : pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="chevron-left" size={30} color={colors.text} />
          </Pressable>

          <View style={styles.wordList}>
            {filteredWords.map((w, i) => (
              <Pressable
                key={w.id}
                onPress={() => goTo(i)}
                style={[
                  styles.wordChip,
                  {
                    backgroundColor:
                      i === safeIndex ? WORD_COLORS[i % WORD_COLORS.length][0] : colors.muted,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.wordChipText,
                    { color: i === safeIndex ? '#fff' : colors.mutedForeground },
                  ]}
                >
                  {w.word}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => goTo(safeIndex + 1)}
            disabled={safeIndex === filteredWords.length - 1}
            style={({ pressed }) => [
              styles.navBtn,
              {
                backgroundColor: colors.card,
                opacity: safeIndex === filteredWords.length - 1 ? 0.35 : pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="chevron-right" size={30} color={colors.text} />
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
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  tabScroll: { flexGrow: 0 },
  tabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 12 },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  tabBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  tabCount: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  tabCountText: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  content: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 4, gap: 16 },
  wordCard: {
    width: 280,
    height: 150,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  wordText: { fontSize: 52, fontFamily: 'Inter_700Bold', color: '#fff' },
  catBadge: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20 },
  catText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  meaningBox: {
    width: '100%',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  meaningLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
  meaningText: { fontSize: 22, fontFamily: 'Inter_600SemiBold' },
  lettersBox: {
    width: '100%',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  lettersLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  letterBoxRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', flexWrap: 'wrap' },
  letterBox: {
    width: 44,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  letterBoxText: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  actionRow: { flexDirection: 'row', gap: 12, width: '100%' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  actionBtnText: { color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  navRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, width: '100%' },
  navBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  wordList: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  wordChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  wordChipText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
});
