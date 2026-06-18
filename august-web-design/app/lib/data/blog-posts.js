import { cache } from 'react';
import { query } from '@/app/lib/db';

export const getBlogPostBySlug = cache(async function getBlogPostBySlug(slug) {
  const result = await query(
    `SELECT
      bp.id,
      bp.handle AS slug,
      bp.title,
      bp.body_html,
      bp.summary_html,
      bp.image,
      bp.meta_title,
      bp.meta_description,
      bp.content_schema,
      bp.category,
      bp.link,
      bp.updated_at
    FROM blog_posts bp
    WHERE bp.handle = $1 AND bp.status = 'published'
    LIMIT 1`,
    [slug]
  );

  if (result.rows.length === 0) return null;

  const post = result.rows[0];
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    body_html: post.body_html,
    summary_html: post.summary_html,
    image: post.image,
    meta_title: post.meta_title,
    meta_description: post.meta_description,
    content_schema: post.content_schema,
    category: post.category,
    link: post.link,
    published_at: post.updated_at, // published_at dropped; alias updated_at for display
  };
});

export const getAllBlogPosts = cache(async function getAllBlogPosts() {
  const result = await query(
    `SELECT
      bp.id,
      bp.handle AS slug,
      bp.title,
      bp.summary_html,
      bp.image,
      bp.category,
      bp.is_featured,
      bp.link,
      bp.updated_at
    FROM blog_posts bp
    WHERE bp.status = 'published'
    ORDER BY bp.is_featured DESC, bp.updated_at DESC`,
    []
  );

  const grouped = {};
  const all = { featured: null, articles: [] }; // All tab: most recent featured as hero, rest in grid
  for (const row of result.rows) {
    if (!grouped[row.category]) {
      grouped[row.category] = { featured: null, articles: [] };
    }
    const item = {
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.summary_html
        ? row.summary_html.replace(/<[^>]*>/g, '').substring(0, 200)
        : '',
      image: row.image,
      category: row.category,
      link: row.link,
      published_at: row.updated_at, // published_at dropped; alias updated_at for display
    };
    if (row.is_featured) {
      grouped[row.category].featured = item;
    } else {
      grouped[row.category].articles.push(item);
    }
    // All tab: first featured row (most recent) is the hero; everything else goes to the grid
    if (!all.featured && row.is_featured) {
      all.featured = item;
    } else {
      all.articles.push(item);
    }
  }

  grouped.All = all;
  return grouped;
});

export const getCategories = cache(async function getCategories() {
  const result = await query(
    `SELECT DISTINCT category FROM blog_posts WHERE status = 'published' ORDER BY category`,
    []
  );
  return result.rows.map(r => r.category);
});
