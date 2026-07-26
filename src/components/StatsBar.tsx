import { Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { WordCard } from '../types';
import { WELL_KNOWN_THRESHOLD } from '../types';
import strings from '../strings.json';

interface StatsBarProps {
  words: WordCard[];
  sx?: SxProps<Theme>;
}

export function StatsBar({ words, sx }: StatsBarProps) {
  const total = words.length;
  const known = words.filter((w) => w.knownCount >= WELL_KNOWN_THRESHOLD).length;

  return (
    <Stack direction="row" flexWrap="wrap" sx={{ py: 1, pl: 3, pr: 1, ...sx }}>
      <Typography variant="body2" color="text.secondary">
        {total} {strings.stats.totalWords}
      </Typography>
      <Typography variant="body2" color="success.main">
        {known} {strings.stats.knownWords}
      </Typography>
    </Stack>
  );
}
