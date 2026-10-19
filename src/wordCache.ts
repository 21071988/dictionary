import type { WordCard } from './types';

const cacheKey = (userId: number) => `dict-app:words:${userId}`;

export function loadWords(userId: number): WordCard[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(cacheKey(userId)) ?? '[]');
    if (!Array.isArray(data)) return [];
    return data.filter((card): card is WordCard =>
      card !== null && typeof card === 'object' &&
      Number.isSafeInteger(card.id) && card.id > 0 &&
      typeof card.word === 'string' && typeof card.translation === 'string' &&
      typeof card.transcription === 'string' &&
      Number.isFinite(card.createdAt) && Number.isFinite(card.knownCount),
    );
  } catch {
    return [];
  }
}

export function saveWords(userId: number, words: WordCard[]): void {
  try {
    // Import placeholders have temporary ids and must not survive a reload.
    localStorage.setItem(cacheKey(userId), JSON.stringify(words.filter((word) => word.id > 0)));
  } catch {
    // Storage may be full or disabled; keep the in-memory dictionary usable.
  }
}

export function mergeFetchedWords(
  current: WordCard[],
  incoming: WordCard[],
  beforeRequest: WordCard[],
): WordCard[] {
  const before = new Map(beforeRequest.map((word) => [word.id, word]));
  const fetched = new Map(incoming.map((word) => [word.id, word]));
  const merged = new Map(current.map((word) => [
    word.id,
    before.get(word.id) === word ? fetched.get(word.id) ?? word : word,
  ]));
  for (const word of incoming) {
    // Do not restore words deleted while the request was in flight.
    if (!merged.has(word.id) && !before.has(word.id)) merged.set(word.id, word);
  }
  return [...merged.values()];
}
