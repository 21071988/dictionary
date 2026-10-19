import assert from 'node:assert/strict';
import test, { beforeEach } from 'node:test';
import { loadWords, mergeFetchedWords, saveWords } from '../src/wordCache.ts';
import type { WordCard } from '../src/types.ts';

const storage = new Map<string, string>();
beforeEach(() => {
  storage.clear();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  });
});

const card = (id: number, word = 'hund'): WordCard => ({
  id, word, translation: 'dog', transcription: '', createdAt: 1, knownCount: 0,
});

test('persists words per user and excludes temporary import cards', () => {
  saveWords(1, [card(1), card(-1)]);
  saveWords(2, [card(2)]);
  assert.deepEqual(loadWords(1), [card(1)]);
  assert.deepEqual(loadWords(2), [card(2)]);
  assert.deepEqual(loadWords(3), []);
  saveWords(1, []);
  assert.deepEqual(loadWords(1), []);
});

test('handles malformed and invalid cached words', () => {
  storage.set('dict-app:words:1', '{');
  assert.deepEqual(loadWords(1), []);
  storage.set('dict-app:words:1', '{}');
  assert.deepEqual(loadWords(1), []);
  storage.set('dict-app:words:1', JSON.stringify([null, {}, { ...card(1), word: 1 }, card(2)]));
  assert.deepEqual(loadWords(1), [card(2)]);
});

test('unavailable storage does not prevent using the dictionary', () => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() { throw new Error('Storage disabled'); },
  });
  assert.deepEqual(loadWords(1), []);
  assert.doesNotThrow(() => saveWords(1, [card(1)]));
});

test('refreshes cached words and appends new backend words without duplicates', () => {
  const cached = [card(1), card(2)];
  const updated = { ...card(1), knownCount: 3 };
  assert.deepEqual(
    mergeFetchedWords(cached, [updated, card(3), card(3)], cached),
    [updated, card(2), card(3)],
  );
  assert.deepEqual(mergeFetchedWords([], [card(1)], []), [card(1)]);
});

test('background fetch preserves additions, edits and deletions made during loading', () => {
  const cached = [card(1), card(2)];
  const edited = { ...card(1), translation: 'a dog' };
  const current = [edited, card(3)];
  assert.deepEqual(
    mergeFetchedWords(current, [card(1), card(2), card(3), card(4)], cached),
    [edited, card(3), card(4)],
  );
});
