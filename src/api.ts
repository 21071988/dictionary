export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://127.0.0.1:8000';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  picture: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}

export interface DayStat {
  date: string;
  done: number;
  total: number;
}

export interface Friend {
  id: number;
  username: string;
  email: string;
  name: string;
}

export interface FriendRequest {
  id: number;
  status: 'pending' | 'approved' | 'removed';
  created_at: string;
  user: Friend;
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json();
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      if (typeof record.detail === 'string') return record.detail;
      const firstValue = Object.values(record)[0];
      if (Array.isArray(firstValue) && typeof firstValue[0] === 'string') return firstValue[0];
    }
  } catch {
    // response wasn't JSON — fall through to the generic message
  }
  return `Request failed with status ${res.status}`;
}

async function publicRequest<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new ApiError(await parseErrorMessage(res), res.status);
  }
  return res.json() as Promise<T>;
}

export function registerAccount(
  username: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  return publicRequest<AuthResponse>('/api/auth/register/', { username, email, password });
}

export function loginAccount(username: string, password: string): Promise<AuthResponse> {
  return publicRequest<AuthResponse>('/api/auth/login/', { username, password });
}

export function loginWithGoogleIdToken(idToken: string): Promise<AuthResponse> {
  return publicRequest<AuthResponse>('/api/auth/google/', { id_token: idToken });
}

export function refreshAccessToken(refresh: string): Promise<{ access: string }> {
  return publicRequest<{ access: string }>('/api/auth/refresh/', { refresh });
}

export function requestPasswordReset(email: string): Promise<{ detail: string }> {
  return publicRequest<{ detail: string }>('/api/auth/password-reset/', { email });
}

export function confirmPasswordReset(
  uid: string,
  token: string,
  newPassword: string,
): Promise<{ detail: string }> {
  return publicRequest<{ detail: string }>('/api/auth/password-reset/confirm/', {
    uid,
    token,
    new_password: newPassword,
  });
}

export async function authorizedRequest<T>(
  path: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    throw new ApiError(await parseErrorMessage(res), res.status);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}
