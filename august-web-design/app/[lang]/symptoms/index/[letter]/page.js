import translationStrings from '../../language/translations';
import SymptomsByLetterClient from './SymptomsByLetterClient';
import { getSymptomsByLetter } from '@/app/lib/data/symptoms';
const logger = require('@/app/utils/logger');

export const revalidate = 3600; // Revalidate every hour

function decodeLetter(letter) {
  try {
    return decodeURIComponent(letter);
  } catch (e) {
    logger.error("Failed to decode URI Component", letter, e);
    return letter;
  }
}

export async function generateMetadata({ params }) {
  const { letter, lang } = await params;
  const langStrings = translationStrings[lang] || translationStrings.en;
  try {
    const data = await getSymptomsByLetter(letter, lang);
    const decodedLetter = decodeLetter(letter);
    const metaTitle = data?.items?.[0]?.page_indextitle
      ? `${data.items[0].page_indextitle} ${decodedLetter}`
      : langStrings.title;
    return {
      title: metaTitle,
      description: data?.items?.[0]?.page_description || langStrings.title,
      alternates: {
        canonical: `https://www.meetaugust.ai/${lang}/symptoms`,
      },
      openGraph: {
        title: metaTitle,
        description: data?.items?.[0]?.page_description || langStrings.title,
      },
      robots: { index: false, follow: true },
    };
  } catch {
    return { title: langStrings.title, robots: { index: false, follow: true } };
  }
}

export default async function SymptomsByLetterPage({ params: paramsPromise, searchParams: searchParamsPromise }) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  // Add next/headers for cache control
  const headers = {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
  };
  const letter = params?.letter || '';
  const language = params?.lang || 'en';
  const decodedLetter = decodeLetter(letter);
  const sourceParam = Array.isArray(searchParams?.source) ? searchParams.source[0] : searchParams?.source;
  const isWebviewSource = sourceParam === 'webview';
  
  // Create a safe version of langStrings without functions
  const rawStrings = translationStrings[language] || translationStrings.en;
  const langStrings = {
    ...rawStrings,
    // Remove the function property
    noSymptomsFound: undefined
  };
  

  try {
    // Fetch data server-side
    const data = await getSymptomsByLetter(letter, language);
    const metaIndexTitle = data?.items?.[0]?.page_indextitle || langStrings.title;
    const metaDescription = data?.items?.[0]?.page_description || langStrings.title;
        
    const symptomsitem = (data.items || []).map(item => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
  }));
    
  const initialData = {
    items: symptomsitem,
    pagination: data.pagination
};
    // Pre-compute the noSymptomsFound message
    const noSymptomsFoundMessage = rawStrings.noSymptomsFound(decodedLetter);

    return (
      <SymptomsByLetterClient
        initialData={initialData}
        symptoms={symptomsitem || []}
        letter={letter}
        decodedLetter={decodedLetter}
        language={language}
        langStrings={langStrings}
        metaIndexTitle={metaIndexTitle}
        metaDescription={metaDescription}
        noSymptomsFoundMessage={noSymptomsFoundMessage}
        isWebviewSource={isWebviewSource}
      />
    );
  } catch (error) {
    logger.error('Error in SymptomsByLetterPage:', error);
    return (
      <SymptomsByLetterClient
      initialData={{ 
        items: [], 
        pagination: { 
            total: 0, 
            page: 1, 
            limit: 20, 
            totalPages: 0 
        } 
    }}
        symptoms={[]}
        letter={letter}
        decodedLetter={decodedLetter}
        language={language}
        langStrings={langStrings}
        metaIndexTitle={langStrings.title}
        metaDescription={langStrings.title}
        noSymptomsFoundMessage={rawStrings.noSymptomsFound(decodedLetter)}
        error={error.message}
        isWebviewSource={isWebviewSource}
      />
    );
  }
}
