export interface WordCard {
  id: number;
  word: string;
  translation: string;
  transcription: string;
  createdAt: number;
  knownCount: number;
}

export type WordCardInput = Pick<WordCard, 'word' | 'translation' | 'transcription'>;

export type ViewKey =
  | 'dictionary'
  | 'add'
  | 'training'
  | 'exportImport'
  | 'missingTranslation'
  | 'progress'
  | 'friends'
  | 'profile';

/** Fallback used before the user's own profile setting has loaded. */
export const DEFAULT_KNOWN_THRESHOLD = 3;

export const LEARNING_LANGUAGES = [
  { code: 'da', label: 'Danish' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'it', label: 'Italian' },
  { code: 'fr', label: 'French' },
] as const;

export type LearningLanguage = (typeof LEARNING_LANGUAGES)[number]['code'];

export const APP_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'it', label: 'Italian' },
  { code: 'fr', label: 'French' },
  { code: 'da', label: 'Danish' },
] as const;

export type AppLanguage = (typeof APP_LANGUAGES)[number]['code'];

export type PrimaryField = 'word' | 'translation';
