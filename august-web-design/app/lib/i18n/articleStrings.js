'use client';

import { useState, useEffect } from 'react';
import { en } from './translations/en';

const cache = {};

const fallback = en.article;

async function loadArticleStrings(lang) {
  if (lang === 'en') return fallback;
  if (cache[lang]) return cache[lang];

  try {
    const mod = await import(`./translations/${lang}.js`);
    const strings = mod[lang]?.article || fallback;
    cache[lang] = strings;
    return strings;
  } catch {
    return fallback;
  }
}

/**
 * Hook that returns translated article UI strings for the given language.
 * Uses dynamic import to load the correct translation file.
 */
export function useArticleStrings(lang) {
  const [strings, setStrings] = useState(() => {
    if (lang === 'en') return fallback;
    return cache[lang] || fallback;
  });

  useEffect(() => {
    if (lang === 'en') return;
    loadArticleStrings(lang).then(setStrings);
  }, [lang]);

  return strings;
}

// Keep the sync version for backward compat — returns cached or fallback
export function getArticleStrings(lang) {
  if (lang === 'en') return fallback;
  if (cache[lang]) return cache[lang];
  // Trigger async load for next render
  loadArticleStrings(lang);
  return fallback;
}
