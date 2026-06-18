import { getMedicationsByLetter } from '@/app/lib/data/medications';
import translationStrings from '../../language/translations';
import MedicationsByLetterClient from './MedicationsByLetterClient';
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
        const data = await getMedicationsByLetter(letter, lang, 1);
        const decodedLetter = decodeLetter(letter);
        const metaTitle = data?.items?.[0]?.page_indextitle
            ? `${data.items[0].page_indextitle} ${decodedLetter}`
            : langStrings.medicationsTitle;
        return {
            title: metaTitle,
            description: data?.items?.[0]?.page_description || langStrings.medicationsTitle,
            alternates: {
                canonical: `https://www.meetaugust.ai/${lang}/medications`,
            },
            openGraph: {
                title: metaTitle,
                description: data?.items?.[0]?.page_description || langStrings.medicationsTitle,
            },
            robots: { index: false, follow: true },
        };
    } catch {
        return { title: langStrings.medicationsTitle, robots: { index: false, follow: true } };
    }
}

export default async function MedicationsByLetterPage({ params: paramsPromise, searchParams: searchParamsPromise }) {
    const params = await paramsPromise;
    const searchParams = await searchParamsPromise;
    const headers = {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
      };

    const letter = params?.letter || '';
    const language = params?.lang || 'en';
    const langStrings = translationStrings[language] || translationStrings.en;
    const decodedLetter = decodeLetter(letter);
    const sourceParam = Array.isArray(searchParams?.source) ? searchParams.source[0] : searchParams?.source;
    const isWebviewSource = sourceParam === 'webview';

    try {
        // Fetch data server-side
        const starttime = Date.now();
        const data = await getMedicationsByLetter(letter, language, 1);
      
        const endtime = Date.now();
        logger.info('index letter page took', endtime - starttime, 'milliseconds');
        // Handle metadata
        const metaIndexTitle = data?.items?.[0]?.page_indextitle || langStrings.medicationsTitle;
        const metaDescription = data?.items?.[0]?.page_description || langStrings.medicationsTitle;
        
        // Map the items from the paginated response
        const medications = (data.items || []).map(item => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
        }));

        const initialData = {
            items: medications,
            pagination: data.pagination
        };
        return (
            <MedicationsByLetterClient
                initialData={initialData}
                letter={letter}
                decodedLetter={decodedLetter}
                language={language}
                langStrings={{
                    ...langStrings,
                    // Remove function to avoid serialization issues
                    noMedicationsFound: undefined,
                    // Pre-compute the message
                    noMedicationsFoundMessage: langStrings.noMedicationsFound(decodedLetter)
                }}
                metaIndexTitle={metaIndexTitle}
                metaDescription={metaDescription}
                isWebviewSource={isWebviewSource}
            />
        );
    } catch (error) {
        logger.error('Error in MedicationsByLetterPage:', error);
        return (
            <MedicationsByLetterClient
                initialData={{ 
                    items: [], 
                    pagination: { 
                        total: 0, 
                        page: 1, 
                        limit: 20, 
                        totalPages: 0 
                    } 
                }}
                letter={letter}
                decodedLetter={decodedLetter}
                language={language}
                langStrings={{
                    ...langStrings,
                    noMedicationsFound: undefined,
                    noMedicationsFoundMessage: langStrings.noMedicationsFound(decodedLetter)
                }}
                metaIndexTitle={langStrings.medicationsTitle}
                metaDescription={langStrings.medicationsTitle}
                error={error.message}
                isWebviewSource={isWebviewSource}
            />
        );
    }
}
