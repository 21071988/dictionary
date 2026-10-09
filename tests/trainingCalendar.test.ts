import assert from 'node:assert/strict';
import test from 'node:test';
import { groupWordsByDate, localDateKey, monthCells, toggleSelectedDate } from '../src/trainingCalendar.ts';
import type { WordCard } from '../src/types.ts';

test('groups cards by the user local creation date', () => {
  const timestamp = new Date(2026, 9, 9, 12).getTime();
  const words = [1, 2].map((id) => ({ id, word: '', translation: '', transcription: '', createdAt: timestamp, knownCount: 0 })) satisfies WordCard[];

  assert.equal(localDateKey(timestamp), '2026-10-09');
  assert.equal(groupWordsByDate(words).get('2026-10-09')?.length, 2);
});

test('builds a Monday-first leap-month calendar', () => {
  const cells = monthCells(new Date(2024, 1, 1));

  assert.deepEqual(cells.slice(0, 3), [null, null, null]);
  assert.equal(cells.filter((day) => day !== null).length, 29);
});

test('toggles multiple selected dates without mutating the previous selection', () => {
  const first = toggleSelectedDate(new Set(), '2026-10-05');
  const second = toggleSelectedDate(first, '2026-10-06');

  assert.deepEqual([...second], ['2026-10-05', '2026-10-06']);
  assert.deepEqual([...toggleSelectedDate(second, '2026-10-05')], ['2026-10-06']);
  assert.deepEqual([...first], ['2026-10-05']);
});
