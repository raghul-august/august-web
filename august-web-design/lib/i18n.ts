'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import ar from '@/locales/ar.json';
import bn from '@/locales/bn.json';
import cs from '@/locales/cs.json';
import de from '@/locales/de.json';
import el from '@/locales/el.json';
import es from '@/locales/es.json';
import fil from '@/locales/fil.json';
import gu from '@/locales/gu.json';
import he from '@/locales/he.json';
import hi from '@/locales/hi.json';
import hu from '@/locales/hu.json';
import id from '@/locales/id.json';
import it from '@/locales/it.json';
import ja from '@/locales/ja.json';
import kn from '@/locales/kn.json';
import ko from '@/locales/ko.json';
import mr from '@/locales/mr.json';
import ms from '@/locales/ms.json';
import nl from '@/locales/nl.json';
import pa from '@/locales/pa.json';
import pl from '@/locales/pl.json';
import ptBR from '@/locales/pt-BR.json';
import ptPT from '@/locales/pt-PT.json';
import ro from '@/locales/ro.json';
import ru from '@/locales/ru.json';
import sv from '@/locales/sv.json';
import ta from '@/locales/ta.json';
import te from '@/locales/te.json';
import th from '@/locales/th.json';
import tr from '@/locales/tr.json';
import uk from '@/locales/uk.json';
import ur from '@/locales/ur.json';
import vi from '@/locales/vi.json';
import zhCN from '@/locales/zh-CN.json';
import zhTW from '@/locales/zh-TW.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  ar: { translation: ar },
  bn: { translation: bn },
  cs: { translation: cs },
  de: { translation: de },
  el: { translation: el },
  es: { translation: es },
  fil: { translation: fil },
  gu: { translation: gu },
  he: { translation: he },
  hi: { translation: hi },
  hu: { translation: hu },
  id: { translation: id },
  it: { translation: it },
  ja: { translation: ja },
  kn: { translation: kn },
  ko: { translation: ko },
  mr: { translation: mr },
  ms: { translation: ms },
  nl: { translation: nl },
  pa: { translation: pa },
  pl: { translation: pl },
  'pt-BR': { translation: ptBR },
  'pt-PT': { translation: ptPT },
  ro: { translation: ro },
  ru: { translation: ru },
  sv: { translation: sv },
  ta: { translation: ta },
  te: { translation: te },
  th: { translation: th },
  tr: { translation: tr },
  uk: { translation: uk },
  ur: { translation: ur },
  vi: { translation: vi },
  'zh-CN': { translation: zhCN },
  'zh-TW': { translation: zhTW },
} as const;

export const SUPPORTED_LNGS = [
  'en',
  'fr',
  'ar',
  'bn',
  'cs',
  'de',
  'el',
  'es',
  'fil',
  'gu',
  'he',
  'hi',
  'hu',
  'id',
  'it',
  'ja',
  'kn',
  'ko',
  'mr',
  'ms',
  'nl',
  'pa',
  'pl',
  'pt-BR',
  'pt-PT',
  'ro',
  'ru',
  'sv',
  'ta',
  'te',
  'th',
  'tr',
  'uk',
  'ur',
  'vi',
  'zh-CN',
  'zh-TW',
] as const;

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'en',
      fallbackLng: 'en',
      supportedLngs: [
        'en',
        'fr',
        'ar',
        'bn',
        'cs',
        'de',
        'el',
        'es',
        'fil',
        'gu',
        'he',
        'hi',
        'hu',
        'id',
        'it',
        'ja',
        'kn',
        'ko',
        'mr',
        'ms',
        'nl',
        'pa',
        'pl',
        'pt-BR',
        'pt-PT',
        'ro',
        'ru',
        'sv',
        'ta',
        'te',
        'th',
        'tr',
        'uk',
        'ur',
        'vi',
        'zh-CN',
        'zh-TW',
      ],
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
}

// Ensure language is 'en' on module load / every server request so SSR and
// first client render agree. The `I18nProvider` useEffect swaps to the
// detected browser language after hydration.
if (i18n.language !== 'en') {
  i18n.changeLanguage('en');
}

export default i18n;
