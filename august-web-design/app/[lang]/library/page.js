import { getHomeMetaData } from '@/app/api/languages/getMetaData';
import { getFeaturedBlogs } from '@/app/api/articles/meta/getFeaturedBlogs';
import HomeClient from './HomeClient';
const logger = require('@/app/utils/logger');

export async function generateMetadata({ params }) {
  const { lang } = await params;
  try {
    const metadata = await getHomeMetaData(lang);
    return {
      title: metadata?.title || 'August Health Library',
      description: metadata?.description || 'August Health Library',
      alternates: {
        canonical: `https://www.meetaugust.ai/${lang}/library`,
      },
      openGraph: {
        title: metadata?.title || 'August Health Library',
        description: metadata?.description || 'August Health Library',
      },
    };
  } catch {
    return { title: 'August Health Library' };
  }
}

export default async function Home({ params, searchParams }) {
  const { lang } = await params;
  const { source } = await searchParams;
  const language = lang || 'en';
  const isWebviewSource = source === 'webview';

  try {
    // Fetch metadata server-side
    let metadata = null;
    try {
      metadata = await getHomeMetaData(language);
    } catch (error) {
      logger.error("Error fetching home metadata:", error);
    }

    // Fetch featured blogs
    const featuredBlogs = await getFeaturedBlogs(language, 4);

    const categories = [
      {
        key: 'medications',
        href: `/${language}/medications`,
      },
      {
        key: 'tests',
        href: `/${language}/tests-procedures`,
      },
      {
        key: 'diseases',
        href: `/${language}/diseases-conditions`,
      },
      {
        key: 'symptoms',
        href: `/${language}/symptoms`,
      },
      {
        key: 'mentalHealth',
        href: `/${language}/mental-health`,
      },
      {
        key: 'preventionWellness',
        href: `/${language}/prevention-wellness`,
      }
    ];

    return (
      <HomeClient
        language={language}
        categories={categories}
        initialMetadata={metadata}
        featuredBlogs={featuredBlogs}
        isWebviewSource={isWebviewSource}
      />
    );
  } catch (error) {
    logger.error('Error in Home:', error);
    return (
      <HomeClient
        language={language}
        categories={[]}
        featuredBlogs={[]}
        error={error.message}
        isWebviewSource={isWebviewSource}
      />
    );
  }
}
