import { getMentalHealthByLetter } from '@/app/lib/data/mental-health';
import translationStrings from '../../language/translations';
import MentalHealthByLetterClient from './MentalHealthByLetterClient';
const logger = require('@/app/utils/logger');

export const revalidate = 3600;

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
        const data = await getMentalHealthByLetter(letter, lang, 1);
        const decodedLetter = decodeLetter(letter);
        const metaTitle = data?.items?.[0]?.page_indextitle
            ? `${data.items[0].page_indextitle} ${decodedLetter}`
            : langStrings.title;
        return {
            title: metaTitle,
            description: data?.items?.[0]?.page_description || langStrings.title,
            alternates: {
                canonical: `https://www.meetaugust.ai/${lang}/mental-health`,
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

export default async function MentalHealthByLetterPage({ params, searchParams }) {
    const { letter, lang } = await params;
    const { source } = await searchParams;

    const language = lang || 'en';
    const rawStrings = translationStrings[language] || translationStrings.en;
    const decodedLetter = decodeLetter(letter);
    const langStrings = {
        ...rawStrings,
        noMentalHealthFound: typeof rawStrings.noMentalHealthFound === 'function'
            ? rawStrings.noMentalHealthFound(letter)
            : rawStrings.noMentalHealthFound || 'No topics found',
    };
    const sourceParam = Array.isArray(source) ? source[0] : source;
    const isWebviewSource = sourceParam === 'webview';

    try {
        const starttime = Date.now();
        const data = await getMentalHealthByLetter(letter, language, 1);
        const endtime = Date.now();
        logger.info('mental-health index letter page took', endtime - starttime, 'milliseconds');

        const metaIndexTitle = data?.items?.[0]?.page_indextitle || langStrings.title;
        const metaDescription = data?.items?.[0]?.page_description || langStrings.title;

        const items = (data.items || []).map(item => ({
            id: item.id,
            name: item.title,
            slug: item.slug,
            short_description: item.body_html?.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
        }));

        const initialData = {
            items,
            pagination: data.pagination
        };

        return (
            <MentalHealthByLetterClient
                initialData={initialData}
                letter={letter}
                decodedLetter={decodedLetter}
                language={language}
                langStrings={langStrings}
                metaIndexTitle={metaIndexTitle}
                metaDescription={metaDescription}
                isWebviewSource={isWebviewSource}
            />
        );
    } catch (error) {
        logger.error('Error in MentalHealthByLetterPage:', error);
        return (
            <MentalHealthByLetterClient
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
                langStrings={langStrings}
                metaIndexTitle={langStrings.title}
                metaDescription={langStrings.title}
                error={error.message}
                isWebviewSource={isWebviewSource}
            />
        );
    }
}
