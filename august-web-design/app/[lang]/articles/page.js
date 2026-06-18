import PageLayoutClient from '@/app/components/PageLayoutClient';
import translationStrings from './language/translations';
import { getBlogIndexMetaData } from '@/app/api/articles/meta/getMetaDataIndex';
import { getFeaturedBlogs } from '@/app/api/articles/meta/getFeaturedBlogs';
import { generateMetadataAlternates } from '@/app/utils/hreflang';
const logger = require('@/app/utils/logger');

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const langStrings = translationStrings[lang] || translationStrings.en;
  try {
    const metadata = await getBlogIndexMetaData(lang);
    return {
      title: metadata?.title || langStrings.blogTitle,
      description: metadata?.description || langStrings.blogTitle,
      alternates: generateMetadataAlternates(lang, '/articles'),
    };
  } catch {
    return {
      title: langStrings.blogTitle,
      alternates: generateMetadataAlternates(lang, '/articles'),
    };
  }
}

export default async function BlogPage({ params: paramsPromise, searchParams: searchParamsPromise }) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const language = params?.lang || 'en';
  const langStrings = translationStrings[language] || translationStrings.en;
  const source = searchParams?.source;
  const isWebviewSource = source === 'webview';

  // Fetch metadata server-side
  let metaTitle = langStrings.blogTitle || '';
  let metaDescription = langStrings.blogTitle || '';

  try {
    const metadata = await getBlogIndexMetaData(language);
    if (metadata) {
      metaTitle = metadata.title || langStrings.blogTitle;
      metaDescription = metadata.description || langStrings.blogTitle;
    } else {
      logger.warn(`No home page SEO tags found in DB for language: ${language}`);
    }
  } catch (error) {
    logger.error("Error fetching home metadata:", error);
    // Default values already set above
  }

  const heroProps = {
    title: langStrings.blogTitle,
    description: langStrings.blogDescription,
    searchPlaceholder: langStrings.blogSearchPlaceholder,
    browseByLetterText: langStrings.browseByLetter,
    baseUrl: `/${language}/articles`,
    indices: {
      health_library: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'Health_Library',
    },
    tags: ['blogs']
  };

  // Fetch featured blogs from database
  let featuredBlogsData = {
    title: langStrings.featuredBlogsTitle,
    description: langStrings.featuredBlogsDescription,
    items: []
  };

  try {
    const featuredBlogs = await getFeaturedBlogs(language);
    featuredBlogsData.items = featuredBlogs;
  } catch (error) {
    logger.error('Error fetching featured blogs:', error);
  }

  return (
    <PageLayoutClient
      heroProps={heroProps}
      categoryData={featuredBlogsData}
      metaTitle={metaTitle}
      metaDescription={metaDescription}
      isWebviewSource={isWebviewSource}
      hideFooter={isWebviewSource}
    />
  );
}
