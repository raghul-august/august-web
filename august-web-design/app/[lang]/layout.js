import { LanguageProvider } from '../contexts/LanguageContext';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { languages, defaultLanguage } from '../lib/i18n/config';
import { redirect } from 'next/navigation';
import { getRedirectPath } from '@/app/utils/getRedirectPath';
import MUIProviders from '../components/MUIProviders';

export async function generateStaticParams() {
  return Object.keys(languages).map((lang) => ({ lang }));
}

export const metadata = {
  metadataBase: new URL('https://www.meetaugust.ai'),
};

export default async function LocaleLayout({ children, params }) {
  // Await and destructure lang from params
  const { lang } = await params;

  // Validate language code
  if (!languages[lang]) {
    redirect(`/${defaultLanguage}/library`);
  }

  return (
    <LanguageProvider initialLanguage={lang}>
      <MUIProviders>
        <LoadingSpinner />
        {children}
      </MUIProviders>
    </LanguageProvider>
  );
}
