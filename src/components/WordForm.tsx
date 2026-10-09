import { useEffect, useMemo, useRef, useState } from 'react';
import { Autocomplete, Button, Stack, TextField } from '@mui/material';
import type { WordCard, WordCardInput } from '../types';
import { useStrings } from '../i18n/I18nContext';
import { getDictionariesForLanguage } from '../dictionaries';
import { findWordSuggestions } from '../dictionaries/suggestions';
import { useProfile } from '../profile/ProfileContext';

interface WordFormProps {
  initial?: WordCard | null;
  submitLabel: string;
  onSubmit: (input: WordCardInput) => void;
  autoFocusWord?: boolean;
}

export function WordForm({ initial, submitLabel, onSubmit, autoFocusWord }: WordFormProps) {
  const strings = useStrings();
  const { profile } = useProfile();
  const [word, setWord] = useState(initial?.word ?? '');
  const [translation, setTranslation] = useState(initial?.translation ?? '');
  const [transcription, setTranscription] = useState(initial?.transcription ?? '');
  const wordInputRef = useRef<HTMLInputElement | null>(null);
  const dictionaryWords = useMemo(
    () => getDictionariesForLanguage(profile.learningLanguage).flatMap((source) => source.words),
    [profile.learningLanguage],
  );
  const suggestions = useMemo(
    () => findWordSuggestions(dictionaryWords, word),
    [dictionaryWords, word],
  );

  useEffect(() => {
    setWord(initial?.word ?? '');
    setTranslation(initial?.translation ?? '');
    setTranscription(initial?.transcription ?? '');
  }, [initial]);

  const canSubmit = word.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ word, translation, transcription });
    if (!initial) {
      setWord('');
      setTranslation('');
      setTranscription('');
      wordInputRef.current?.focus();
    }
  };

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={2}>
      <Autocomplete
        freeSolo
        autoHighlight
        options={suggestions}
        inputValue={word}
        filterOptions={(options) => options}
        getOptionLabel={(option) => typeof option === 'string' ? option : option.word}
        onInputChange={(_, value) => setWord(value)}
        onChange={(_, option) => {
          if (!option || typeof option === 'string') return;
          setWord(option.word);
          setTranslation(option.translation);
          setTranscription(option.transcription ?? '');
        }}
        renderOption={(props, option) => (
          <li {...props} key={option.word}>
            {option.word} — {option.translation}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={strings.form.word}
            autoFocus={autoFocusWord}
            inputRef={wordInputRef}
            fullWidth
            required
          />
        )}
      />
      <TextField
        label={strings.form.translation}
        value={translation}
        onChange={(e) => setTranslation(e.target.value)}
        fullWidth
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
