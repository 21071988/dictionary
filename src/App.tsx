import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  Paper,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SchoolIcon from '@mui/icons-material/School';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { useWords } from './hooks/useWords';
import { useProgress } from './hooks/useProgress';
import { useFriends } from './hooks/useFriends';
import { DictionaryView } from './components/DictionaryView';
import { AddCardView } from './components/AddCardView';
import { TrainingView } from './components/TrainingView';
import { ExportImportView } from './components/ExportImportView';
import { ProgressView } from './components/ProgressView';
import { FriendsView } from './components/FriendsView';
import { FriendProgressView } from './components/FriendProgressView';
import { ProfileView } from './components/ProfileView';
import { StatsBar } from './components/StatsBar';
import { LanguageToggle } from './components/LanguageToggle';
import { AuthView } from './components/AuthView';
import { ResetPasswordView } from './components/ResetPasswordView';
import { useAuth } from './auth/AuthContext';
import { useStrings } from './i18n/I18nContext';
import { loadPrimaryField, savePrimaryField } from './storage';
import type { PrimaryField, ViewKey } from './types';

const DRAWER_WIDTH = 220;

export default function App() {
  const strings = useStrings();
  const [primaryField, setPrimaryField] = useState<PrimaryField>(() => loadPrimaryField());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width:900px)');
  const { user, logout } = useAuth();
  const { words, addWord, updateWord, deleteWord, importWords, incrementKnownCount } = useWords();
  const { recordAnswer } = useProgress();
  const { listIncomingRequests } = useFriends();
  const [requestNoticeOpen, setRequestNoticeOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const NAV_ITEMS = useMemo<
    { key: ViewKey; path: string; label: string; icon: React.ReactElement }[]
  >(
    () => [
      { key: 'dictionary', path: '/', label: strings.nav.dictionary, icon: <MenuBookIcon /> },
      { key: 'add', path: '/add', label: strings.nav.add, icon: <AddCircleIcon /> },
      { key: 'training', path: '/training', label: strings.nav.training, icon: <SchoolIcon /> },
      {
        key: 'exportImport',
        path: '/export-import',
        label: strings.nav.exportImport,
        icon: <ImportExportIcon />,
      },
      {
        key: 'missingTranslation',
        path: '/missing-translation',
        label: strings.nav.missingTranslation,
        icon: <ReportProblemIcon />,
      },
      {
        key: 'progress',
        path: '/progress',
        label: strings.nav.progress,
        icon: <CalendarMonthIcon />,
      },
      { key: 'friends', path: '/friends', label: strings.nav.friends, icon: <PeopleIcon /> },
      { key: 'profile', path: '/profile', label: strings.nav.profile, icon: <PersonIcon /> },
    ],
    [strings],
  );
  const pathForKey = (key: ViewKey): string =>
    NAV_ITEMS.find((item) => item.key === key)?.path ?? '/';
  const MOBILE_BOTTOM_KEYS = new Set<ViewKey>(['dictionary', 'add', 'training']);
  const MOBILE_BOTTOM_ITEMS = NAV_ITEMS.filter((item) => MOBILE_BOTTOM_KEYS.has(item.key));
  const currentItem = NAV_ITEMS.find((item) => item.path === location.pathname);
  const navigateTo = (key: ViewKey) => navigate(pathForKey(key));

  useEffect(() => {
    savePrimaryField(primaryField);
  }, [primaryField]);

  useEffect(() => {
    if (!user) return;
    listIncomingRequests()
      .then((requests) => setRequestNoticeOpen(requests.length > 0))
      .catch(() => {});
  }, [user, listIncomingRequests]);

  if (location.pathname === '/reset-password') {
    return <ResetPasswordView />;
  }

  if (!user) {
    return <AuthView />;
  }

  const content = (
    <Routes>
      <Route
        path="/"
        element={
          <DictionaryView
            words={words}
            onUpdate={updateWord}
            onDelete={deleteWord}
            onNavigate={navigateTo}
            primaryField={primaryField}
          />
        }
      />
      <Route path="/add" element={<AddCardView onAdd={addWord} />} />
      <Route
        path="/training"
        element={
          <TrainingView
            words={words}
            primaryField={primaryField}
            onMarkKnown={incrementKnownCount}
            onRecordAnswer={recordAnswer}
          />
        }
      />
      <Route
        path="/export-import"
        element={<ExportImportView words={words} onImport={importWords} />}
      />
      <Route
        path="/missing-translation"
        element={
          <DictionaryView
            words={words.filter((w) => !w.translation.trim())}
            onUpdate={updateWord}
            onDelete={deleteWord}
            onNavigate={navigateTo}
            primaryField={primaryField}
            missingTranslationOnly
          />
        }
      />
      <Route path="/progress" element={<ProgressView />} />
      <Route path="/friends" element={<FriendsView />} />
      <Route path="/friends/:friendId" element={<FriendProgressView />} />
      <Route path="/profile" element={<ProfileView onImportWord={addWord} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const drawerContent = (
    <>
      <Toolbar sx={{ px: 2 }}>
        <MenuBookIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap fontWeight={700}>
          {strings.app.title}
        </Typography>
      </Toolbar>
      <Box sx={{ px: 2, pb: 1.5 }}>
        <LanguageToggle value={primaryField} onChange={setPrimaryField} />
      </Box>
      <List sx={{ px: 1 }}>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.key}
            selected={location.pathname === item.path}
            onClick={() => {
              navigate(item.path);
              closeMobileMenu();
            }}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ mt: 'auto' }}>
        <Divider />
        <StatsBar words={words} />
        <Divider />
        <ListItemButton onClick={logout} sx={{ px: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={strings.auth.logout} />
        </ListItemButton>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', height: '100dvh', overflowX: 'hidden' }}>
      {isDesktop && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {!isDesktop && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileMenuOpen}
          onClose={closeMobileMenu}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100%',
        }}
      >
        {!isDesktop && (
          <AppBar position="static" color="primary" elevation={0}>
            <Toolbar variant="dense">
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setMobileMenuOpen(true)}
                aria-label={strings.nav.menu}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" fontWeight={700} sx={{ flex: 1, minWidth: 0 }} noWrap>
                {currentItem?.label ?? strings.app.title}
              </Typography>
              <LanguageToggle
                value={primaryField}
                onChange={setPrimaryField}
                sx={{
                  '& .MuiToggleButton-root': {
                    color: 'primary.contrastText',
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '& .MuiToggleButton-root.Mui-selected': {
                    color: 'primary.main',
                    bgcolor: 'primary.contrastText',
                  },
                }}
              />
              <IconButton color="inherit" onClick={logout} aria-label={strings.auth.logout} sx={{ ml: 0.5 }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Toolbar>
          </AppBar>
        )}

        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>{content}</Box>

        {!isDesktop && (
          <Paper elevation={3} sx={{ flexShrink: 0 }}>
            <StatsBar words={words} sx={{ py: 0.5 }} />
            <Divider />
            <BottomNavigation
              showLabels
              value={location.pathname}
              onChange={(_, newValue) => navigate(newValue)}
              sx={{
                '& .MuiBottomNavigationAction-root': {
                  minWidth: 0,
                  maxWidth: 'none',
                  px: 0.5,
                },
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.65rem',
                },
              }}
            >
              {MOBILE_BOTTOM_ITEMS.map((item) => (
                <BottomNavigationAction
                  key={item.key}
                  label={item.label}
                  value={item.path}
                  icon={item.icon}
                />
              ))}
            </BottomNavigation>
          </Paper>
        )}
      </Box>

      <Dialog open={requestNoticeOpen} onClose={() => setRequestNoticeOpen(false)}>
        <DialogTitle>{strings.friends.requestNoticeTitle}</DialogTitle>
        <DialogContent>
          <Typography>{strings.friends.requestNoticeBody}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestNoticeOpen(false)}>{strings.friends.dismiss}</Button>
          <Button
            variant="contained"
            onClick={() => {
              setRequestNoticeOpen(false);
              navigate('/friends');
            }}
          >
            {strings.friends.viewRequests}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
