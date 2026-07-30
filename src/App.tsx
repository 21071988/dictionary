import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  Paper,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SchoolIcon from '@mui/icons-material/School';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { useWords } from './hooks/useWords';
import { DictionaryView } from './components/DictionaryView';
import { AddCardView } from './components/AddCardView';
import { TrainingView } from './components/TrainingView';
import { ExportImportView } from './components/ExportImportView';
import { StatsBar } from './components/StatsBar';
import { LanguageToggle } from './components/LanguageToggle';
import { loadPrimaryField, savePrimaryField } from './storage';
import type { PrimaryField, ViewKey } from './types';
import strings from './strings.json';

const NAV_ITEMS: { key: ViewKey; path: string; label: string; icon: React.ReactElement }[] = [
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
];

const pathForKey = (key: ViewKey): string =>
  NAV_ITEMS.find((item) => item.key === key)?.path ?? '/';

const DRAWER_WIDTH = 220;

export default function App() {
  const [primaryField, setPrimaryField] = useState<PrimaryField>(() => loadPrimaryField());
  const isDesktop = useMediaQuery('(min-width:900px)');
  const { words, addWord, updateWord, deleteWord, importWords, incrementKnownCount } = useWords();
  const location = useLocation();
  const navigate = useNavigate();
  const currentItem = NAV_ITEMS.find((item) => item.path === location.pathname);
  const navigateTo = (key: ViewKey) => navigate(pathForKey(key));

  useEffect(() => {
    savePrimaryField(primaryField);
  }, [primaryField]);

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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
                onClick={() => navigate(item.path)}
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
          </Box>
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
              <MenuBookIcon sx={{ mr: 1 }} />
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
              {NAV_ITEMS.map((item) => (
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
    </Box>
  );
}
