import DiseasesByLetterClient from './DiseasesByLetterClient';
import { getConditionsByLetter } from '@/app/lib/data/diseases-conditions';
import { getConditionIndexMetaData } from '@/app/api/diseases-conditions/meta/getMetaDataIndex';
import translationStrings from '../../language/translations';
const logger = require('@/app/utils/logger');

const revalidate = 3600; // Revalidate every hour

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
    const data = await getConditionsByLetter(letter, lang, 1);
    const decodedLetter = decodeLetter(letter);
    const metaTitle = data?.items?.[0]?.page_indextitle
      ? `${data.items[0].page_indextitle} ${decodedLetter}`
      : langStrings.title;
    return {
      title: metaTitle,
      description: data?.items?.[0]?.page_description || langStrings.title,
      alternates: {
        canonical: `https://www.meetaugust.ai/${lang}/diseases-conditions`,
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

export default async function DiseasesByLetterPage({ params: paramsPromise, searchParams: searchParamsPromise }) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const { letter = '', lang: language = 'en' } = params || {};
  const headers = {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
  };
  const sourceParam = Array.isArray(searchParams?.source) ? searchParams.source[0] : searchParams?.source;
  const isWebviewSource = sourceParam === 'webview';
  
  // Create a safe version of langStrings without functions
  const langStrings = {
    ...translationStrings[language] || translationStrings.en,
    // Pre-compute the noConditionsFound string
    noConditionsFoundMessage: translationStrings[language]?.noConditionsFound(letter) || ''
  };

  // Remove the function to avoid serialization issues
  delete langStrings.noConditionsFound;

  try {
    const data = await getConditionsByLetter(letter, language, 1);
    const metaIndexTitle = data?.items?.[0]?.page_indextitle || langStrings.title;
    const metaDescription = data?.items?.[0]?.page_description || langStrings.title;
    
    const conditions = (data.items || []).map(item => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
    }));

    const initialData = {
      items: conditions,
      pagination: data.pagination
    };

    return (
      <DiseasesByLetterClient 
        initialData={initialData}
        letter={letter}
        language={language}
        metaIndexTitle={metaIndexTitle}
        metaDescription={metaDescription}
        langStrings={langStrings}
        isWebviewSource={isWebviewSource}
      />
    );
  } catch (error) {
    logger.error('Error in page:', error);
    return (
      <DiseasesByLetterClient 
        initialData={{ items: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } }}
        letter={letter}
        language={language}
        metaIndexTitle={langStrings.title}
        metaDescription={langStrings.title}
        langStrings={langStrings}
        error={error.message}
        isWebviewSource={isWebviewSource}
      />
    );
  }
}
