import { useRef, useState } from 'react';
import { Alert, Box, Button, Paper, Snackbar, Stack, Typography } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { WordCard } from '../types';
import { downloadWordsAsJson, parseImportedWords } from '../importExport';
import strings from '../strings.json';

interface ExportImportViewProps {
  words: WordCard[];
  onImport: (incoming: WordCard[]) => { added: number; updated: number };
}

export function ExportImportView({ words, onImport }: ExportImportViewProps) {
  const [feedback, setFeedback] = useState<
    { severity: 'success' | 'error'; message: string } | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = () => {
    downloadWordsAsJson(words);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const incoming = parseImportedWords(text);
      const { added, updated } = onImport(incoming);
      setFeedback({
        severity: 'success',
        message: `${strings.dictionary.importSuccess}: ${strings.dictionary.addedLabel} ${added}, ${strings.dictionary.updatedLabel} ${updated}`,
      });
    } catch {
      setFeedback({ severity: 'error', message: strings.dictionary.importError });
    }
  };

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', p: 3 }}>
      <Stack spacing={2} sx={{ maxWidth: 480, mx: 'auto' }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={1.5} alignItems="flex-start">
            <Typography variant="h6" fontWeight={700}>
              {strings.dictionary.export}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {strings.exportImport.exportDescription}
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowUpwardIcon />}
              onClick={handleExport}
            >
              {strings.dictionary.export}
            </Button>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={1.5} alignItems="flex-start">
            <Typography variant="h6" fontWeight={700}>
              {strings.dictionary.import}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {strings.exportImport.importDescription}
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowDownwardIcon />}
              onClick={handleImportClick}
            >
              {strings.dictionary.import}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              hidden
              onChange={handleFileChange}
            />
          </Stack>
        </Paper>
      </Stack>

      <Snackbar
        open={feedback !== null}
        autoHideDuration={3000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 72, md: 24 } }}
      >
        {feedback ? (
          <Alert severity={feedback.severity} variant="filled" onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
