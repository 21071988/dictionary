export interface WordCard {
  id: string;
  word: string;
  translation: string;
  transcription: string;
  createdAt: number;
}

export type WordCardInput = Pick<WordCard, 'word' | 'translation' | 'transcription'>;

export type ViewKey = 'dictionary' | 'add' | 'training';
