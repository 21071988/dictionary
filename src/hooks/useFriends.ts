import { useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import type { Friend, FriendRequest } from '../api';

export function useFriends() {
  const { authFetch } = useAuth();

  const listFriends = useCallback(() => authFetch<Friend[]>('/api/friends/'), [authFetch]);

  const getFriend = useCallback(
    (id: number) => authFetch<Friend>(`/api/friends/${id}/`),
    [authFetch],
  );

  const searchFriends = useCallback(
    (query: string) =>
      authFetch<Friend[]>(`/api/friends/search/?q=${encodeURIComponent(query)}`),
    [authFetch],
  );

  const sendFriendRequest = useCallback(
    (email: string) =>
      authFetch<FriendRequest>('/api/friends/', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    [authFetch],
  );

  const listIncomingRequests = useCallback(
    () => authFetch<FriendRequest[]>('/api/friends/requests/incoming/'),
    [authFetch],
  );

  const listOutgoingRequests = useCallback(
    () => authFetch<FriendRequest[]>('/api/friends/requests/outgoing/'),
    [authFetch],
  );

  const approveRequest = useCallback(
    (id: number) =>
      authFetch<FriendRequest>(`/api/friends/requests/${id}/approve/`, { method: 'POST' }),
    [authFetch],
  );

  const rejectRequest = useCallback(
    (id: number) => authFetch<void>(`/api/friends/requests/${id}/reject/`, { method: 'POST' }),
    [authFetch],
  );

  const cancelRequest = useCallback(
    (id: number) => authFetch<void>(`/api/friends/requests/${id}/`, { method: 'DELETE' }),
    [authFetch],
  );

  const removeFriend = useCallback(
    (id: number) => authFetch<void>(`/api/friends/${id}/`, { method: 'DELETE' }),
    [authFetch],
  );

  return {
    listFriends,
    getFriend,
    searchFriends,
    sendFriendRequest,
    listIncomingRequests,
    listOutgoingRequests,
    approveRequest,
    rejectRequest,
    cancelRequest,
    removeFriend,
  };
}
