import type { PrimaryField, WordCard } from './types';

const STORAGE_KEY = 'dict-app:words';
const PRIMARY_FIELD_KEY = 'dict-app:primaryField';

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

export function loadPrimaryField(): PrimaryField {
  return localStorage.getItem(PRIMARY_FIELD_KEY) === 'translation' ? 'translation' : 'word';
}

export function savePrimaryField(field: PrimaryField): void {
  localStorage.setItem(PRIMARY_FIELD_KEY, field);
}
