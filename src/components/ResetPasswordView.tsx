import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { TextField } from '@mui/material';
import { ApiError, confirmPasswordReset } from '../api';
import { useStrings } from '../i18n/I18nContext';

export function ResetPasswordView() {
  const strings = useStrings();
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid') ?? '';
  const token = searchParams.get('token') ?? '';
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const invalidLink = !uid || !token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await confirmPasswordReset(uid, token, newPassword);
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(strings.auth.genericError);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        overflowY: 'auto',
      }}
    >
      <Paper elevation={2} sx={{ width: '100%', maxWidth: 380, p: 4 }}>
        <Stack spacing={1} alignItems="center" sx={{ mb: 3 }}>
          <MenuBookIcon color="primary" fontSize="large" />
          <Typography variant="h5" fontWeight={700}>
            {strings.auth.resetConfirmTitle}
          </Typography>
        </Stack>

        {invalidLink ? (
          <Alert severity="error">{strings.auth.resetInvalidLink}</Alert>
        ) : done ? (
          <Alert severity="success">{strings.auth.resetConfirmSuccess}</Alert>
        ) : (
          <Stack component="form" onSubmit={handleSubmit} spacing={2}>
            <TextField
              label={strings.auth.newPassword}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoFocus
              fullWidth
              required
            />
            {error && <Alert severity="error">{error}</Alert>}
            <Button type="submit" variant="contained" size="large" disabled={submitting}>
              {strings.auth.resetConfirmSubmit}
            </Button>
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
