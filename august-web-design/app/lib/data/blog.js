import { cache } from 'react';
import { query } from '@/app/lib/db';
import languageMap from '@/app/contexts/LanguageMapping';
import { languageIdToCode } from '@/app/contexts/LanguageMapping';

export const getAvailableLanguagesForBlog = cache(async function getAvailableLanguagesForBlog(slug) {
  const result = await query(
    `SELECT DISTINCT language_id
     FROM blogs_translations
     WHERE id = (SELECT id FROM blogs WHERE handle = $1)`,
    [slug]
  );
  const codes = result.rows.map(r => languageIdToCode[r.language_id]).filter(Boolean);
  if (!codes.includes('en')) codes.push('en');
  return codes;
});


export const getBlogBySlug = cache(async function getBlogBySlug(slug, lang = 'en') {
  const languageId = languageMap[lang] || 1;

  const result = await query(
    `SELECT
    bt.record_id,
    b.id,
    CASE WHEN length(coalesce(bt.title, '')) = 0 THEN b.title ELSE bt.title END as title,
    b.handle as slug,
    b.created_at,
    b.updated_at,
    b.published_at,
    b.author,
    b.reviewer_slug,
    a.name as author_name,
    a.slug as author_slug,
    COALESCE(bt.body_html, b.body_html) as body_html,
    COALESCE(bt.summary_html, b.summary_html) as summary_html,
    COALESCE(bt.tags, b.tags) as tags,
    COALESCE(bt.meta_title, b.meta_title) as meta_title,
    COALESCE(bt.meta_description, b.meta_description) as meta_description,
    COALESCE(bt.cta_display_text, b.cta_display_text) as cta_display_text,
    COALESCE(bt.content_schema, b.content_schema) as content_schema,
    bt.question_bank,
    b.question_bank as en_question_bank,
    b.blog_title,
    b.image,
    b.status,
    CASE WHEN bt.record_id IS NOT NULL THEN true ELSE false END as has_translation,
    (SELECT array_agg(DISTINCT hb.component_key) FROM health_library_banners hb LEFT JOIN health_library_banner_assignments hba ON hb.id = hba.banner_id WHERE hb.status = 'active' AND (hba.blog_id = b.id OR hb.audience = 'unconditional')) as banner_keys
FROM
    blogs b
LEFT JOIN
    blogs_translations bt ON b.id = bt.id AND bt.language_id = $2
LEFT JOIN
    health_library_authors a ON b.author_id = a.id
WHERE
    b.handle = $1
LIMIT 1`,
    [slug, languageId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const post = result.rows[0];

  return {
    id: post.id,
    title: post.title,
    meta_title: post.meta_title,
    meta_description: post.meta_description,
    slug: post.slug,
    created_at: post.created_at,
    updated_at: post.updated_at,
    published_at: post.published_at,
    author: post.author,
    body_html: post.body_html,
    summary_html: post.summary_html,
    handle: post.slug,
    tags: post.tags,
    blogTitle: post.blog_title,
    image: post.image,
    reviewer_slug: post.reviewer_slug,
    author_name: post.author_name,
    author_slug: post.author_slug,
    cta_display_text: post.cta_display_text,
    content_schema: post.content_schema,
    status: post.status,
    has_translation: languageId === 1 ? true : post.has_translation,
    bannerKeys: post.banner_keys || [],
    question_bank: (() => {
      const qb = (languageId === 1 ? (post.question_bank || post.en_question_bank) : post.question_bank) || null;
      if (qb && languageId !== 1 && post.en_question_bank?.headingIndexMap) {
        qb.headingIndexMap = post.en_question_bank.headingIndexMap;
      }
      return qb;
    })(),
  };
});

export async function getBlogsByLetter(letter, lang = 'en', page = 1, limit = 20) {
  const languageId = languageMap[lang] || 1;
  const offset = (page - 1) * limit;

  const countResult = await query(
    `SELECT COUNT(*)
FROM blogs b
LEFT JOIN blogs_translations bt ON b.id = bt.id AND bt.language_id = $2
WHERE (CASE WHEN length(coalesce(bt.title, '')) = 0 THEN b.title ELSE bt.title END) ILIKE $1
  AND b.status = 'published'`,
    [`${letter}%`, languageId]
  );
  const totalCount = parseInt(countResult.rows[0].count);

  const result = await query(
    `SELECT
    b.id,
    CASE WHEN length(coalesce(bt.title, '')) = 0 THEN b.title ELSE bt.title END as title,
    b.handle as slug,
    b.created_at,
    b.published_at,
    COALESCE(bt.body_html, b.body_html) as body_html,
    b.blog_title as "blogTitle"
FROM
    blogs b
LEFT JOIN
    blogs_translations bt ON b.id = bt.id AND bt.language_id = $2
WHERE
    (CASE WHEN length(coalesce(bt.title, '')) = 0 THEN b.title ELSE bt.title END) ILIKE $1
    AND b.status = 'published'
ORDER BY
    b.published_at DESC
LIMIT $3 OFFSET $4`,
    [`${letter}%`, languageId, limit, offset]
  );

  const items = result.rows.map(item => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    created_at: item.created_at,
    published_at: item.published_at,
    body_html: item.body_html,
    blogTitle: item.blogTitle
  }));

  return {
    items,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
}
