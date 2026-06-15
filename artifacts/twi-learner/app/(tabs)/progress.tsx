import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TWI_ALPHABET, TWI_NUMBERS, TWI_WORDS } from '@/constants/twi-data';
import { useProgress } from '@/context/ProgressContext';
import { useColors } from '@/hooks/useColors';
import { speakText, playAudioForId } from '@/utils/speech';

type QuizType = 'alphabet' | 'numbers' | 'words';

interface Question {
  question: string;
  answer: string;
  options: string[];
}

function generateAlphabetQuestions(count: number): Question[] {
  const shuffled = [...TWI_ALPHABET].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((item) => {
    const wrong = TWI_ALPHABET.filter((a) => a.id !== item.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((a) => a.exampleWord);
    const options = [...wrong, item.exampleWord].sort(() => Math.random() - 0.5);
    return {
      question: `In which word do you hear the sound "${item.twiName}"?`,
      answer: item.exampleWord,
      options,
    };
  });
}

function generateNumberQuestions(count: number): Question[] {
  const pool = TWI_NUMBERS.slice(0, 20);
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((item) => {
    const wrong = pool
      .filter((n) => n.number !== item.number)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((n) => n.twi);
    const options = [...wrong, item.twi].sort(() => Math.random() - 0.5);
    return {
      question: `What is the Twi word for ${item.number}?`,
      answer: item.twi,
      options,
    };
  });
}

function generateWordQuestions(count: number): Question[] {
  const shuffled = [...TWI_WORDS].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((item) => {
    const wrong = TWI_WORDS.filter((w) => w.id !== item.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((w) => w.meaning);
    const options = [...wrong, item.meaning].sort(() => Math.random() - 0.5);
    return {
      question: `What does "${item.word}" mean?`,
      answer: item.meaning,
      options,
    };
  });
}

const QUIZ_COLORS: Record<QuizType, [string, string]> = {
  alphabet: ['#7B5EA7', '#9B7DC8'],
  numbers: ['#2980B9', '#5DADE2'],
  words: ['#1B7A4B', '#27AE60'],
};

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const progress = useProgress();

  const [quizVisible, setQuizVisible] = useState(false);
  const [quizType, setQuizType] = useState<QuizType>('alphabet');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  const startQuiz = useCallback(
    (type: QuizType) => {
      let qs: Question[] = [];
      if (type === 'alphabet') qs = generateAlphabetQuestions(5);
      else if (type === 'numbers') qs = generateNumberQuestions(5);
      else qs = generateWordQuestions(5);

      setQuizType(type);
      setQuestions(qs);
      setQuestionIndex(0);
      setSelectedOption(null);
      setCorrectCount(0);
      setQuizDone(false);
      setQuizVisible(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    []
  );

  const handleOption = useCallback(
    (option: string) => {
      if (selectedOption !== null) return;
      setSelectedOption(option);
      const q = questions[questionIndex];
      const isCorrect = option === q.answer;

      if (isCorrect) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        playAudioForId('correct', () => {
          playAudioForId('clapping');
        });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        playAudioForId('wrong', () => {
          playAudioForId('wrong_buzz');
        });
      }

      setTimeout(() => {
        const newCorrect = correctCount + (isCorrect ? 1 : 0);
        if (questionIndex + 1 >= questions.length) {
          setCorrectCount(newCorrect);
          setQuizDone(true);
          progress.addQuizScore({
            type: quizType,
            score: newCorrect,
            total: questions.length,
            date: new Date().toLocaleDateString(),
          });
        } else {
          setCorrectCount(newCorrect);
          setQuestionIndex((i) => i + 1);
          setSelectedOption(null);
        }
      }, 1200);
    },
    [selectedOption, questions, questionIndex, correctCount, quizType, progress]
  );

  const closeQuiz = () => {
    setQuizVisible(false);
  };

  const confirmReset = () => {
    Alert.alert('Reset Progress', 'Are you sure you want to reset all progress?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          progress.resetProgress();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const overallPct =
    progress.totalAttempted > 0
      ? Math.round((progress.totalCorrect / progress.totalAttempted) * 100)
      : 0;

  const q = questions[questionIndex];
  const qColors = QUIZ_COLORS[quizType];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Progress</Text>
        <Pressable onPress={confirmReset} hitSlop={8}>
          <Feather name="refresh-ccw" size={20} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === 'web' ? 118 : insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={['#E8961E', '#F5B942']} style={styles.overallCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.overallPct}>{overallPct}%</Text>
          <Text style={styles.overallLabel}>Overall Score</Text>
          <Text style={styles.overallSub}>
            {progress.totalCorrect} / {progress.totalAttempted} correct
          </Text>
        </LinearGradient>

        <View style={styles.statsRow}>
          {[
            { label: 'Letters', value: `${progress.alphabetProgress + 1}/22`, color: '#7B5EA7' },
            { label: 'Numbers', value: `${progress.numbersProgress + 1}/100`, color: '#2980B9' },
            { label: 'Words', value: `${progress.wordsProgress}`, color: '#1B7A4B' },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Take a Quiz</Text>

        {(['alphabet', 'numbers', 'words'] as QuizType[]).map((type) => {
          const [c1, c2] = QUIZ_COLORS[type];
          const icons: Record<QuizType, string> = { alphabet: 'book', numbers: 'hash', words: 'type' };
          const labels: Record<QuizType, string> = {
            alphabet: 'Alphabet Quiz',
            numbers: 'Numbers Quiz',
            words: 'Words Quiz',
          };
          const subs: Record<QuizType, string> = {
            alphabet: '5 questions on Twi letters',
            numbers: '5 questions on Twi counting',
            words: '5 questions on word meanings',
          };
          return (
            <Pressable
              key={type}
              onPress={() => startQuiz(type)}
              style={({ pressed }) => [styles.quizCard, { backgroundColor: colors.card, opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={[styles.quizIcon, { backgroundColor: c1 + '22' }]}>
                <Feather name={icons[type] as any} size={22} color={c1} />
              </View>
              <View style={styles.quizInfo}>
                <Text style={[styles.quizTitle, { color: colors.text }]}>{labels[type]}</Text>
                <Text style={[styles.quizSub, { color: colors.mutedForeground }]}>{subs[type]}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
            </Pressable>
          );
        })}

        {progress.quizScores.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Scores</Text>
            {progress.quizScores.slice(0, 5).map((s, i) => (
              <View key={i} style={[styles.scoreRow, { backgroundColor: colors.card }]}>
                <View
                  style={[styles.scoreType, { backgroundColor: QUIZ_COLORS[s.type][0] + '22' }]}
                >
                  <Text style={[styles.scoreTypeText, { color: QUIZ_COLORS[s.type][0] }]}>
                    {s.type.charAt(0).toUpperCase() + s.type.slice(1)}
                  </Text>
                </View>
                <Text style={[styles.scoreVal, { color: colors.text }]}>
                  {s.score}/{s.total}
                </Text>
                <Text style={[styles.scoreDate, { color: colors.mutedForeground }]}>{s.date}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <Modal visible={quizVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { paddingTop: Platform.OS === 'web' ? 67 : insets.top + 12 }]}>
            <Pressable onPress={closeQuiz} hitSlop={8}>
              <Feather name="x" size={24} color={colors.text} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {quizType.charAt(0).toUpperCase() + quizType.slice(1)} Quiz
            </Text>
            <View style={styles.modalHeaderRight}>
              {!quizDone && (
                <Text style={[styles.qCount, { color: colors.mutedForeground }]}>
                  {questionIndex + 1}/{questions.length}
                </Text>
              )}
            </View>
          </View>

          <ScrollView
            contentContainerStyle={[styles.modalContent, { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 20 }]}
          >
            {quizDone ? (
              <View style={styles.resultContainer}>
                <LinearGradient colors={qColors} style={styles.resultCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.resultPct}>
                    {Math.round((correctCount / questions.length) * 100)}%
                  </Text>
                  <Text style={styles.resultScore}>
                    {correctCount} out of {questions.length} correct
                  </Text>
                  <Text style={styles.resultEmoji}>
                    {correctCount === questions.length
                      ? 'Perfect!'
                      : correctCount >= 3
                      ? 'Well done!'
                      : 'Keep practising!'}
                  </Text>
                </LinearGradient>

                <Pressable
                  onPress={() => startQuiz(quizType)}
                  style={[styles.retryBtn, { backgroundColor: qColors[0] }]}
                >
                  <Feather name="rotate-ccw" size={18} color="#fff" />
                  <Text style={styles.retryBtnText}>Try Again</Text>
                </Pressable>

                <Pressable
                  onPress={closeQuiz}
                  style={[styles.doneBtn, { backgroundColor: colors.muted }]}
                >
                  <Text style={[styles.doneBtnText, { color: colors.text }]}>Back to Progress</Text>
                </Pressable>
              </View>
            ) : (
              q && (
                <View style={styles.questionContainer}>
                  <LinearGradient colors={qColors} style={styles.questionCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={styles.questionText}>{q.question}</Text>
                  </LinearGradient>

                  <View style={styles.optionsGrid}>
                    {q.options.map((opt) => {
                      const isSelected = selectedOption === opt;
                      const isCorrect = selectedOption !== null && opt === q.answer;
                      const isWrong = isSelected && opt !== q.answer;

                      let bgColor = colors.card;
                      if (isCorrect) bgColor = '#27AE60';
                      else if (isWrong) bgColor = '#E74C3C';
                      else if (isSelected) bgColor = colors.card;

                      return (
                        <Pressable
                          key={opt}
                          onPress={() => handleOption(opt)}
                          disabled={selectedOption !== null}
                          style={({ pressed }) => [
                            styles.optionBtn,
                            {
                              backgroundColor: bgColor,
                              borderColor: isCorrect ? '#27AE60' : isWrong ? '#E74C3C' : colors.border,
                              opacity: pressed && selectedOption === null ? 0.8 : 1,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              { color: isCorrect || isWrong ? '#fff' : colors.text },
                            ]}
                          >
                            {opt}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )
            )}
          </ScrollView>
        </View>
      </Modal>
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
  content: { paddingHorizontal: 20, paddingTop: 8, gap: 16 },
  overallCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  overallPct: { fontSize: 64, fontFamily: 'Inter_700Bold', color: '#fff' },
  overallLabel: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: 'rgba(255,255,255,0.9)' },
  overallSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter_400Regular', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', marginTop: 2 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', marginTop: 4 },
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  quizIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quizInfo: { flex: 1 },
  quizTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  quizSub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  scoreType: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  scoreTypeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  scoreVal: { flex: 1, fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  scoreDate: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  modalTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  modalHeaderRight: { width: 40, alignItems: 'flex-end' },
  qCount: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  modalContent: { paddingHorizontal: 20, paddingTop: 8 },
  questionContainer: { gap: 20 },
  questionCard: {
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 120,
    justifyContent: 'center',
  },
  questionText: { fontSize: 20, fontFamily: 'Inter_600SemiBold', color: '#fff', textAlign: 'center' },
  optionsGrid: { gap: 12 },
  optionBtn: {
    borderRadius: 14,
    padding: 18,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: { fontSize: 16, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  resultContainer: { gap: 16, alignItems: 'center', paddingTop: 16 },
  resultCard: {
    width: '100%',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  resultPct: { fontSize: 72, fontFamily: 'Inter_700Bold', color: '#fff' },
  resultScore: { fontSize: 18, color: 'rgba(255,255,255,0.9)', fontFamily: 'Inter_500Medium' },
  resultEmoji: { fontSize: 22, color: '#fff', fontFamily: 'Inter_700Bold', marginTop: 8 },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 50,
  },
  retryBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  doneBtn: { width: '100%', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 50 },
  doneBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
