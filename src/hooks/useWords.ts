import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { planImportMerge, type ImportedCard } from '../importExport';
import type { WordCard, WordCardInput } from '../types';

interface WordCardDto {
  id: number;
  word: string;
  translation: string;
  transcription: string;
  known_count: number;
  created_at: string;
}

function fromDto(dto: WordCardDto): WordCard {
  return {
    id: dto.id,
    word: dto.word,
    translation: dto.translation,
    transcription: dto.transcription,
    knownCount: dto.known_count,
    createdAt: new Date(dto.created_at).getTime(),
  };
}

function toBody(input: WordCardInput) {
  return {
    word: input.word.trim(),
    translation: input.translation.trim(),
    transcription: input.transcription.trim(),
  };
}

export function useWords() {
  const { user, authFetch } = useAuth();
  const [words, setWords] = useState<WordCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const wordsRef = useRef(words);
  wordsRef.current = words;

  useEffect(() => {
    if (!user) {
      setWords([]);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    authFetch<WordCardDto[]>('/api/words/')
      .then((data) => {
        if (!cancelled) setWords(data.map(fromDto));
      })
      .catch(() => {
        if (!cancelled) setWords([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, authFetch]);

  const addWord = useCallback(
    async (input: WordCardInput) => {
      const dto = await authFetch<WordCardDto>('/api/words/', {
        method: 'POST',
        body: JSON.stringify(toBody(input)),
      });
      const card = fromDto(dto);
      setWords((prev) => [...prev, card]);
      return card;
    },
    [authFetch],
  );

  const updateWord = useCallback(
    async (id: number, input: WordCardInput) => {
      const dto = await authFetch<WordCardDto>(`/api/words/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(toBody(input)),
      });
      const card = fromDto(dto);
      setWords((prev) => prev.map((w) => (w.id === id ? card : w)));
    },
    [authFetch],
  );

  const deleteWord = useCallback(
    async (id: number) => {
      await authFetch<void>(`/api/words/${id}/`, { method: 'DELETE' });
      setWords((prev) => prev.filter((w) => w.id !== id));
    },
    [authFetch],
  );

  const incrementKnownCount = useCallback(
    async (id: number) => {
      const current = wordsRef.current.find((w) => w.id === id);
      if (!current) return;
      const dto = await authFetch<WordCardDto>(`/api/words/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ known_count: current.knownCount + 1 }),
      });
      const card = fromDto(dto);
      setWords((prev) => prev.map((w) => (w.id === id ? card : w)));
    },
    [authFetch],
  );

  const importWords = useCallback(
    async (incoming: ImportedCard[]): Promise<{ added: number; updated: number }> => {
      const { toCreate, toUpdate } = planImportMerge(wordsRef.current, incoming);

      const created = await Promise.all(
        toCreate.map((card) =>
          authFetch<WordCardDto>('/api/words/', {
            method: 'POST',
            body: JSON.stringify(toBody(card)),
          }),
        ),
      );
      const updated = await Promise.all(
        toUpdate.map(({ id, input }) =>
          authFetch<WordCardDto>(`/api/words/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(toBody(input)),
          }),
        ),
      );

      setWords((prev) => {
        const byId = new Map(prev.map((w) => [w.id, w]));
        for (const dto of created) byId.set(dto.id, fromDto(dto));
        for (const dto of updated) byId.set(dto.id, fromDto(dto));
        return Array.from(byId.values());
      });

      return { added: created.length, updated: updated.length };
    },
    [authFetch],
  );

  return { words, isLoading, addWord, updateWord, deleteWord, importWords, incrementKnownCount };
}
