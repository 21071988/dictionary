import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api';
import strings from '../strings.json';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  const existing = document.getElementById('google-identity-script') as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script')));
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = 'google-identity-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google script'));
    document.head.appendChild(script);
  });
}

function GoogleSignInButton() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            loginWithGoogle(response.credential).catch(() => setError(strings.auth.genericError));
          },
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
        });
      })
      .catch(() => setError(strings.auth.genericError));
    return () => {
      cancelled = true;
    };
  }, [loginWithGoogle]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <Box>
      <div ref={containerRef} />
      {error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}
    </Box>
  );
}

export function AuthView() {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password || submitting) return;
    if (mode === 'signUp' && !email.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      if (mode === 'signIn') {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), email.trim(), password);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(strings.auth.invalidCredentials);
      } else if (err instanceof ApiError) {
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
            {mode === 'signIn' ? strings.auth.signInTitle : strings.auth.signUpTitle}
          </Typography>
        </Stack>

        <Stack component="form" onSubmit={handleSubmit} spacing={2}>
          <TextField
            label={strings.auth.login}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            fullWidth
            required
          />
          {mode === 'signUp' && (
            <TextField
              label={strings.auth.email}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
            />
          )}
          <TextField
            label={strings.auth.password}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                      aria-label={showPassword ? 'hide password' : 'show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" size="large" disabled={submitting}>
            {mode === 'signIn' ? strings.auth.signInSubmit : strings.auth.signUpSubmit}
          </Button>
        </Stack>

        <Button
          fullWidth
          sx={{ mt: 1 }}
          onClick={() => {
            setMode((m) => (m === 'signIn' ? 'signUp' : 'signIn'));
            setError('');
          }}
        >
          {mode === 'signIn' ? strings.auth.switchToSignUp : strings.auth.switchToSignIn}
        </Button>

        {GOOGLE_CLIENT_ID && (
          <>
            <Divider sx={{ my: 3 }}>{strings.auth.or}</Divider>
            <Stack alignItems="center">
              <GoogleSignInButton />
            </Stack>
          </>
        )}
      </Paper>
    </Box>
  );
}
