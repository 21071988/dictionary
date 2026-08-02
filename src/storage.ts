import type { PrimaryField } from './types';

const PRIMARY_FIELD_KEY = 'dict-app:primaryField';
const CARD_FLIP_COUNT_KEY = 'dict-app:cardFlipCount';

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
