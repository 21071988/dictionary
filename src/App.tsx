import { useState } from 'react';
import {
  AppBar,
  Box,
  BottomNavigation,
  BottomNavigationAction,
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
import { useWords } from './hooks/useWords';
import { DictionaryView } from './components/DictionaryView';
import { AddCardView } from './components/AddCardView';
import { TrainingView } from './components/TrainingView';
import { ExportImportView } from './components/ExportImportView';
import type { ViewKey } from './types';
import strings from './strings.json';

const NAV_ITEMS: { key: ViewKey; label: string; icon: React.ReactElement }[] = [
  { key: 'dictionary', label: strings.nav.dictionary, icon: <MenuBookIcon /> },
  { key: 'add', label: strings.nav.add, icon: <AddCircleIcon /> },
  { key: 'training', label: strings.nav.training, icon: <SchoolIcon /> },
  { key: 'exportImport', label: strings.nav.exportImport, icon: <ImportExportIcon /> },
];

const DRAWER_WIDTH = 220;

export default function App() {
  const [view, setView] = useState<ViewKey>('dictionary');
  const isDesktop = useMediaQuery('(min-width:900px)');
  const { words, addWord, updateWord, deleteWord, importWords } = useWords();

  const content = (
    <>
      {view === 'dictionary' && (
        <DictionaryView
          words={words}
          onUpdate={updateWord}
          onDelete={deleteWord}
          onNavigate={setView}
        />
      )}
      {view === 'add' && <AddCardView onAdd={addWord} />}
      {view === 'training' && <TrainingView words={words} />}
      {view === 'exportImport' && <ExportImportView words={words} onImport={importWords} />}
    </>
  );

  return (
    <Box sx={{ display: 'flex', height: '100dvh' }}>
      {isDesktop && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          <Toolbar sx={{ px: 2 }}>
            <MenuBookIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" noWrap fontWeight={700}>
              {strings.app.title}
            </Typography>
          </Toolbar>
          <List sx={{ px: 1 }}>
            {NAV_ITEMS.map((item) => (
              <ListItemButton
                key={item.key}
                selected={view === item.key}
                onClick={() => setView(item.key)}
                sx={{ borderRadius: 2, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
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
              <Typography variant="h6" fontWeight={700}>
                {NAV_ITEMS.find((i) => i.key === view)?.label ?? strings.app.title}
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>{content}</Box>

        {!isDesktop && (
          <Paper elevation={3} sx={{ flexShrink: 0 }}>
            <BottomNavigation
              showLabels
              value={view}
              onChange={(_, newValue) => setView(newValue)}
            >
              {NAV_ITEMS.map((item) => (
                <BottomNavigationAction
                  key={item.key}
                  label={item.label}
                  value={item.key}
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
