import { getBlogsByLetter } from '@/app/lib/data/blog';
import translationStrings from '../../language/translations';
import BlogsByLetterClient from './BlogsByLetterClient';
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
        const data = await getBlogsByLetter(letter, lang, 1);
        const decodedLetter = decodeLetter(letter);
        const metaTitle = data?.items?.[0]?.page_indextitle
            ? `${data.items[0].page_indextitle} ${decodedLetter}`
            : langStrings.blogTitle;
        return {
            title: metaTitle,
            description: data?.items?.[0]?.page_description || langStrings.blogTitle,
            alternates: {
                canonical: `https://www.meetaugust.ai/${lang}/articles`,
            },
            openGraph: {
                title: metaTitle,
                description: data?.items?.[0]?.page_description || langStrings.blogTitle,
            },
            robots: { index: false, follow: true },
        };
    } catch {
        return { title: langStrings.blogTitle, robots: { index: false, follow: true } };
    }
}

export default async function BlogsByLetterPage({ params: paramsPromise, searchParams: searchParamsPromise }) {
    const params = await paramsPromise;
    const searchParams = await searchParamsPromise;
    const letter = params?.letter;
    const lang = params?.lang;
    const headers = {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    };

    const language = lang || 'en';
    const langStrings = translationStrings[language] || translationStrings.en;
    const decodedLetter = decodeLetter(letter);
    const sourceParam = Array.isArray(searchParams?.source) ? searchParams.source[0] : searchParams?.source;
    const isWebviewSource = sourceParam === 'webview';

    try {
        // Fetch data server-side
        const starttime = Date.now();
        const data = await getBlogsByLetter(letter, language, 1);
        logger.info('API response data:', JSON.stringify(data, null, 2));
      
        const endtime = Date.now();
        logger.info('index letter page took', endtime - starttime, 'milliseconds');
        
        // Handle metadata
        const metaIndexTitle = data?.items?.[0]?.page_indextitle || langStrings.blogTitle;
        const metaDescription = data?.items?.[0]?.page_description || langStrings.blogTitle;
        
        // Map the items from the paginated response
        const blogs = (data.items || []).map(item => ({
            id: item.id,
            name: item.title, // Use title from database
            slug: item.slug,
            short_description: item.body_html?.replace(/<[^>]*>/g, '').substring(0, 150) + '...' // Add description from body_html
        }));

        const initialData = {
            items: blogs,
            pagination: data.pagination
        };
        logger.info('Mapped blogs:', JSON.stringify(blogs, null, 2));
        logger.info('Initial data being passed to client:', JSON.stringify(initialData, null, 2));

        return (
            <BlogsByLetterClient
                initialData={initialData}
                letter={letter}
                decodedLetter={decodedLetter}
                language={language}
                langStrings={{
                    ...langStrings,
                    // Remove function to avoid serialization issues
                    // noBlogsFound: undefined,
                    // Pre-compute the message
                    // noBlogsFoundMessage: `No blogs found starting with '${decodedLetter}'`
                }}
                metaIndexTitle={metaIndexTitle}
                metaDescription={metaDescription}
                isWebviewSource={isWebviewSource}
            />
        );
    } catch (error) {
        logger.error('Error in BlogsByLetterPage:', error);
        return (
            <BlogsByLetterClient
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
                    //noBlogsFound: undefined,
                    //noBlogsFoundMessage: `No blogs found starting with '${decodedLetter}'`
                }}
                metaIndexTitle={langStrings.blogTitle}
                metaDescription={langStrings.blogTitle}
                error={error.message}
                isWebviewSource={isWebviewSource}
            />
        );
    }
}
