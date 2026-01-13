/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import pl from './locales/pl.json';
import en from './locales/en.json';

type Locale = 'pl' | 'en';
type Translations = typeof pl;

const LOCALE_STORAGE_KEY = 'timetune-locale';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<Locale, Translations> = {
  pl,
  en,
};

function getInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === 'pl' || stored === 'en') {
      return stored;
    }
  } catch {} // eslint-disable-line no-empty

  const browserLang = navigator.language?.toLowerCase() || '';
  if (browserLang.startsWith('pl')) {
    return 'pl';
  }

  return 'en';
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    } catch {} // eslint-disable-line no-empty
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'pl' ? 'en' : 'pl');
  }, [locale, setLocale]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: unknown = translations[locale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        console.warn(`Missing translation: ${key}`);
        return key;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Missing translation: ${key}`);
      return key;
    }

    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, k) => String(params[k] ?? `{{${k}}}`));
    }

    return value;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslations() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslations must be used within I18nProvider');
  }
  return context;
}

// Polish pluralization helper
// Polish has 3 plural forms:
// - 1 → "karta" (one)
// - 2-4, 22-24, 32-34... → "karty" (few)
// - 0, 5-21, 25-31... → "kart" (many)
export function pluralize(count: number, one: string, few: string, many: string): string {
  if (count === 1) return one;

  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return many;
  if (lastDigit >= 2 && lastDigit <= 4) return few;
  return many;
}
