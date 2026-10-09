import assert from 'node:assert/strict';
import test from 'node:test';
import words from '../src/dictionaries/data/danish_english_vocabulary.json' with { type: 'json' };
import { findWordSuggestions } from '../src/dictionaries/suggestions.ts';

test('suggests Danish words only after three typed letters', () => {
  assert.deepEqual(findWordSuggestions(words, 'sp'), []);
  assert.deepEqual(findWordSuggestions(words, 'SPI').map(({ word }) => word), ['spille', 'spise']);
});

test('bundled dictionary contains clean, unique words', () => {
  assert.ok(words.length > 0);
  assert.equal(words.some(({ word }) => word.startsWith('at ')), false);
  assert.equal(new Set(words.map(({ word }) => word.toLocaleLowerCase('da'))).size, words.length);
});
