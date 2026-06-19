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
import { useIntroduction } from '@/hooks/useIntroduction';
import { speakLetter, speakText, stopSpeech, playAudioForId } from '@/utils/speech';

const RANGE_COLORS = [
  ['#E8961E', '#F5B942'],
  ['#2980B9', '#5DADE2'],
  ['#1B7A4B', '#27AE60'],
  ['#8E44AD', '#BB8FCE'],
  ['#C0392B', '#E74C3C'],
];

const SPELL_AUTO_RANGES = [
  { label: '1–10',  start: 0, end: 9  },
  { label: '1–20',  start: 0, end: 19 },
  { label: '1–50',  start: 0, end: 49 },
  { label: '11–20', start: 10, end: 19 },
  { label: '21–30', start: 20, end: 29 },
  { label: '31–40', start: 30, end: 39 },
  { label: '41–50', start: 40, end: 49 },
];

const RECITE_RANGES = [
  { label: '1–10',   start: 0,  end: 9  },
  { label: '1–20',   start: 0,  end: 19 },
  { label: '1–50',   start: 0,  end: 49 },
  { label: '1–100',  start: 0,  end: 99 },
  { label: '11–20',  start: 10, end: 19 },
  { label: '21–30',  start: 20, end: 29 },
  { label: '31–40',  start: 30, end: 39 },
  { label: '41–50',  start: 40, end: 49 },
  { label: '51–60',  start: 50, end: 59 },
  { label: '61–70',  start: 60, end: 69 },
  { label: '71–80',  start: 70, end: 79 },
  { label: '81–90',  start: 80, end: 89 },
  { label: '91–100', start: 90, end: 99 },
];

