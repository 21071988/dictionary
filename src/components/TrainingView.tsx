import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  Slider,
  LinearProgress,
  Paper,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ReplayIcon from '@mui/icons-material/Replay';
import SchoolIcon from '@mui/icons-material/School';
import type { WordCard } from '../types';
import { Flashcard } from './Flashcard';
import strings from '../strings.json';

interface TrainingViewProps {
  words: WordCard[];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type Stage = 'setup' | 'session' | 'done';

export function TrainingView({ words }: TrainingViewProps) {
  const [stage, setStage] = useState<Stage>('setup');
  const [count, setCount] = useState(Math.min(10, words.length || 1));
  const [session, setSession] = useState<WordCard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [unknown, setUnknown] = useState(0);

  const maxCount = Math.max(words.length, 1);

  const currentCard = session[index];

  const startSession = () => {
    const picked = shuffle(words).slice(0, count);
    setSession(picked);
    setIndex(0);
    setFlipped(false);
    setKnown(0);
    setUnknown(0);
    setStage('session');
  };

  const handleAnswer = (isKnown: boolean) => {
    if (isKnown) setKnown((v) => v + 1);
    else setUnknown((v) => v + 1);
    if (index + 1 >= session.length) {
      setStage('done');
    } else {
      setIndex((v) => v + 1);
      setFlipped(false);
    }
  };

  const progress = useMemo(
    () => (session.length ? (index / session.length) * 100 : 0),
    [index, session.length],
  );

  if (words.length === 0) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', p: 4 }} spacing={2}>
        <SchoolIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
        <Typography color="text.secondary" align="center">
          {strings.training.empty}
        </Typography>
      </Stack>
    );
  }

  if (stage === 'setup') {
    return (
      <Box sx={{ p: 2, maxWidth: 420, mx: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          {strings.training.setupTitle}
        </Typography>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography gutterBottom color="text.secondary">
            {strings.training.howMany}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Slider
              value={count}
              min={1}
              max={maxCount}
              step={1}
              marks={[
                { value: 1, label: '1' },
                { value: maxCount, label: String(maxCount) },
              ]}
              valueLabelDisplay="auto"
              onChange={(_, v) => setCount(v as number)}
            />
          </Stack>
          <Button
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
            onClick={startSession}
          >
            {strings.training.start}
          </Button>
        </Paper>
      </Box>
    );
  }

  if (stage === 'done') {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', p: 4 }} spacing={2}>
        <SchoolIcon color="primary" sx={{ fontSize: 56 }} />
        <Typography variant="h6">{strings.training.done}</Typography>
        <Typography color="text.secondary">
          {strings.training.knownLabel}: {known} · {strings.training.unknownLabel}: {unknown}{' '}
          {strings.training.outOf} {session.length}
        </Typography>
        <Button variant="contained" startIcon={<ReplayIcon />} onClick={() => setStage('setup')}>
          {strings.training.again}
        </Button>
      </Stack>
    );
  }

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {index + 1} {strings.training.progressOf} {session.length}
          </Typography>
        </Stack>
        <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 1 }} />
      </Box>

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {currentCard && (
          <Flashcard
            word={currentCard.word}
            transcription={currentCard.transcription}
            translation={currentCard.translation}
            flipped={flipped}
            onFlip={() => setFlipped((v) => !v)}
          />
        )}
      </Box>

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2, pb: 1 }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<CancelIcon />}
          disabled={!flipped}
          onClick={() => handleAnswer(false)}
        >
          {strings.training.dontKnow}
        </Button>
        <Button
          variant="outlined"
          color="success"
          startIcon={<CheckCircleIcon />}
          disabled={!flipped}
          onClick={() => handleAnswer(true)}
        >
          {strings.training.know}
        </Button>
      </Stack>
    </Box>
  );
}
