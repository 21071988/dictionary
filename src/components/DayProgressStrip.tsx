import { Box, ButtonBase, Paper, Stack, Typography } from '@mui/material';
import type { DayStat } from '../api';
import strings from '../strings.json';

interface DayProgressStripProps {
  stats: DayStat[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const BAR_HEIGHT = 56;
const todayIso = () => new Date().toISOString().slice(0, 10);

function dayLabel(date: string): { weekday: string; day: string } {
  const d = new Date(`${date}T00:00:00`);
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2),
    day: String(d.getDate()),
  };
}

function ratioColor(done: number, total: number): string {
  if (total === 0) return '#e0e0e0';
  const ratio = done / total;
  if (ratio >= 1) return '#2e7d32';
  if (ratio >= 0.5) return '#66bb6a';
  if (ratio > 0) return '#a5d6a7';
  return '#ef9a9a';
}

export function DayProgressStrip({ stats, selectedDate, onSelectDate }: DayProgressStripProps) {
  const selected = stats.find((s) => s.date === selectedDate);
  const today = todayIso();

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 0.75, overflowX: 'auto', pb: 1 }}>
        {stats.map((stat) => {
          const { weekday, day } = dayLabel(stat.date);
          const fillPct = stat.total === 0 ? 0 : Math.round((stat.done / stat.total) * 100);
          return (
            <ButtonBase
              key={stat.date}
              onClick={() => onSelectDate(stat.date)}
              title={`${stat.date} — ${stat.done}/${stat.total}`}
              sx={{
                flexShrink: 0,
                width: 28,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 1,
                p: 0.5,
                bgcolor: stat.date === selectedDate ? 'action.selected' : 'transparent',
              }}
            >
              <Box
                sx={{
                  width: 16,
                  height: BAR_HEIGHT,
                  borderRadius: 1,
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'flex-end',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: `${Math.max(fillPct, stat.total > 0 ? 8 : 0)}%`,
                    bgcolor: ratioColor(stat.done, stat.total),
                    transition: 'height 0.2s',
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ mt: 0.5, fontWeight: stat.date === today ? 700 : 400 }}>
                {day}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                {weekday}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            {selectedDate === today ? strings.progress.today : selectedDate}
          </Typography>
          {selected && selected.total > 0 ? (
            <Typography variant="h4" fontWeight={700}>
              {selected.done}/{selected.total}{' '}
              <Typography component="span" variant="body1" color="text.secondary">
                {strings.progress.doneOf}
              </Typography>
            </Typography>
          ) : (
            <Typography color="text.secondary">{strings.progress.noData}</Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
