import { notFound } from 'next/navigation';
import { getFeaturedBlogs } from '@/app/api/articles/meta/getFeaturedBlogs';
import { getBlogBySlug, getAvailableLanguagesForBlog } from '@/app/lib/data/blog';
import translationStrings from '../language/translations';
import BlogViewClient from './BlogViewClient';
import { generateMetadataAlternates } from '@/app/utils/hreflang';
import { applyArticleStatusChecks, applyMetadataStatusChecks } from '@/app/utils/articleStatus';
const logger = require('@/app/utils/logger');

export const revalidate = 3600;

export async function generateMetadata({ params }) {
    const { slug, lang } = await params;
    const language = lang || 'en';
    const path = `/articles/${slug}`;
    try {
        const [blogPost, availableLanguages] = await Promise.all([
            getBlogBySlug(slug, language),
            getAvailableLanguagesForBlog(slug),
        ]);
        if (!blogPost) {
            return {
                title: 'Default Title',
                description: 'Default Description',
                alternates: generateMetadataAlternates(language, path, availableLanguages),
            };
        }

        const statusMeta = applyMetadataStatusChecks(blogPost, language, 'blog', slug);
        if (statusMeta) return { ...statusMeta, alternates: generateMetadataAlternates(language, path, availableLanguages) };

        const { title, meta_title, meta_description } = blogPost;
        const metaTitle = meta_title || title || 'Default Title';
        const metaDescription = meta_description || title || 'Default Description';

        return {
            title: metaTitle,
            description: metaDescription,
            openGraph: {
                title: metaTitle,
                description: metaDescription,
            },
            alternates: generateMetadataAlternates(language, path, availableLanguages),
        };
    } catch (error) {
        return {
            title: 'Default Title',
            description: 'Default Description',
            alternates: generateMetadataAlternates(language, path),
        };
    }
}

export default async function BlogPage({ params }) {
    const { slug, lang } = await params;
    const language = lang || 'en';
    const startTime = Date.now();

    // Get language strings
    const rawStrings = translationStrings[language] || translationStrings.en;
    const langStrings = {
        ...rawStrings,
        home: rawStrings.home || 'Home',
        blogTitle: rawStrings.blogTitle || 'Blog',
        noBlogsFound: rawStrings.noBlogsFound || 'Blog post not found'
    };

    try {
        // Fetch blog post data and featured blogs in parallel
        const [blogPost, featuredBlogs] = await Promise.all([
            getBlogBySlug(slug, language),
            getFeaturedBlogs(language),
        ]);

        if (!blogPost) {
            notFound();
        }

        applyArticleStatusChecks(blogPost, language, 'blog', slug);

        // Ensure we only pass the necessary data to the client component
        const serializedFeaturedBlogs = JSON.parse(JSON.stringify(featuredBlogs || []));

        const { title, meta_title, meta_description } = blogPost;

        // Use the fetched meta data, or fall back to blog title if meta data is missing
        const metaTitle = meta_title || title || 'Default Title';
        const metaDescription = meta_description || title || 'Default Description';

        const breadcrumbItems = [
            { text: langStrings.home, href: `/${language}/library` },
            { text: langStrings.blogTitle, href: `/${language}/articles` },
            { text: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }
        ];

        const component = (
            <BlogViewClient
                featuredBlogs={serializedFeaturedBlogs}
                currentSlug={slug}
                blogPost={blogPost}
                language={language}
                langStrings={langStrings}
                metaTitle={metaTitle}
                metaDescription={metaDescription}
                isLoading={false}
                breadcrumbItems={breadcrumbItems}
                questionBank={blogPost?.question_bank || null}
            />
        );

        return component;
    } catch (error) {
        if (error.digest) throw error;
        logger.error('Error in BlogPage:', error);

        return (
            <BlogViewClient
                error={error.message}
                language={language}
                langStrings={langStrings}
                isLoading={false}
            />
        );
    } finally {
        const endTime = Date.now();
        logger.info(`BlogPage took ${endTime - startTime}ms`);
    }
}
