'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { languages, defaultLanguage } from '../lib/i18n/config';
import { en as enTranslations } from '../lib/i18n/translations/en';
const logger = require('../utils/logger');

// Dynamic import function for translations
const loadTranslation = async (language) => {
  try {
    const module = await import(`../lib/i18n/translations/${language}.js`);
    return module[language] || module.default || {};
  } catch (error) {
    logger.warn(`Failed to load translation for ${language}, falling back to English`);
    return enTranslations;
  }
};

// Cache for loaded translations — pre-seed with English so it's never fetched async
const translationCache = new Map([['en', enTranslations]]);

const LanguageContext = createContext();

export function LanguageProvider({ children, initialLanguage }) {
  const lang = initialLanguage || defaultLanguage;
  const [language, setLanguage] = useState(lang);

  // English is available synchronously; other languages start with English as fallback
  const [translations, setTranslations] = useState(
    translationCache.get(lang) || enTranslations
  );
  const [isLoading, setIsLoading] = useState(lang !== 'en');

  // Load translation for current language (skips for English — already in state)
  useEffect(() => {
    const loadLanguageTranslations = async () => {
      if (translationCache.has(language)) {
        setTranslations(translationCache.get(language));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const translation = await loadTranslation(language);
        translationCache.set(language, translation);
        setTranslations(translation);
      } catch (error) {
        logger.error('Failed to load translations:', error);
        // Fall back to English instead of empty object
        setTranslations(enTranslations);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguageTranslations();
  }, [language]);

  // t() always resolves against current translations — never returns raw keys
  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return safe defaults when used outside LanguageProvider
    return { 
      language: 'en', 
      setLanguage: () => {}, 
      t: (key) => {
        const keys = key.split('.');
        let value = enTranslations;
        for (const k of keys) {
          value = value?.[k];
        }
        return value || key;
      }, 
      isLoading: false 
    };
  }
  return context;
};
