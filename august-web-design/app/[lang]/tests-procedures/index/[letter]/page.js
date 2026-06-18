import { getTestsByLetter } from '@/app/lib/data/tests-procedures';
import translationStrings from '../../language/translations';
import TestsByLetterClient from './TestsByLetterClient';
const logger = require('@/app/utils/logger');

// Enable static generation with revalidation
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
    const data = await getTestsByLetter(letter, lang);
    const decodedLetter = decodeLetter(letter);
    const metaTitle = data?.items?.[0]?.page_indextitle
      ? `${data.items[0].page_indextitle} ${decodedLetter}`
      : langStrings.title;
    return {
      title: metaTitle,
      description: data?.items?.[0]?.page_description || langStrings.title,
      alternates: {
        canonical: `https://www.meetaugust.ai/${lang}/tests-procedures`,
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

export default async function TestsByLetterPage({ params: paramsPromise, searchParams: searchParamsPromise }) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  // Add next/headers for cache control
  const headers = {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
  };
  const letter = params?.letter || '';
  const language = params?.lang || 'en';
  const sourceParam = Array.isArray(searchParams?.source) ? searchParams.source[0] : searchParams?.source;
  const isWebviewSource = sourceParam === 'webview';
  
  // Create a safe version of langStrings without functions
  const rawStrings = translationStrings[language] || translationStrings.en;
  const langStrings = {
    ...rawStrings,
    // Remove the function to avoid serialization issues
    noTestsFound: undefined
  };
  
  const decodedLetter = decodeLetter(letter);

  try {
    // Fetch data server-side
    const data = await getTestsByLetter(letter, language);
    const metaIndexTitle = data?.items?.[0]?.page_indextitle || langStrings.title;
    const metaDescription = data?.items?.[0]?.page_description || langStrings.title;
    
    const tests = (data.items || []).map(item => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
  }));

  const initialData = {
    items: tests,
    pagination: data.pagination
};

    // Pre-compute the noTestsFound message
    const noTestsFoundMessage = rawStrings.noTestsFound(decodedLetter);

    return (
      <TestsByLetterClient
        initialData={initialData}
        tests={tests || []}
        letter={letter}
        decodedLetter={decodedLetter}
        language={language}
        langStrings={langStrings}
        metaIndexTitle={metaIndexTitle}
        metaDescription={metaDescription}
        noTestsFoundMessage={noTestsFoundMessage}
        isWebviewSource={isWebviewSource}
      />
    );
  } catch (error) {
    logger.error('Error in TestsByLetterPage:', error);
    return (
      <TestsByLetterClient
        initialData={{ items: [] }}
        tests={[]}
        letter={letter}
        decodedLetter={decodedLetter}
        language={language}
        langStrings={langStrings}
        metaIndexTitle={langStrings.title}
        metaDescription={langStrings.title}
        noTestsFoundMessage={rawStrings.noTestsFound(decodedLetter)}
        error={error.message}
        isWebviewSource={isWebviewSource}
      />
    );
  }
}
