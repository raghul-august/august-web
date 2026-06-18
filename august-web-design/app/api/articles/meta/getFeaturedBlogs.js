import { query } from '@/app/lib/db';
import languageMap from '@/app/contexts/LanguageMapping';
const logger = require('../../../utils/logger');

export async function getFeaturedBlogs(language, limit = 8) {
  try {

    const languageId = languageMap[language] || 1;

    const result = await query(
      `SELECT
    b.id,
    CASE WHEN length(coalesce(bt.title, '')) = 0 THEN b.title ELSE bt.title END as title,
    b.handle as slug,
    COALESCE(bt.body_html, b.body_html) as body_html,
    b.published_at,
    b.blog_title as "blogTitle"
FROM
    blogs b
LEFT JOIN
    blogs_translations bt ON b.id = bt.id AND bt.language_id = $1
WHERE
    b.status = 'published'
ORDER BY
    b.published_at DESC
LIMIT $2`,
      [languageId, limit]
    );

    return result.rows.map(blog => ({
      title: blog.title,
      description: blog.body_html.replace(/<[^>]*>/g, '').substring(0, 150) + '...', // Strip HTML and limit to 150 chars
      href: `/${language}/articles/${blog.slug}`
    }));
  } catch (error) {
    logger.error('Error fetching featured blogs:', error);
    return [];
  }
}
