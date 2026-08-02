import { useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import type { DayStat } from '../api';

export function useProgress() {
  const { authFetch } = useAuth();

  const recordAnswer = useCallback(
    (known: boolean) =>
      authFetch<DayStat>('/api/progress/record/', {
        method: 'POST',
        body: JSON.stringify({ known }),
      }),
    [authFetch],
  );

  const fetchStats = useCallback(
    (start: string, end: string) =>
      authFetch<DayStat[]>(`/api/progress/?start=${start}&end=${end}`),
    [authFetch],
  );

  const fetchFriendStats = useCallback(
    (friendId: number, start: string, end: string) =>
      authFetch<DayStat[]>(`/api/friends/${friendId}/progress/?start=${start}&end=${end}`),
    [authFetch],
  );

  return { recordAnswer, fetchStats, fetchFriendStats };
}