export default function NumbersScreen() {
  const colors = useColors();
  useIntroduction();
  const insets = useSafeAreaInsets();
  const { updateNumbersProgress } = useProgress();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [reciteRangeIndex, setReciteRangeIndex] = useState(0);
  const [spellRangeIndex, setSpellRangeIndex] = useState(0);
  const [autoSpellRangeIndex, setAutoSpellRangeIndex] = useState(0);
  const [isReciting, setIsReciting] = useState(false);
  const [isSpelling, setIsSpelling] = useState(false);
  const [isAutoSpelling, setIsAutoSpelling] = useState(false);
  const [activeLetterIdx, setActiveLetterIdx] = useState(-1);
  const recitingRef = useRef(false);
  const spellingRef = useRef(false);
  const autoSpellRef = useRef(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const colorPair = RANGE_COLORS[Math.floor(currentIndex / 20) % RANGE_COLORS.length];
  const current = TWI_NUMBERS[currentIndex];

  const animateCard = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
    ]).start();
  };

  const goTo = useCallback(
    (index: number) => {
      stopSpelling();
      const clamped = Math.max(0, Math.min(TWI_NUMBERS.length - 1, index));
      setCurrentIndex(clamped);
      updateNumbersProgress(clamped);
      animateCard();
      Haptics.selectionAsync();
    },
    [updateNumbersProgress]
  );

  const handleSpeak = () => {
    playAudioForId(`${current.number}`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const stopSpelling = useCallback(() => {
    spellingRef.current = false;
    setIsSpelling(false);
    setActiveLetterIdx(-1);
    stopSpeech();
  }, []);

  const startSpelling = useCallback(() => {
    spellingRef.current = true;
    setIsSpelling(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Play pre-recorded spelling audio (e.g. "1_spell")
    playAudioForId(`${current.number}_spell`, () => {
      spellingRef.current = false;
      setIsSpelling(false);
      setActiveLetterIdx(-1);
    });

    // Animate sequential highlight of letters
    const letters = current.twi.split('');
    let idx = 0;
    const highlightNext = () => {
      if (!spellingRef.current || idx >= letters.length) {
        return;
      }
      setActiveLetterIdx(idx);
      idx++;
      if (spellingRef.current && idx < letters.length) {
        setTimeout(highlightNext, 450);
      }
    };
    highlightNext();
  }, [current]);

  const stopRecite = useCallback(() => {
    recitingRef.current = false;
    setIsReciting(false);
    stopSpeech();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  const startRecite = useCallback(() => {
    stopSpelling();
    recitingRef.current = true;
    setIsReciting(true);
    const range = RECITE_RANGES[reciteRangeIndex];
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
      playAudioForId(`${item.number}`, () => {
        idx++;
        if (recitingRef.current) setTimeout(reciteNext, 200);
      });
    };
    reciteNext();
  }, [reciteRangeIndex, updateNumbersProgress, stopSpelling]);

  const stopAutoSpell = useCallback(() => {
    autoSpellRef.current = false;
    setIsAutoSpelling(false);
    stopSpeech();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  const startAutoSpell = useCallback(() => {
    stopSpelling();
    stopRecite();
    autoSpellRef.current = true;
    setIsAutoSpelling(true);
    const range = SPELL_AUTO_RANGES[autoSpellRangeIndex];
    let idx = range.start;

    const spellNext = () => {
      if (!autoSpellRef.current || idx > range.end) {
        autoSpellRef.current = false;
        setIsAutoSpelling(false);
        return;
      }
      setCurrentIndex(idx);
      updateNumbersProgress(idx);
      animateCard();
      const item = TWI_NUMBERS[idx];
      const spellKey = `${item.number}_spell`;
      // Use pre-recorded spell audio if available
      playAudioForId(spellKey, () => {
        idx++;
        if (autoSpellRef.current) setTimeout(spellNext, 300);
      });
    };
    spellNext();
  }, [autoSpellRangeIndex, updateNumbersProgress, stopSpelling, stopRecite]);

  useEffect(() => {
    return () => {
      recitingRef.current = false;
      spellingRef.current = false;
      autoSpellRef.current = false;
      stopSpeech();
    };
  }, []);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const spellLetters = current.twi.split('');

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

          {current.number <= 50 && (
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
          )}
        </View>

        {current.number <= 50 && spellLetters.length > 0 && (
          <View style={[styles.lettersBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.lettersLabel, { color: colors.mutedForeground }]}>Spelling</Text>
            <View style={styles.letterBoxRow}>
              {spellLetters.map((letter, i) => (
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
        )}

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

          <View style={styles.numGrid}>
            {TWI_NUMBERS.map((item, i) => {
              const isActive = i === currentIndex;
              const pairIdx = Math.floor(i / 20) % RANGE_COLORS.length;
              return (
                <Pressable
                  key={item.number}
                  onPress={() => goTo(i)}
                  style={[
                    styles.numGridItem,
                    { backgroundColor: isActive ? RANGE_COLORS[pairIdx][0] : colors.muted },
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
            disabled={currentIndex === TWI_NUMBERS.length - 1 || isReciting}
            style={({ pressed }) => [
              styles.navBtn,
              {
                backgroundColor: colors.card,
                opacity: currentIndex === TWI_NUMBERS.length - 1 || isReciting ? 0.35 : pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="chevron-right" size={30} color={colors.text} />
          </Pressable>
        </View>

        <View style={[styles.sectionBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>AUTO RECITE RANGE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.rangeRow}>
              {RECITE_RANGES.map((r, i) => (
                <Pressable
                  key={r.label}
                  onPress={() => { if (!isReciting) setReciteRangeIndex(i); }}
                  style={[
                    styles.rangeBtn,
                    { backgroundColor: i === reciteRangeIndex ? RANGE_COLORS[i % RANGE_COLORS.length][0] : colors.muted },
                  ]}
                >
                  <Text style={[styles.rangeBtnText, { color: i === reciteRangeIndex ? '#fff' : colors.mutedForeground }]}>
                    {r.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <Pressable
            onPress={isReciting ? stopRecite : startRecite}
            style={({ pressed }) => [
              styles.reciteBtn,
              {
                backgroundColor: isReciting ? '#E74C3C' : RANGE_COLORS[reciteRangeIndex % RANGE_COLORS.length][0],
                opacity: pressed ? 0.85 : 1,
                marginTop: 12,
              },
            ]}
          >
            <Feather name={isReciting ? 'square' : 'play-circle'} size={20} color="#fff" />
            <Text style={styles.reciteBtnText}>
              {isReciting ? 'Stop' : `▶ Auto Recite ${RECITE_RANGES[reciteRangeIndex].label}`}
            </Text>
          </Pressable>
        </View>

        {/* AUTO SPELL RANGE */}
        <View style={[styles.sectionBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>AUTO SPELL RANGE (1–50)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.rangeRow}>
              {SPELL_AUTO_RANGES.map((r, i) => (
                <Pressable
                  key={r.label}
                  onPress={() => { if (!isAutoSpelling) setAutoSpellRangeIndex(i); }}
                  style={[
                    styles.rangeBtn,
                    { backgroundColor: i === autoSpellRangeIndex ? RANGE_COLORS[i % RANGE_COLORS.length][1] : colors.muted },
                  ]}
                >
                  <Text style={[styles.rangeBtnText, { color: i === autoSpellRangeIndex ? '#fff' : colors.mutedForeground }]}>
                    {r.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <Pressable
            onPress={isAutoSpelling ? stopAutoSpell : startAutoSpell}
            style={({ pressed }) => [
              styles.reciteBtn,
              {
                backgroundColor: isAutoSpelling ? '#E74C3C' : RANGE_COLORS[autoSpellRangeIndex % RANGE_COLORS.length][1],
                opacity: pressed ? 0.85 : 1,
                marginTop: 12,
              },
            ]}
          >
            <Feather name={isAutoSpelling ? 'square' : 'book-open'} size={20} color="#fff" />
            <Text style={styles.reciteBtnText}>
              {isAutoSpelling ? 'Stop' : `📖 Auto Spell ${SPELL_AUTO_RANGES[autoSpellRangeIndex].label}`}
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
  content: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, gap: 16 },
  numCard: {
    width: 220,
    height: 200,
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
  bigNum: { fontSize: 90, fontFamily: 'Inter_700Bold', color: '#fff', lineHeight: 96 },
  twiWord: { fontSize: 20, fontFamily: 'Inter_600SemiBold', color: 'rgba(255,255,255,0.9)' },
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
  letterBoxRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
  letterBox: {
    width: 40,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  letterBoxText: { fontSize: 20, fontFamily: 'Inter_700Bold' },
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
  numGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 5, justifyContent: 'center' },
  numGridItem: { width: 30, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  numGridText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  sectionBox: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  rangeRow: { flexDirection: 'row', gap: 8 },
  rangeBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  rangeBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  reciteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
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
