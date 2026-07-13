import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { loadWords, saveWords } from '../storage';
import { mergeWords, type MergeResult } from '../importExport';
import type { WordCard, WordCardInput } from '../types';

export function useWords() {
  const [words, setWords] = useState<WordCard[]>(() => loadWords());
  const wordsRef = useRef(words);

  useEffect(() => {
    wordsRef.current = words;
    saveWords(words);
  }, [words]);

  const addWord = useCallback((input: WordCardInput) => {
    const card: WordCard = {
      id: uuid(),
      word: input.word.trim(),
      translation: input.translation.trim(),
      transcription: input.transcription.trim(),
      createdAt: Date.now(),
    };
    setWords((prev) => [...prev, card]);
    return card;
  }, []);

  const updateWord = useCallback((id: string, input: WordCardInput) => {
    setWords((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              word: input.word.trim(),
              translation: input.translation.trim(),
              transcription: input.transcription.trim(),
            }
          : w,
      ),
    );
  }, []);

  const deleteWord = useCallback((id: string) => {
    setWords((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const importWords = useCallback((incoming: WordCard[]): Omit<MergeResult, 'words'> => {
    const result = mergeWords(wordsRef.current, incoming);
    wordsRef.current = result.words;
    setWords(result.words);
    return { added: result.added, updated: result.updated };
  }, []);

  return { words, addWord, updateWord, deleteWord, importWords };
}
