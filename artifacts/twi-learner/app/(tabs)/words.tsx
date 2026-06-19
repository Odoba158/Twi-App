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
import { useIntroduction } from '@/hooks/useIntroduction';
import { speakText, stopSpeech, playAudioForId } from '@/utils/speech';

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
  { label: '5 Letters', count: 5, color: '#27AE60' },
  { label: '6 Letters', count: 6, color: '#8E44AD' },
];

export default function WordsScreen() {
  const colors = useColors();
  const { isIntroPlaying } = useIntroduction();
  const insets = useSafeAreaInsets();
  const { incrementWordsProgress } = useProgress();

  const [groupIndex, setGroupIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpelling, setIsSpelling] = useState(false);
  const [activeLetterIdx, setActiveLetterIdx] = useState(-1);
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const spellingRef = useRef(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;

  const filteredWords = useMemo(() => {
    const g = GROUP_TABS[groupIndex];
    if (g.count === 6) return TWI_WORDS.filter(w => w.letters.length >= 6);
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


  const flipCard = () => {
    if (isFlipped) {
      Animated.spring(flipAnim, { toValue: 0, friction: 8, tension: 10, useNativeDriver: true }).start();
    } else {
      Animated.spring(flipAnim, { toValue: 1, friction: 8, tension: 10, useNativeDriver: true }).start();
      handleSpeak();
    }
    setIsFlipped(!isFlipped);
    Haptics.selectionAsync();
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });
  
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg']
  });

  const handleSpeak = () => {
    if (!current) return;
    stopSpelling();
    playAudioForId(current.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    incrementWordsProgress();
  };


  useEffect(() => {
    setCurrentIndex(0);
    stopSpelling();
    setIsFlipped(false);
    flipAnim.setValue(0);
  }, [groupIndex, isFlashcardMode]);

  useEffect(() => {
    return () => {
      spellingRef.current = false;
      stopSpeech();
    };
  }, []);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  if (!current) return null;

  return (
    <View 
      style={[styles.container, { backgroundColor: colors.background, opacity: isIntroPlaying ? 0.6 : 1 }]} 
      pointerEvents={isIntroPlaying ? 'none' : 'auto'}
    >
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Twi Words</Text>
        
        <View style={styles.modeToggle}>
          <Pressable 
            style={[styles.modeBtn, !isFlashcardMode && { backgroundColor: colors.primary }]}
            onPress={() => setIsFlashcardMode(false)}
          >
            <Feather name="list" size={16} color={!isFlashcardMode ? '#fff' : colors.mutedForeground} />
          </Pressable>
          <Pressable 
            style={[styles.modeBtn, isFlashcardMode && { backgroundColor: colors.primary }]}
            onPress={() => setIsFlashcardMode(true)}
          >
            <Feather name="layers" size={16} color={isFlashcardMode ? '#fff' : colors.mutedForeground} />
          </Pressable>
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
                {tab.count === 6
                  ? TWI_WORDS.filter(w => w.letters.length >= 6).length
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
        {isFlashcardMode ? (
          <View style={styles.flashcardContainer}>
            <Pressable onPress={flipCard}>
              <Animated.View style={[styles.flashcardFront, { transform: [{ rotateY: frontInterpolate }] }, { backgroundColor: colors.card }]}>
                <Text style={[styles.fcEnglishLabel, { color: colors.mutedForeground }]}>Translate to Twi</Text>
                <Text style={[styles.fcEnglishWord, { color: colors.text }]}>{current.meaning}</Text>
                <Feather name="refresh-cw" size={24} color={colors.mutedForeground} style={{ marginTop: 20 }} />
                <Text style={{ color: colors.mutedForeground, marginTop: 8, fontFamily: 'Inter_500Medium' }}>Tap to flip</Text>
              </Animated.View>

              <Animated.View style={[styles.flashcardBack, { transform: [{ rotateY: backInterpolate }] }]}>
                <LinearGradient
                  colors={colorPair as [string, string]}
                  style={styles.flashcardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.fcTwiWord}>{current.word}</Text>
                  <View style={[styles.catBadge, { backgroundColor: 'rgba(255,255,255,0.3)', marginTop: 16 }]}>
                    <Text style={styles.catText}>{current.category}</Text>
                  </View>
                  <Pressable style={styles.fcSpeakBtn} onPress={handleSpeak}>
                    <Feather name="volume-2" size={24} color={colorPair[0]} />
                  </Pressable>
                </LinearGradient>
              </Animated.View>
            </Pressable>
          </View>
        ) : (
          <>
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
            </View>
          </>
        )}

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
    paddingLeft: 20,
    paddingRight: 76,
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
  modeToggle: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 20, padding: 4 },
  modeBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
  flashcardContainer: {
    width: 300,
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashcardFront: {
    width: 300,
    height: 400,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  flashcardBack: {
    width: 300,
    height: 400,
    borderRadius: 30,
    position: 'absolute',
    top: 0,
    backfaceVisibility: 'hidden',
  },
  flashcardGradient: {
    flex: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  fcEnglishLabel: { fontSize: 16, fontFamily: 'Inter_500Medium', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  fcEnglishWord: { fontSize: 42, fontFamily: 'Inter_700Bold', textAlign: 'center', paddingHorizontal: 20 },
  fcTwiWord: { fontSize: 56, fontFamily: 'Inter_700Bold', color: '#fff' },
  fcSpeakBtn: {
    marginTop: 32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  }
});
