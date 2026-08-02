import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useProgress } from '../hooks/useProgress';
import { DayProgressStrip } from './DayProgressStrip';
import type { DayStat } from '../api';
import strings from '../strings.json';

const WINDOW_DAYS = 35;

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function ProgressView() {
  const { fetchStats } = useProgress();
  const [stats, setStats] = useState<DayStat[] | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => isoDaysAgo(0));

  useEffect(() => {
    let cancelled = false;
    fetchStats(isoDaysAgo(WINDOW_DAYS - 1), isoDaysAgo(0))
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) setStats([]);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchStats]);

  return (
    <Box sx={{ p: 2, maxWidth: 480, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        {strings.progress.title}
      </Typography>
      {stats === null ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <DayProgressStrip stats={stats} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      )}
    </Box>
  );
}
