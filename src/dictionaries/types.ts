import type { LearningLanguage } from '../types';

export interface DictionaryWord {
  word: string;
  translation: string;
  /** Optional pronunciation hint, e.g. IPA or a simplified respelling. */
  transcription?: string;
}

export interface DictionarySource {
  /** Stable identifier, e.g. "da-basics". Used as the Select value. */
  id: string;
  /** Which learning language this source belongs to — only shown when the user's profile.learningLanguage matches. */
  language: LearningLanguage;
  /** Display name shown in the "Select dictionary" dropdown. */
  name: string;
  words: DictionaryWord[];
}
