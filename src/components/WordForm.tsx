import { useEffect, useState } from 'react';
import { Stack, TextField, Button } from '@mui/material';
import type { WordCard, WordCardInput } from '../types';
import strings from '../strings.json';

interface WordFormProps {
  initial?: WordCard | null;
  submitLabel: string;
  onSubmit: (input: WordCardInput) => void;
  autoFocusWord?: boolean;
}

export function WordForm({ initial, submitLabel, onSubmit, autoFocusWord }: WordFormProps) {
  const [word, setWord] = useState(initial?.word ?? '');
  const [translation, setTranslation] = useState(initial?.translation ?? '');
  const [transcription, setTranscription] = useState(initial?.transcription ?? '');

  useEffect(() => {
    setWord(initial?.word ?? '');
    setTranslation(initial?.translation ?? '');
    setTranscription(initial?.transcription ?? '');
  }, [initial]);

  const canSubmit = word.trim().length > 0 && translation.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ word, translation, transcription });
    if (!initial) {
      setWord('');
      setTranslation('');
      setTranscription('');
    }
  };

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={2}>
      <TextField
        label={strings.form.word}
        value={word}
        onChange={(e) => setWord(e.target.value)}
        autoFocus={autoFocusWord}
        fullWidth
        required
      />
      <TextField
        label={strings.form.translation}
        value={translation}
        onChange={(e) => setTranslation(e.target.value)}
        fullWidth
        required
      />
      <TextField
        label={strings.form.transcription}
        value={transcription}
        onChange={(e) => setTranscription(e.target.value)}
        placeholder={strings.form.transcriptionPlaceholder}
        fullWidth
      />
      <Button type="submit" variant="contained" size="large" disabled={!canSubmit}>
        {submitLabel}
      </Button>
    </Stack>
  );
}
