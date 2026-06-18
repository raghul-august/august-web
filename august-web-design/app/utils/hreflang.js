import { languages, defaultLanguage } from '@/app/lib/i18n/config';

const BASE_URL = 'https://www.meetaugust.ai';

export function generateHreflangAlternates(path, availableLanguageCodes = null) {
  const languageCodes = availableLanguageCodes || Object.keys(languages);
  const alternates = {};

  for (const langCode of languageCodes) {
    if (languages[langCode]) {
      alternates[langCode] = `${BASE_URL}/${langCode}${path}`;
    }
  }
  alternates['x-default'] = `${BASE_URL}/${defaultLanguage}${path}`;

  return alternates;
}

export function generateMetadataAlternates(currentLang, path, availableLanguageCodes = null) {
  return {
    canonical: `${BASE_URL}/${currentLang}${path}`,
    languages: generateHreflangAlternates(path, availableLanguageCodes),
  };
}
