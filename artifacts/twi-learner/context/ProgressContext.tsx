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
}

interface ProgressContextValue extends ProgressState {
  updateAlphabetProgress: (index: number) => void;
  updateNumbersProgress: (num: number) => void;
  incrementWordsProgress: () => void;
  addQuizScore: (score: QuizScore) => void;
  resetProgress: () => void;
}

const defaultState: ProgressState = {
  alphabetProgress: 0,
  numbersProgress: 0,
  wordsProgress: 0,
  quizScores: [],
  totalCorrect: 0,
  totalAttempted: 0,
};

const ProgressContext = createContext<ProgressContextValue>({
  ...defaultState,
  updateAlphabetProgress: () => {},
  updateNumbersProgress: () => {},
  incrementWordsProgress: () => {},
  addQuizScore: () => {},
  resetProgress: () => {},
});

const STORAGE_KEY = '@twi_progress_v2';

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(defaultState);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        try {
          setState(JSON.parse(data));
        } catch {
          // ignore parse errors
        }
      }
    });
  }, []);

  const save = (newState: ProgressState) => {
    setState(newState);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  const updateAlphabetProgress = (index: number) => {
    const next = { ...state, alphabetProgress: Math.max(state.alphabetProgress, index) };
    save(next);
  };

  const updateNumbersProgress = (num: number) => {
    const next = { ...state, numbersProgress: Math.max(state.numbersProgress, num) };
    save(next);
  };

  const incrementWordsProgress = () => {
    save({ ...state, wordsProgress: state.wordsProgress + 1 });
  };

  const addQuizScore = (score: QuizScore) => {
    const newScores = [score, ...state.quizScores].slice(0, 20);
    save({
      ...state,
      quizScores: newScores,
      totalCorrect: state.totalCorrect + score.score,
      totalAttempted: state.totalAttempted + score.total,
    });
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
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export const useProgress = () => useContext(ProgressContext);
