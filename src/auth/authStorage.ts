import type { AuthTokens, AuthUser } from '../api';

const ACCESS_KEY = 'dict-app:auth:access';
const REFRESH_KEY = 'dict-app:auth:refresh';
const USER_KEY = 'dict-app:auth:user';

export function loadAuthTokens(): AuthTokens | null {
  const access = localStorage.getItem(ACCESS_KEY);
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!access || !refresh) return null;
  return { access, refresh };
}

export function loadAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function saveAuth(tokens: AuthTokens, user: AuthUser): void {
  localStorage.setItem(ACCESS_KEY, tokens.access);
  localStorage.setItem(REFRESH_KEY, tokens.refresh);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function saveAccessToken(access: string): void {
  localStorage.setItem(ACCESS_KEY, access);
}

export function clearAuth(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}
