import type { DictionarySource } from '../types';
import words from '../data/danish_english_vocabulary.json';

export const daBasics: DictionarySource = {
  id: 'da-basics',
  language: 'da',
  name: 'Danish — English',
  words,
};
