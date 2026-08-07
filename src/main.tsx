import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { AuthProvider } from './auth/AuthContext';
import { ProfileProvider } from './profile/ProfileContext';
import { I18nProvider } from './i18n/I18nContext';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter basename="/dictionary">
        <AuthProvider>
          <ProfileProvider>
            <I18nProvider>
              <App />
            </I18nProvider>
          </ProfileProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
