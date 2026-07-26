export interface WordCard {
  id: string;
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
  | 'missingTranslation';

export const WELL_KNOWN_THRESHOLD = 3;

export type PrimaryField = 'word' | 'translation';
