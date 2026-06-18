import { notFound, redirect } from 'next/navigation';
import { getBlogPostBySlug, getAllBlogPosts } from '@/app/lib/data/blog-posts';
import BlogPostView from './BlogPostView';
const logger = require('@/app/utils/logger');

const BASE_URL = 'https://www.meetaugust.ai';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const post = await getBlogPostBySlug(slug);
    if (!post) {
      return { title: 'Blog Post Not Found' };
    }

    const metaTitle = post.meta_title || post.title;
    const metaDescription = post.meta_description || post.summary_html?.replace(/<[^>]*>/g, '').substring(0, 160) || '';
    const canonical = `/blog/${slug}`;
    const images = post.image ? [{ url: post.image }] : undefined;

    return {
      title: metaTitle,
      description: metaDescription,
      alternates: { canonical },
      openGraph: {
        type: 'article',
        url: `${BASE_URL}${canonical}`,
        title: metaTitle,
        description: metaDescription,
        images,
        publishedTime: post.published_at || undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        images: post.image ? [post.image] : undefined,
      },
    };
  } catch (error) {
    logger.error('Error generating blog post metadata:', error);
    return { title: 'Blog' };
  }
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const startTime = Date.now();

  try {
    const post = await getBlogPostBySlug(slug);

    if (!post) {
      notFound();
    }

    // Linked posts don't render in-app — send the visitor to the link.
    if (post.link) {
      redirect(post.link);
    }

    // Related: other published posts in the same category.
    const all = await getAllBlogPosts();
    const group = all[post.category] || { featured: null, articles: [] };
    const related = [group.featured, ...group.articles]
      .filter(Boolean)
      .filter((p) => p.slug !== slug)
      .slice(0, 2);

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
        { '@type': 'ListItem', position: 3, name: post.title },
      ],
    };

    return (
      <>
        {post.content_schema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(post.content_schema) }}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
        />
        <BlogPostView post={post} related={related} />
      </>
    );
  } catch (error) {
    if (error.digest) throw error;
    logger.error('Error in BlogPostPage:', error);
    notFound();
  } finally {
    logger.info(`BlogPostPage took ${Date.now() - startTime}ms`);
  }
}
