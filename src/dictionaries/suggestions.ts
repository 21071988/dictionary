import type { DictionaryWord } from './types';

const MIN_QUERY_LENGTH = 3;
const MAX_SUGGESTIONS = 8;

export function findWordSuggestions(words: DictionaryWord[], input: string): DictionaryWord[] {
  const query = input.trim().toLocaleLowerCase('da');
  if (query.length < MIN_QUERY_LENGTH) return [];

  const suggestions: DictionaryWord[] = [];
  for (const entry of words) {
    if (entry.word.toLocaleLowerCase('da').startsWith(query)) suggestions.push(entry);
    if (suggestions.length === MAX_SUGGESTIONS) break;
  }
  return suggestions;
}
