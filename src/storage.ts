import type { PrimaryField, WordCard } from './types';

const STORAGE_KEY = 'dict-app:words';
const PRIMARY_FIELD_KEY = 'dict-app:primaryField';
const CARD_FLIP_COUNT_KEY = 'dict-app:cardFlipCount';

export function loadWords(): WordCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((w) => ({
      ...w,
      knownCount: typeof w.knownCount === 'number' ? w.knownCount : 0,
    }));
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

export function loadCardFlipCount(): number {
  const raw = Number(localStorage.getItem(CARD_FLIP_COUNT_KEY));
  return Number.isFinite(raw) && raw > 0 ? raw : 0;
}

export function saveCardFlipCount(count: number): void {
  localStorage.setItem(CARD_FLIP_COUNT_KEY, String(count));
}
