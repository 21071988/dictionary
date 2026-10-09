import { useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
  Slider,
  Paper,
  ButtonBase,
  FormControlLabel,
  Switch,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ReplayIcon from '@mui/icons-material/Replay';
import SchoolIcon from '@mui/icons-material/School';
import CasinoIcon from '@mui/icons-material/Casino';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { PrimaryField, WordCard } from '../types';
import { useProfile } from '../profile/ProfileContext';
import { Flashcard } from './Flashcard';
import { useStrings } from '../i18n/I18nContext';
import { groupWordsByDate, localDateKey, monthCells } from '../trainingCalendar';

interface TrainingViewProps {
  words: WordCard[];
  primaryField: PrimaryField;
  onMarkKnown: (id: number) => void;
  onRecordAnswer: (known: boolean) => void;
}

const WELL_KNOWN_WEIGHT = 0.3;

function weightedShuffle(cards: WordCard[], knownThreshold: number): WordCard[] {
  return cards
    .map((card) => {
      const weight = card.knownCount >= knownThreshold ? WELL_KNOWN_WEIGHT : 1;
      return { card, key: Math.random() ** (1 / weight) };
    })
    .sort((a, b) => b.key - a.key)
    .map((entry) => entry.card);
}

type Stage = 'setup' | 'session' | 'done';

export function TrainingView({
  words,
  primaryField,
  onMarkKnown,
  onRecordAnswer,
}: TrainingViewProps) {
  const strings = useStrings();
  const { profile } = useProfile();
  const [stage, setStage] = useState<Stage>('setup');
  const [count, setCount] = useState(Math.min(10, words.length || 1));
  const [showAllCards, setShowAllCards] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [session, setSession] = useState<WordCard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answers, setAnswers] = useState<Partial<Record<number, boolean>>>({});
  const touchStartX = useRef<number | null>(null);

  const secondaryField: PrimaryField = primaryField === 'word' ? 'translation' : 'word';

  const currentCard = session[index];
  const wordsByDate = useMemo(() => groupWordsByDate(words), [words]);
  const calendarDays = useMemo(() => monthCells(calendarMonth), [calendarMonth]);
  const weekdays = useMemo(
    () => Array.from({ length: 7 }, (_, day) => new Date(2024, 0, day + 1).toLocaleDateString(profile.appLanguage, { weekday: 'narrow' })),
    [profile.appLanguage],
  );
  const selectedWords = selectedDate ? wordsByDate.get(selectedDate) ?? [] : [];

  const visibleIndices = session
    .map((_, i) => i)
    .filter((i) => showAllCards || !answers[i]);
  const visiblePos = visibleIndices.indexOf(index);

  const startSession = (availableWords: WordCard[] = words) => {
    const picked = weightedShuffle(availableWords, profile.knownThreshold).slice(0, count);
    setSession(picked);
    setIndex(0);
    setFlipped(false);
    setAnswers({});
    setStage('session');
  };

  const handleAnswer = (isKnown: boolean) => {
    const previousAnswer = answers[index];
    const updatedAnswers = { ...answers, [index]: isKnown };
    setAnswers(updatedAnswers);
    if (previousAnswer === undefined && currentCard) {
      onRecordAnswer(isKnown);
      if (isKnown) {
        onMarkKnown(currentCard.id);
      }
    }
    if (session.every((_, i) => updatedAnswers[i])) {
      setStage('done');
      return;
    }
    const remaining = session.map((_, i) => i).filter((i) => showAllCards || !updatedAnswers[i]);
    const pos = visibleIndices.indexOf(index);
    const nextPos = remaining.includes(index) ? pos + 1 : pos;
    setIndex(remaining[((nextPos % remaining.length) + remaining.length) % remaining.length]);
    setFlipped(false);
  };

  const goTo = (newPos: number) => {
    if (newPos < 0 || newPos >= visibleIndices.length) return;
    setIndex(visibleIndices[newPos]);
    setFlipped(false);
  };

  const handleShowAllCardsChange = (checked: boolean) => {
    setShowAllCards(checked);
    if (!checked) {
      const stillVisible = session.map((_, i) => i).filter((i) => !answers[i]);
      if (stillVisible.length > 0 && !stillVisible.includes(index)) {
        setIndex(stillVisible[0]);
        setFlipped(false);
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    const threshold = 50;
    if (deltaX > threshold) goTo(visiblePos - 1);
    else if (deltaX < -threshold) goTo(visiblePos + 1);
  };

  const known = useMemo(
    () => Object.values(answers).filter((v) => v).length,
    [answers],
  );
  const unknown = useMemo(
    () => Object.values(answers).filter((v) => !v).length,
    [answers],
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
            {strings.training.howMany} {count} ?
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Slider
              value={count}
              min={1}
              max={40}
              step={1}
              marks={[
                { value: 1, label: '1' },
                { value: 40, label: '40' },
              ]}
              valueLabelDisplay="auto"
              onChange={(_, v) => setCount(v as number)}
            />
          </Stack>
          <Typography sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
            {strings.training.calendarTitle}
          </Typography>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <IconButton
              size="small"
              aria-label={strings.training.previousMonth}
              onClick={() => {
                setSelectedDate(null);
                setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1));
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <Typography sx={{ textTransform: 'capitalize' }}>
              {calendarMonth.toLocaleDateString(profile.appLanguage, { month: 'long', year: 'numeric' })}
            </Typography>
            <IconButton
              size="small"
              aria-label={strings.training.nextMonth}
              onClick={() => {
                setSelectedDate(null);
                setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1));
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Stack>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center' }}>
            {weekdays.map((weekday, day) => (
              <Typography key={day} variant="caption" color="text.secondary" sx={{ py: 0.5 }}>
                {weekday}
              </Typography>
            ))}
            {calendarDays.map((day, cell) => {
              if (day === null) return <Box key={`empty-${cell}`} sx={{ height: 44 }} />;
              const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
              const dateKey = localDateKey(date.getTime());
              const addedCount = wordsByDate.get(dateKey)?.length ?? 0;
              const selected = selectedDate === dateKey;
              return (
                <Box key={dateKey} sx={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ButtonBase
                    disabled={addedCount === 0}
                    aria-label={`${date.toLocaleDateString(profile.appLanguage)}: ${addedCount}`}
                    onClick={() => setSelectedDate((current) => current === dateKey ? null : dateKey)}
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      border: addedCount ? '1.5px solid' : 'none',
                      borderColor: 'primary.main',
                      bgcolor: selected ? 'primary.main' : 'transparent',
                      color: selected ? 'primary.contrastText' : 'text.primary',
                      overflow: 'visible',
                    }}
                  >
                    {day}
                    {addedCount > 0 && (
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          top: -4,
                          right: -9,
                          minWidth: 14,
                          px: 0.25,
                          borderRadius: 1,
                          lineHeight: 1,
                          color: 'primary.main',
                          fontSize: '0.65rem',
                        }}
                      >
                        {addedCount}
                      </Typography>
                    )}
                  </ButtonBase>
                </Box>
              );
            })}
          </Box>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            disabled={selectedWords.length === 0}
            sx={{ mt: 2 }}
            onClick={() => startSession(selectedWords)}
          >
            {strings.training.startSelectedDate}
          </Button>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<CasinoIcon />}
            sx={{ mt: 3 }}
            onClick={() => startSession()}
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
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {visiblePos + 1} {strings.training.progressOf} {visibleIndices.length}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showAllCards}
                onChange={(e) => handleShowAllCardsChange(e.target.checked)}
              />
            }
            label={strings.training.showAllCards}
            sx={{ m: 0 }}
          />
        </Stack>
        <Slider
          value={visiblePos < 0 ? 0 : visiblePos}
          min={0}
          max={Math.max(visibleIndices.length - 1, 0)}
          step={1}
          onChange={(_, v) => goTo(v as number)}
          valueLabelDisplay="off"
          size="small"
          sx={{ py: 0 }}
        />
      </Box>

      <Box
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
      >
        <IconButton onClick={() => goTo(visiblePos - 1)} disabled={visiblePos <= 0} aria-label="previous">
          <ChevronLeftIcon />
        </IconButton>

        {currentCard && (
          <Flashcard
            frontText={currentCard[primaryField] || strings.dictionary.noTranslation}
            backText={currentCard[secondaryField] || strings.dictionary.noTranslation}
            frontTranscription={primaryField === 'word' ? currentCard.transcription : undefined}
            backTranscription={secondaryField === 'word' ? currentCard.transcription : undefined}
            flipped={flipped}
            onFlip={() => setFlipped((v) => !v)}
          />
        )}

        <IconButton
          onClick={() => goTo(visiblePos + 1)}
          disabled={visiblePos === -1 || visiblePos >= visibleIndices.length - 1}
          aria-label="next"
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2, pb: 1 }}>
        <Button
          variant={answers[index] === false ? 'contained' : 'outlined'}
          color="error"
          startIcon={<CancelIcon />}
          onClick={() => handleAnswer(false)}
        >
          {strings.training.dontKnow}
        </Button>
        <Button
          variant={answers[index] === true ? 'contained' : 'outlined'}
          color="success"
          startIcon={<CheckCircleIcon />}
          onClick={() => handleAnswer(true)}
        >
          {strings.training.know}
        </Button>
      </Stack>
    </Box>
  );
}
