import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  ApiError,
  authorizedRequest,
  loginAccount,
  loginWithGoogleIdToken,
  refreshAccessToken,
  registerAccount,
  type AuthTokens,
  type AuthUser,
} from '../api';
import { clearAuth, loadAuthTokens, loadAuthUser, saveAccessToken, saveAuth } from './authStorage';

interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  authFetch: <T>(path: string, options?: RequestInit) => Promise<T>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const tokensRef = useRef<AuthTokens | null>(loadAuthTokens());
  const [user, setUser] = useState<AuthUser | null>(() =>
    tokensRef.current ? loadAuthUser() : null,
  );

  const applySession = useCallback((tokens: AuthTokens, nextUser: AuthUser) => {
    tokensRef.current = tokens;
    setUser(nextUser);
    saveAuth(tokens, nextUser);
  }, []);

  const logout = useCallback(() => {
    tokensRef.current = null;
    setUser(null);
    clearAuth();
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await loginAccount(username, password);
      applySession({ access: res.access, refresh: res.refresh }, res.user);
    },
    [applySession],
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const res = await registerAccount(username, email, password);
      applySession({ access: res.access, refresh: res.refresh }, res.user);
    },
    [applySession],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      const res = await loginWithGoogleIdToken(idToken);
      applySession({ access: res.access, refresh: res.refresh }, res.user);
    },
    [applySession],
  );

  const authFetch = useCallback(
    async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
      const tokens = tokensRef.current;
      if (!tokens) {
        throw new ApiError('Not authenticated', 401);
      }
      try {
        return await authorizedRequest<T>(path, tokens.access, options);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          try {
            const refreshed = await refreshAccessToken(tokens.refresh);
            tokensRef.current = { access: refreshed.access, refresh: tokens.refresh };
            saveAccessToken(refreshed.access);
            return await authorizedRequest<T>(path, refreshed.access, options);
          } catch {
            logout();
          }
        }
        throw err;
      }
    },
    [logout],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, login, register, loginWithGoogle, logout, authFetch }),
    [user, login, register, loginWithGoogle, logout, authFetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
