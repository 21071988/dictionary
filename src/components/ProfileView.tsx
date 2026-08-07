import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  type SelectChangeEvent,
  Slider,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { useProfile } from '../profile/ProfileContext';
import { useStrings, interpolate } from '../i18n/I18nContext';
import { APP_LANGUAGES, LEARNING_LANGUAGES, type AppLanguage, type LearningLanguage, type WordCard, type WordCardInput } from '../types';
import { getDictionariesForLanguage } from '../dictionaries';

const MAX_IMPORT = 10;

interface ProfileViewProps {
  onImportWord: (input: WordCardInput) => Promise<WordCard>;
}

export function ProfileView({ onImportWord }: ProfileViewProps) {
  const strings = useStrings();
  const { profile, updateProfile, resetProgress } = useProfile();
  const [saved, setSaved] = useState(false);

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const [selectedDictionaryId, setSelectedDictionaryId] = useState('');
  const [selectedWords, setSelectedWords] = useState<Set<number>>(new Set());
  const [importMessage, setImportMessage] = useState('');
  const [importing, setImporting] = useState(false);

  const dictionaries = getDictionariesForLanguage(profile.learningLanguage);
  const selectedDictionary = dictionaries.find((d) => d.id === selectedDictionaryId);

  const handleLearningLanguageChange = async (e: SelectChangeEvent) => {
    await updateProfile({ learningLanguage: e.target.value as LearningLanguage });
    // Word lists are scoped server-side to the learning language — reload
    // so every other view refetches under the new language.
    window.location.reload();
  };

  const handleAppLanguageChange = async (e: SelectChangeEvent) => {
    await updateProfile({ appLanguage: e.target.value as AppLanguage });
  };

  const handleThresholdChange = (_event: React.SyntheticEvent | Event, value: number | number[]) => {
    updateProfile({ knownThreshold: value as number }).then(() => setSaved(true));
  };

  const handleResetProgress = async () => {
    const count = await resetProgress();
    setResetConfirmOpen(false);
    setResetMessage(interpolate(strings.profile.resetProgressSuccess, { count }));
  };

  const toggleWord = (index: number) => {
    setSelectedWords((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else if (next.size < MAX_IMPORT) {
        next.add(index);
      }
      return next;
    });
  };

  const handleImport = async () => {
    if (!selectedDictionary || selectedWords.size === 0) return;
    setImporting(true);
    try {
      const picks = Array.from(selectedWords).map((i) => selectedDictionary.words[i]);
      await Promise.all(
        picks.map((w) =>
          onImportWord({
            word: w.word,
            translation: w.translation,
            transcription: w.transcription ?? '',
          }),
        ),
      );
      setImportMessage(interpolate(strings.profile.importSuccess, { count: picks.length }));
      setSelectedWords(new Set());
    } finally {
      setImporting(false);
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 560, mx: 'auto', overflowY: 'auto', height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {strings.profile.title}
      </Typography>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel id="learning-language-label">{strings.profile.learningLanguage}</InputLabel>
            <Select
              labelId="learning-language-label"
              label={strings.profile.learningLanguage}
              value={profile.learningLanguage}
              onChange={handleLearningLanguageChange}
            >
              {LEARNING_LANGUAGES.map((l) => (
                <MenuItem key={l.code} value={l.code}>
                  {l.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="app-language-label">{strings.profile.appLanguage}</InputLabel>
            <Select
              labelId="app-language-label"
              label={strings.profile.appLanguage}
              value={profile.appLanguage}
              onChange={handleAppLanguageChange}
            >
              {APP_LANGUAGES.map((l) => (
                <MenuItem key={l.code} value={l.code}>
                  {l.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
        <Typography gutterBottom>{strings.profile.knownThreshold}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {strings.profile.knownThresholdHelp}
        </Typography>
        <Slider
          value={profile.knownThreshold}
          min={1}
          max={10}
          step={1}
          marks
          valueLabelDisplay="auto"
          onChangeCommitted={handleThresholdChange}
        />
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
        <Typography gutterBottom>{strings.profile.connectDictionary}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          {strings.profile.connectDictionaryDescription}
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="select-dictionary-label">{strings.profile.selectDictionary}</InputLabel>
          <Select
            labelId="select-dictionary-label"
            label={strings.profile.selectDictionary}
            value={selectedDictionaryId}
            onChange={(e) => {
              setSelectedDictionaryId(e.target.value);
              setSelectedWords(new Set());
            }}
          >
            {dictionaries.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedDictionary &&
          (selectedDictionary.words.length === 0 ? (
            <Alert severity="info">{strings.profile.dictionaryEmpty}</Alert>
          ) : (
            <>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {interpolate(strings.profile.selectWords, { count: MAX_IMPORT })}
              </Typography>
              <List dense sx={{ maxHeight: 260, overflowY: 'auto' }}>
                {selectedDictionary.words.map((w, i) => (
                  <ListItem key={`${w.word}-${i}`} disablePadding>
                    <FormControlLabel
                      sx={{ width: '100%', ml: 0 }}
                      control={
                        <Checkbox
                          checked={selectedWords.has(i)}
                          onChange={() => toggleWord(i)}
                          disabled={!selectedWords.has(i) && selectedWords.size >= MAX_IMPORT}
                        />
                      }
                      label={<ListItemText primary={w.word} secondary={w.translation} />}
                    />
                  </ListItem>
                ))}
              </List>
              <Button
                variant="contained"
                sx={{ mt: 1 }}
                disabled={selectedWords.size === 0 || importing}
                onClick={handleImport}
              >
                {strings.profile.importSelected}
              </Button>
            </>
          ))}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Typography gutterBottom>{strings.profile.resetProgress}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          {strings.profile.resetProgressDescription}
        </Typography>
        <Button color="warning" variant="outlined" onClick={() => setResetConfirmOpen(true)}>
          {strings.profile.resetProgress}
        </Button>
      </Paper>

      <Dialog open={resetConfirmOpen} onClose={() => setResetConfirmOpen(false)}>
        <DialogContent>
          <Typography>{strings.profile.resetProgressConfirm}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetConfirmOpen(false)}>{strings.profile.cancel}</Button>
          <Button color="warning" variant="contained" onClick={handleResetProgress}>
            {strings.profile.resetProgress}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!resetMessage}
        autoHideDuration={3000}
        onClose={() => setResetMessage('')}
        message={resetMessage}
      />
      <Snackbar
        open={!!importMessage}
        autoHideDuration={3000}
        onClose={() => setImportMessage('')}
        message={importMessage}
      />
      <Snackbar
        open={saved}
        autoHideDuration={1500}
        onClose={() => setSaved(false)}
        message={strings.profile.saved}
      />
    </Box>
  );
}
