import { useState } from 'react';
import { Box, Snackbar, Alert, Typography, Paper } from '@mui/material';
import type { WordCardInput } from '../types';
import { WordForm } from './WordForm';
import strings from '../strings.json';

interface AddCardViewProps {
  onAdd: (input: WordCardInput) => void;
}

export function AddCardView({ onAdd }: AddCardViewProps) {
  const [snackOpen, setSnackOpen] = useState(false);

  return (
    <Box sx={{ p: 2, maxWidth: 480, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        {strings.addCard.title}
      </Typography>
      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <WordForm
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
