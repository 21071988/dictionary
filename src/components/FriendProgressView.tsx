import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useFriends } from '../hooks/useFriends';
import { useProgress } from '../hooks/useProgress';
import type { DayStat, Friend } from '../api';
import { DayProgressStrip } from './DayProgressStrip';
import strings from '../strings.json';

const WINDOW_DAYS = 35;

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function FriendProgressView() {
  const { friendId } = useParams<{ friendId: string }>();
  const id = Number(friendId);
  const navigate = useNavigate();
  const { getFriend } = useFriends();
  const { fetchFriendStats } = useProgress();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [stats, setStats] = useState<DayStat[] | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => isoDaysAgo(0));
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    let cancelled = false;
    getFriend(id)
      .then((data) => {
        if (!cancelled) setFriend(data);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      });
    fetchFriendStats(id, isoDaysAgo(WINDOW_DAYS - 1), isoDaysAgo(0))
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) setStats([]);
      });
    return () => {
      cancelled = true;
    };
  }, [id, getFriend, fetchFriendStats]);

  return (
    <Box sx={{ p: 2, maxWidth: 480, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/friends')}
        sx={{ mb: 1 }}
      >
        {strings.friends.backToFriends}
      </Button>

      {notFound ? (
        <Typography color="text.secondary">{strings.friends.notFound}</Typography>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            {friend?.name ?? '…'}
          </Typography>
          {stats === null ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <DayProgressStrip stats={stats} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          )}
        </>
      )}
    </Box>
  );
}
