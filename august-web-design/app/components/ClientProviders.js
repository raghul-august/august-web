'use client';
import { LanguageStringsProvider } from '../contexts/LanguageStringsContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { useParams } from 'next/navigation';

export default function ClientProviders({ children }) {
  const params = useParams();
  const language = params?.lang || 'en';

  return ( 
      <LanguageProvider initialLanguage={language}>
    <LanguageStringsProvider>
      {children}
    </LanguageStringsProvider>
      </LanguageProvider> 
  );
}
