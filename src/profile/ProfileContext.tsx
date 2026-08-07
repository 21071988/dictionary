import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '../auth/AuthContext';
import { DEFAULT_KNOWN_THRESHOLD, type AppLanguage, type LearningLanguage } from '../types';

export interface ProfileSettings {
  learningLanguage: LearningLanguage;
  appLanguage: AppLanguage;
  knownThreshold: number;
}

interface ProfileSettingsDto {
  learning_language: LearningLanguage;
  app_language: AppLanguage;
  known_threshold: number;
}

function fromDto(dto: ProfileSettingsDto): ProfileSettings {
  return {
    learningLanguage: dto.learning_language,
    appLanguage: dto.app_language,
    knownThreshold: dto.known_threshold,
  };
}

const DEFAULT_PROFILE: ProfileSettings = {
  learningLanguage: 'da',
  appLanguage: 'en',
  knownThreshold: DEFAULT_KNOWN_THRESHOLD,
};

interface ProfileContextValue {
  profile: ProfileSettings;
  loaded: boolean;
  updateProfile: (patch: Partial<ProfileSettings>) => Promise<void>;
  resetProgress: () => Promise<number>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, authFetch } = useAuth();
  const [profile, setProfile] = useState<ProfileSettings>(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfile(DEFAULT_PROFILE);
      setLoaded(false);
      return;
    }
    let cancelled = false;
    authFetch<ProfileSettingsDto>('/api/auth/profile/')
      .then((dto) => {
        if (cancelled) return;
        setProfile(fromDto(dto));
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user, authFetch]);

  const updateProfile = useCallback(
    async (patch: Partial<ProfileSettings>) => {
      const body: Partial<ProfileSettingsDto> = {};
      if (patch.learningLanguage !== undefined) body.learning_language = patch.learningLanguage;
      if (patch.appLanguage !== undefined) body.app_language = patch.appLanguage;
      if (patch.knownThreshold !== undefined) body.known_threshold = patch.knownThreshold;
      const dto = await authFetch<ProfileSettingsDto>('/api/auth/profile/', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      setProfile(fromDto(dto));
    },
    [authFetch],
  );

  const resetProgress = useCallback(async () => {
    const res = await authFetch<{ reset_count: number }>('/api/auth/profile/reset/', {
      method: 'POST',
    });
    return res.reset_count;
  }, [authFetch]);

  const value = useMemo<ProfileContextValue>(
    () => ({ profile, loaded, updateProfile, resetProgress }),
    [profile, loaded, updateProfile, resetProgress],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
