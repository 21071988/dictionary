import { createContext, useContext, useMemo, type ReactNode } from 'react';
import en from '../strings.json';
import es from './locales/es.json';
import it from './locales/it.json';
import fr from './locales/fr.json';
import da from './locales/da.json';
import { useProfile } from '../profile/ProfileContext';
import type { AppLanguage } from '../types';

export type Strings = typeof en;

const LOCALES: Record<AppLanguage, Strings> = { en, es, it, fr, da };

const I18nContext = createContext<Strings>(en);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { profile } = useProfile();
  const strings = useMemo(() => LOCALES[profile.appLanguage] ?? en, [profile.appLanguage]);
  return <I18nContext.Provider value={strings}>{children}</I18nContext.Provider>;
}

export function useStrings(): Strings {
  return useContext(I18nContext);
}

/** Replaces `{name}` placeholders in a translated string, e.g. `t(strings.profile.importSuccess, { count: 5 })`. */
export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => String(vars[key] ?? match));
}
