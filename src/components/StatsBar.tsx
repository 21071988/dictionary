import { Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { WordCard } from '../types';
import { useProfile } from '../profile/ProfileContext';
import { useStrings } from '../i18n/I18nContext';

interface StatsBarProps {
  words: WordCard[];
  sx?: SxProps<Theme>;
}

export function StatsBar({ words, sx }: StatsBarProps) {
  const strings = useStrings();
  const { profile } = useProfile();
  const total = words.length;
  const known = words.filter((w) => w.knownCount >= profile.knownThreshold).length;

  return (
    <Stack direction="row" flexWrap="wrap" spacing={2} sx={{ py: 1, pl: 3, pr: 1, ...sx }}>
      <Typography variant="body2" color="text.secondary">
        {total} {strings.stats.totalWords}
      </Typography>
      <Typography variant="body2" color="success.main">
        {known} {strings.stats.knownWords}
      </Typography>
    </Stack>
  );
}
