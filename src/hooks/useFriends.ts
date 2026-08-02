import { useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import type { Friend } from '../api';

export function useFriends() {
  const { authFetch } = useAuth();

  const listFriends = useCallback(() => authFetch<Friend[]>('/api/friends/'), [authFetch]);

  const getFriend = useCallback(
    (id: number) => authFetch<Friend>(`/api/friends/${id}/`),
    [authFetch],
  );

  const searchFriend = useCallback(
    (email: string) =>
      authFetch<Friend>(`/api/friends/search/?email=${encodeURIComponent(email)}`),
    [authFetch],
  );

  const addFriend = useCallback(
    (email: string) =>
      authFetch<Friend>('/api/friends/', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    [authFetch],
  );

  const removeFriend = useCallback(
    (id: number) => authFetch<void>(`/api/friends/${id}/`, { method: 'DELETE' }),
    [authFetch],
  );

  return { listFriends, getFriend, searchFriend, addFriend, removeFriend };
}
