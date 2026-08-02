import type { WordCard, WordCardInput } from './types';

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

export type ImportedCard = WordCardInput;

function normalizeCard(value: unknown): ImportedCard | null {
  if (typeof value !== 'object' || value === null) return null;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.word !== 'string' || !candidate.word.trim()) return null;
  return {
    word: candidate.word.trim(),
    translation: typeof candidate.translation === 'string' ? candidate.translation.trim() : '',
    transcription: typeof candidate.transcription === 'string' ? candidate.transcription.trim() : '',
  };
}

export function parseImportedWords(raw: string): ImportedCard[] {
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error('Invalid file format: expected a JSON array of cards');
  }
  const cards: ImportedCard[] = [];
  for (const item of data) {
    const card = normalizeCard(item);
    if (card) cards.push(card);
  }
  return cards;
}

function cardKey(word: string, translation: string): string {
  return `${word.trim().toLocaleLowerCase()}|${translation.trim().toLocaleLowerCase()}`;
}

export interface ImportMergePlan {
  toCreate: ImportedCard[];
  toUpdate: { id: number; input: WordCardInput }[];
}

/**
 * Imported files carry no server id, so cards are matched against the
 * existing (server-owned) list by word+translation instead.
 */
export function planImportMerge(existing: WordCard[], incoming: ImportedCard[]): ImportMergePlan {
  const byKey = new Map(existing.map((w) => [cardKey(w.word, w.translation), w]));
  const toCreate: ImportedCard[] = [];
  const toUpdate: { id: number; input: WordCardInput }[] = [];
  for (const card of incoming) {
    const match = byKey.get(cardKey(card.word, card.translation));
    if (match) {
      toUpdate.push({ id: match.id, input: card });
    } else {
      toCreate.push(card);
    }
  }
  return { toCreate, toUpdate };
}
