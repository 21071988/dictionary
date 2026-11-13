import assert from 'node:assert/strict';
import test from 'node:test';
import { hasDuplicateWord } from '../src/wordValidation.ts';

test('detects existing words regardless of case, surrounding spaces or Unicode encoding', () => {
  const words = [{ word: 'Spise' }, { word: ' café ' }];
  assert.equal(hasDuplicateWord(words, ' SPISE '), true);
  assert.equal(hasDuplicateWord(words, 'cafe\u0301'), true);
  assert.equal(hasDuplicateWord(words, 'spi'), false);
  assert.equal(hasDuplicateWord(words, 'spiser'), false);
  assert.equal(hasDuplicateWord(words, '  '), false);
  assert.equal(hasDuplicateWord([], 'spise'), false);
});
