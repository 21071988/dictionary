import { useState } from 'react';
import { Box, Snackbar, Alert, Typography, Paper } from '@mui/material';
import type { WordCard, WordCardInput } from '../types';
import { WordForm } from './WordForm';
import { useStrings } from '../i18n/I18nContext';

interface AddCardViewProps {
  words: WordCard[];
  onAdd: (input: WordCardInput) => void;
}

export function AddCardView({ words, onAdd }: AddCardViewProps) {
  const strings = useStrings();
  const [snackOpen, setSnackOpen] = useState(false);

  return (
    <Box sx={{ p: 2, maxWidth: 480, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        {strings.addCard.title}
      </Typography>
      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <WordForm
          existingWords={words}
          submitLabel={strings.addCard.submit}
          autoFocusWord
          onSubmit={(input) => {
            onAdd(input);
            setSnackOpen(true);
          }}
        />
      </Paper>

      <Snackbar
        open={snackOpen}
        autoHideDuration={2000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 72, md: 24 } }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSnackOpen(false)}>
          {strings.addCard.added}
        </Alert>
      </Snackbar>
    </Box>
  );
}
