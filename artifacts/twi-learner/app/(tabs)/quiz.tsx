import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TWI_WORDS, TwiWord } from '@/constants/twi-data';
import { useProgress } from '@/context/ProgressContext';
import { useColors } from '@/hooks/useColors';
import { useIntroduction } from '@/hooks/useIntroduction';
import { playAudioForId } from '@/utils/speech';
import { Audio } from 'expo-av';
import { AUDIO_MAP } from '@/constants/audio-map';

type QuestionMode = 'listen' | 'translate';

interface Question {
  word: TwiWord;
  mode: QuestionMode;
  options: string[];
}

export default function QuizScreen() {
  const colors = useColors();
  useIntroduction();
  const insets = useSafeAreaInsets();
  const { addQuizScore } = useProgress();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const generateQuiz = () => {
    // Pick 5 random words
    const shuffled = [...TWI_WORDS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    const generated = selected.map(word => {
      const mode: QuestionMode = Math.random() > 0.5 ? 'listen' : 'translate';
      
      // Get 2 wrong options
      const wrongPool = TWI_WORDS.filter(w => w.id !== word.id).sort(() => 0.5 - Math.random());
      const wrongOpts = wrongPool.slice(0, 2);

      let options = [];
      if (mode === 'listen') {
        // Options are English meanings
        options = [word.meaning, wrongOpts[0].meaning, wrongOpts[1].meaning];
      } else {
        // Options are Twi words
        options = [word.word, wrongOpts[0].word, wrongOpts[1].word];
      }

      return {
        word,
        mode,
        options: options.sort(() => 0.5 - Math.random())
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setGameState('playing');
  };

  const currentQ = questions[currentIndex];

  const playSimultaneousSound = async (id: string) => {
    try {
      const audioRes = AUDIO_MAP[id];
      if (audioRes) {
        const { sound } = await Audio.Sound.createAsync(audioRes);
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      }
    } catch (e) {
      console.log('Error playing simultaneous sound', e);
    }
  };

  const handleAnswer = (ans: string) => {
    if (selectedAnswer !== null) return; // already answered

    setSelectedAnswer(ans);
    let correct = false;

    if (currentQ.mode === 'listen') {
      correct = ans === currentQ.word.meaning;
    } else {
      correct = ans === currentQ.word.word;
    }

    setIsCorrect(correct);

    if (correct) {
      setScore(s => s + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playAudioForId('correct');
      playSimultaneousSound('clapping');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      playAudioForId('wrong');
      playSimultaneousSound('wrong_buzz');
    }

    setTimeout(() => {
      if (currentIndex < 4) {
        setCurrentIndex(i => i + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        finishQuiz(score + (correct ? 1 : 0));
      }
    }, 2500);
  };

  const finishQuiz = (finalScore: number) => {
    setGameState('finished');
    addQuizScore({
      type: 'words',
      score: finalScore,
      total: 5,
      date: new Date().toISOString()
    });
    
    if (finalScore >= 4) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const playListenAudio = () => {
    if (currentQ && currentQ.mode === 'listen') {
      playAudioForId(currentQ.word.id);
    }
  };

  // Play audio automatically when listening question appears
  useEffect(() => {
    if (gameState === 'playing' && currentQ?.mode === 'listen' && selectedAnswer === null) {
      setTimeout(playListenAudio, 500);
    }
  }, [currentIndex, gameState]);

  if (gameState === 'start') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad + 40, alignItems: 'center' }]}>
        <View style={styles.iconCircle}>
          <Feather name="target" size={48} color="#fff" />
        </View>
        <Text style={[styles.title, { color: colors.text, marginTop: 24 }]}>Mini Games</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, textAlign: 'center', marginHorizontal: 30, marginTop: 8 }]}>
          Test your knowledge with quick 5-question challenges. Contains Listen & Guess and Translation modes.
        </Text>

        <Pressable onPress={generateQuiz} style={[styles.startBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.startBtnText}>Start Quiz</Text>
        </Pressable>
      </View>
    );
  }

  if (gameState === 'finished') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad + 40, alignItems: 'center' }]}>
        <View style={[styles.iconCircle, { backgroundColor: score >= 4 ? '#27AE60' : colors.primary }]}>
          <Feather name={score >= 4 ? "award" : "star"} size={48} color="#fff" />
        </View>
        <Text style={[styles.title, { color: colors.text, marginTop: 24 }]}>Quiz Complete!</Text>
        <Text style={[styles.scoreText, { color: colors.text }]}>You scored {score} out of 5</Text>

        <View style={{ flexDirection: 'row', gap: 16, marginTop: 40 }}>
          <Pressable onPress={() => router.push('/(tabs)/progress')} style={[styles.actionBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
            <Text style={[styles.actionBtnText, { color: colors.text }]}>View Progress</Text>
          </Pressable>
          <Pressable onPress={generateQuiz} style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.actionBtnText, { color: '#fff' }]}>Play Again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.qCounter, { color: colors.mutedForeground }]}>Question {currentIndex + 1} of 5</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${((currentIndex) / 5) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.questionContainer}>
        {currentQ.mode === 'listen' ? (
          <View style={styles.listenCard}>
            <Text style={[styles.modeLabel, { color: colors.mutedForeground }]}>Listen & Guess</Text>
            <Pressable onPress={playListenAudio} style={[styles.playBtn, { backgroundColor: colors.primary }]}>
              <Feather name="volume-2" size={32} color="#fff" />
            </Pressable>
            <Text style={[styles.instruction, { color: colors.text }]}>What does this mean?</Text>
          </View>
        ) : (
          <View style={[styles.listenCard, { backgroundColor: colors.card }]}>
             <Text style={[styles.modeLabel, { color: colors.mutedForeground }]}>Translate to Twi</Text>
             <Text style={[styles.translateWord, { color: colors.text }]}>{currentQ.word.meaning}</Text>
          </View>
        )}

        <View style={styles.optionsContainer}>
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedAnswer === opt;
            
            let isCorrectOption = false;
            if (currentQ.mode === 'listen') isCorrectOption = opt === currentQ.word.meaning;
            else isCorrectOption = opt === currentQ.word.word;

            let bgColor = colors.card;
            let borderColor = colors.border;
            let textColor = colors.text;

            if (selectedAnswer !== null) {
              if (isCorrectOption) {
                bgColor = '#E8F5E9';
                borderColor = '#27AE60';
                textColor = '#2E7D32';
              } else if (isSelected) {
                bgColor = '#FFEBEE';
                borderColor = '#E74C3C';
                textColor = '#C62828';
              }
            }

            return (
              <Pressable
                key={i}
                onPress={() => handleAnswer(opt)}
                style={[
                  styles.optionBtn,
                  { backgroundColor: bgColor, borderColor, borderWidth: 2 }
                ]}
              >
                <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                {selectedAnswer !== null && isCorrectOption && <Feather name="check-circle" size={20} color="#27AE60" />}
                {selectedAnswer !== null && isSelected && !isCorrectOption && <Feather name="x-circle" size={20} color="#E74C3C" />}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8E44AD',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  subtitle: { fontSize: 16, fontFamily: 'Inter_400Regular', lineHeight: 24 },
  scoreText: { fontSize: 20, fontFamily: 'Inter_500Medium', marginTop: 12 },
  startBtn: {
    marginTop: 40,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startBtnText: { color: '#fff', fontSize: 18, fontFamily: 'Inter_700Bold' },
  actionBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  actionBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  
  header: { paddingLeft: 24, paddingRight: 76, paddingBottom: 20 },
  qCounter: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 8 },
  progressTrack: { height: 8, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  
  questionContainer: { flex: 1, paddingHorizontal: 24 },
  listenCard: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginBottom: 32,
  },
  modeLabel: { fontSize: 13, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  instruction: { fontSize: 18, fontFamily: 'Inter_500Medium' },
  translateWord: { fontSize: 36, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  
  optionsContainer: { gap: 16 },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
});
