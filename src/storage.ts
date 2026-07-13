import type { WordCard } from './types';

const STORAGE_KEY = 'dict-app:words';

export function loadWords(): WordCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveWords(words: WordCard[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}
