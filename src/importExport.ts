import { v4 as uuid } from 'uuid';
import type { WordCard } from './types';

export function downloadWordsAsJson(words: WordCard[]): void {
  const blob = new Blob([JSON.stringify(words, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dictionary-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function normalizeCard(value: unknown): WordCard | null {
  if (typeof value !== 'object' || value === null) return null;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.word !== 'string' || !candidate.word.trim()) return null;
  if (typeof candidate.translation !== 'string' || !candidate.translation.trim()) return null;
  return {
    id: typeof candidate.id === 'string' && candidate.id ? candidate.id : uuid(),
    word: candidate.word.trim(),
    translation: candidate.translation.trim(),
    transcription: typeof candidate.transcription === 'string' ? candidate.transcription.trim() : '',
    createdAt: typeof candidate.createdAt === 'number' ? candidate.createdAt : Date.now(),
  };
}

export function parseImportedWords(raw: string): WordCard[] {
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error('Invalid file format: expected a JSON array of cards');
  }
  const cards: WordCard[] = [];
  for (const item of data) {
    const card = normalizeCard(item);
    if (card) cards.push(card);
  }
  return cards;
}

export interface MergeResult {
  words: WordCard[];
  added: number;
  updated: number;
}

export function mergeWords(existing: WordCard[], incoming: WordCard[]): MergeResult {
  const byId = new Map(existing.map((w) => [w.id, w]));
  let added = 0;
  let updated = 0;
  for (const card of incoming) {
    if (byId.has(card.id)) {
      updated++;
    } else {
      added++;
    }
    byId.set(card.id, card);
  }
  return { words: Array.from(byId.values()), added, updated };
}
