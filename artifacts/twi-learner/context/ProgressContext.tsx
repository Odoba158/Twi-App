import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface QuizScore {
  type: 'alphabet' | 'numbers' | 'words';
  score: number;
  total: number;
  date: string;
}

interface ProgressState {
  alphabetProgress: number;
  numbersProgress: number;
  wordsProgress: number;
  quizScores: QuizScore[];
  totalCorrect: number;
  totalAttempted: number;
  streakCount: number;
  lastActiveDate: string | null;
}

interface ProgressContextValue extends ProgressState {
  updateAlphabetProgress: (index: number) => void;
  updateNumbersProgress: (num: number) => void;
  incrementWordsProgress: () => void;
  addQuizScore: (score: QuizScore) => void;
  resetProgress: () => void;
  recordActivity: () => void;
}

const defaultState: ProgressState = {
  alphabetProgress: 0,
  numbersProgress: 0,
  wordsProgress: 0,
  quizScores: [],
  totalCorrect: 0,
  totalAttempted: 0,
  streakCount: 0,
  lastActiveDate: null,
};

const ProgressContext = createContext<ProgressContextValue>({
  ...defaultState,
  updateAlphabetProgress: () => {},
  updateNumbersProgress: () => {},
  incrementWordsProgress: () => {},
  addQuizScore: () => {},
  resetProgress: () => {},
  recordActivity: () => {},
});

const STORAGE_KEY = '@twi_progress_v3';

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(defaultState);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        try {
          setState({ ...defaultState, ...JSON.parse(data) });
        } catch {
          // ignore parse errors
        }
      } else {
        // Fallback to old key
        AsyncStorage.getItem('@twi_progress_v2').then((oldData) => {
           if (oldData) {
             try {
               setState({ ...defaultState, ...JSON.parse(oldData) });
             } catch {}
           }
        });
      }
    });
  }, []);

  const save = (newState: ProgressState) => {
    setState(newState);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  const processStreak = (currentState: ProgressState): ProgressState => {
    const todayStr = new Date().toISOString().split('T')[0];
    let newStreak = currentState.streakCount;

    if (!currentState.lastActiveDate) {
      newStreak = 1;
    } else {
      const lastDate = new Date(currentState.lastActiveDate);
      const today = new Date(todayStr);
      
      // Calculate difference in days (ignoring timezones)
      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays === 1) {
        // Active yesterday
        newStreak += 1;
      } else if (diffDays > 1) {
        // Missed a day
        newStreak = 1;
      }
      // If diffDays === 0, active today, do nothing to streak
    }

    return {
      ...currentState,
      streakCount: newStreak,
      lastActiveDate: todayStr,
    };
  };

  const recordActivity = () => {
    save(processStreak(state));
  };

  const updateAlphabetProgress = (index: number) => {
    const next = processStreak({ ...state, alphabetProgress: Math.max(state.alphabetProgress, index) });
    save(next);
  };

  const updateNumbersProgress = (num: number) => {
    const next = processStreak({ ...state, numbersProgress: Math.max(state.numbersProgress, num) });
    save(next);
  };

  const incrementWordsProgress = () => {
    const next = processStreak({ ...state, wordsProgress: state.wordsProgress + 1 });
    save(next);
  };

  const addQuizScore = (score: QuizScore) => {
    const newScores = [score, ...state.quizScores].slice(0, 20);
    const next = processStreak({
      ...state,
      quizScores: newScores,
      totalCorrect: state.totalCorrect + score.score,
      totalAttempted: state.totalAttempted + score.total,
    });
    save(next);
  };

  const resetProgress = () => {
    save(defaultState);
  };

  return (
    <ProgressContext.Provider
      value={{
        ...state,
        updateAlphabetProgress,
        updateNumbersProgress,
        incrementWordsProgress,
        addQuizScore,
        resetProgress,
        recordActivity,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export const useProgress = () => useContext(ProgressContext);
