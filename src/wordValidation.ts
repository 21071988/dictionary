export function hasDuplicateWord(words: ReadonlyArray<{ word: string }>, input: string): boolean {
  const normalized = input.trim().normalize('NFC').toLowerCase();
  return normalized.length > 0 && words.some(
    ({ word }) => word.trim().normalize('NFC').toLowerCase() === normalized,
  );
}
