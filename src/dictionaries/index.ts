import type { LearningLanguage } from '../types';
import type { DictionarySource } from './types';
import { daBasics } from './sources/da';
import { enBasics } from './sources/en';
import { esBasics } from './sources/es';
import { itBasics } from './sources/it';
import { frBasics } from './sources/fr';

export type { DictionarySource, DictionaryWord } from './types';

export const DICTIONARY_SOURCES: DictionarySource[] = [
  daBasics,
  enBasics,
  esBasics,
  itBasics,
  frBasics,
];

export function getDictionariesForLanguage(language: LearningLanguage): DictionarySource[] {
  return DICTIONARY_SOURCES.filter((source) => source.language === language);
}
