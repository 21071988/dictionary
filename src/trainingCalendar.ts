import type { WordCard } from './types';

export function localDateKey(timestamp: number): string {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function groupWordsByDate(words: WordCard[]): Map<string, WordCard[]> {
  const grouped = new Map<string, WordCard[]>();
  for (const word of words) {
    const key = localDateKey(word.createdAt);
    const dateWords = grouped.get(key);
    if (dateWords) dateWords.push(word);
    else grouped.set(key, [word]);
  }
  return grouped;
}

export function toggleSelectedDate(selectedDates: Set<string>, date: string): Set<string> {
  const next = new Set(selectedDates);
  if (!next.delete(date)) next.add(date);
  return next;
}

export function monthCells(month: Date): Array<number | null> {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const leadingEmptyCells = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  return [
    ...Array.from({ length: leadingEmptyCells }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
}
