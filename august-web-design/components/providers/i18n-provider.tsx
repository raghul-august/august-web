'use client';

import { ReactNode, useEffect } from 'react';
import { I18nextProvider, useTranslation, UseTranslationResponse } from 'react-i18next';
import i18n, { SUPPORTED_LNGS } from '@/lib/i18n';

const LANG_STORAGE_KEY = 'i18nextLng';

function resolveSupportedLng(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const supported = SUPPORTED_LNGS as readonly string[];
  if (supported.includes(raw)) return raw;
  // e.g. 'pt-br' → 'pt-BR', 'zh-CN' variants
  const match = supported.find((s) => s.toLowerCase() === raw.toLowerCase());
  if (match) return match;
  // Fall back to bare language subtag (e.g. 'fr-CA' → 'fr')
  const base = raw.split('-')[0];
  if (supported.includes(base)) return base;
  return null;
}

function detectBrowserLanguage(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    const storedMatch = resolveSupportedLng(stored);
    if (storedMatch) return storedMatch;
  } catch {
    // localStorage unavailable (private mode, etc.) — ignore
  }

  const candidates: Array<string | undefined> = [
    navigator.language,
    ...(navigator.languages ?? []),
  ];
  for (const c of candidates) {
    const match = resolveSupportedLng(c);
    if (match) return match;
  }
  return null;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lng;
      }
      try {
        window.localStorage.setItem(LANG_STORAGE_KEY, lng);
      } catch {
        // ignore
      }
    };

    i18n.on('languageChanged', handleLanguageChange);

    // Defer the language swap to a macrotask so it runs strictly AFTER React
    // finishes hydrating the tree. If we call changeLanguage synchronously in
    // this effect, React's hydration pass can still be comparing server vs
    // client output and flag every translated attribute as a mismatch.
    const swapTimer = setTimeout(() => {
      const detected = detectBrowserLanguage();
      if (detected && detected !== i18n.language) {
        i18n.changeLanguage(detected);
      } else {
        handleLanguageChange(i18n.language);
      }
    }, 0);

    return () => {
      clearTimeout(swapTimer);
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export function useI18n(namespace?: string | string[]): UseTranslationResponse<string, undefined> {
  return useTranslation(namespace);
}
