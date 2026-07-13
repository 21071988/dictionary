import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import type { WordCard, WordCardInput } from '../types';
import { EditWordDialog } from './EditWordDialog';
import { downloadWordsAsJson, parseImportedWords } from '../importExport';
import strings from '../strings.json';

interface DictionaryViewProps {
  words: WordCard[];
  onUpdate: (id: string, input: WordCardInput) => void;
  onDelete: (id: string) => void;
  onImport: (incoming: WordCard[]) => { added: number; updated: number };
}

function getLetter(word: string): string {
  const first = word.trim().charAt(0);
  return first ? first.toLocaleUpperCase() : '#';
}

export function DictionaryView({ words, onUpdate, onDelete, onImport }: DictionaryViewProps) {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<WordCard | null>(null);
  const [importFeedback, setImportFeedback] = useState<
    { severity: 'success' | 'error'; message: string } | null
  >(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const letterRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    if (!q) return words;
    return words.filter(
      (w) =>
        w.word.toLocaleLowerCase().includes(q) ||
        w.translation.toLocaleLowerCase().includes(q),
    );
  }, [words, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, WordCard[]>();
    for (const w of filtered) {
      const letter = getLetter(w.word);
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(w);
    }
    const letters = Array.from(map.keys()).sort((a, b) => a.localeCompare(b));
    for (const letter of letters) {
      map.get(letter)!.sort((a, b) => a.word.localeCompare(b.word));
    }
    return { map, letters };
  }, [filtered]);

  const scrollToLetter = (letter: string) => {
    const el = letterRefs.current.get(letter);
    if (el && listRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
      setImportFeedback({
        severity: 'success',
        message: `${strings.dictionary.importSuccess}: ${strings.dictionary.addedLabel} ${added}, ${strings.dictionary.updatedLabel} ${updated}`,
      });
    } catch {
      setImportFeedback({ severity: 'error', message: strings.dictionary.importError });
    }
  };

  const toolbar = (
    <Box sx={{ p: 1.5, pb: 1 }}>
      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          size="small"
          placeholder={strings.dictionary.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setQuery('')} edge="end">
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
        />
        <Tooltip title={strings.dictionary.export}>
          <IconButton onClick={handleExport} aria-label={strings.dictionary.export}>
            <FileDownloadIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={strings.dictionary.import}>
          <IconButton onClick={handleImportClick} aria-label={strings.dictionary.import}>
            <FileUploadIcon />
          </IconButton>
        </Tooltip>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          hidden
          onChange={handleFileChange}
        />
      </Stack>
    </Box>
  );

  const feedbackSnackbar = (
    <Snackbar
      open={importFeedback !== null}
      autoHideDuration={3000}
      onClose={() => setImportFeedback(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ bottom: { xs: 72, md: 24 } }}
    >
      {importFeedback ? (
        <Alert
          severity={importFeedback.severity}
          variant="filled"
          onClose={() => setImportFeedback(null)}
        >
          {importFeedback.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );

  if (words.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {toolbar}
        <Stack alignItems="center" justifyContent="center" sx={{ flex: 1, p: 4 }} spacing={2}>
          <MenuBookIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
          <Typography color="text.secondary" align="center">
            {strings.dictionary.empty}
          </Typography>
        </Stack>
        {feedbackSnackbar}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {toolbar}

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Paper
          elevation={0}
          square
          sx={{
            width: { xs: 28, sm: 40 },
            flexShrink: 0,
            overflowY: 'auto',
            borderRight: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 0.5,
          }}
        >
          {grouped.letters.map((letter) => (
            <Box
              key={letter}
              component="button"
              onClick={() => scrollToLetter(letter)}
              sx={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                p: { xs: '2px 0', sm: '3px 0' },
                width: '100%',
                fontSize: { xs: 11, sm: 13 },
                fontWeight: 600,
                color: 'primary.main',
                '&:hover': { color: 'secondary.main' },
              }}
            >
              {letter}
            </Box>
          ))}
        </Paper>

        <Box
          ref={listRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            minWidth: 0,
          }}
        >
          {grouped.letters.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
              {strings.dictionary.noResults}
            </Typography>
          ) : (
            <List disablePadding>
              {grouped.letters.map((letter) => (
                <li key={letter}>
                  <ul style={{ padding: 0, margin: 0 }}>
                    <ListSubheader
                      ref={(el: HTMLLIElement | null) => {
                        if (el) letterRefs.current.set(letter, el);
                      }}
                      sx={{
                        bgcolor: 'background.paper',
                        fontWeight: 700,
                        color: 'primary.main',
                        lineHeight: '32px',
                      }}
                    >
                      {letter}
                    </ListSubheader>
                    {grouped.map.get(letter)!.map((card) => (
                      <ListItemButton
                        key={card.id}
                        onClick={() => setEditing(card)}
                        sx={{ alignItems: 'flex-start' }}
                      >
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="baseline" flexWrap="wrap">
                              <Typography component="span" fontWeight={600}>
                                {card.word}
                              </Typography>
                              {card.transcription && (
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  [{card.transcription}]
                                </Typography>
                              )}
                            </Stack>
                          }
                          secondary={card.translation}
                        />
                        <Stack direction="row" spacing={0.5} sx={{ ml: 1 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditing(card);
                            }}
                            aria-label={strings.dictionary.edit}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(card.id);
                            }}
                            aria-label={strings.dictionary.delete}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </ListItemButton>
                    ))}
                  </ul>
                </li>
              ))}
            </List>
          )}
        </Box>
      </Box>

      <EditWordDialog
        open={editing !== null}
        card={editing}
        onClose={() => setEditing(null)}
        onSave={(input) => {
          if (editing) onUpdate(editing.id, input);
          setEditing(null);
        }}
      />
      {feedbackSnackbar}
    </Box>
  );
}
