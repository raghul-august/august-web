import { cache } from 'react';
import { query } from '@/app/lib/db';
import languageMap from '@/app/contexts/LanguageMapping';
import { languageIdToCode } from '@/app/contexts/LanguageMapping';
export const getAvailableLanguagesForPreventionWellness = cache(async function getAvailableLanguagesForPreventionWellness(handle) {
  const result = await query(
    `SELECT DISTINCT language_id
     FROM prevention_wellness_translations_new
     WHERE prevention_wellness_id = (SELECT id FROM prevention_wellness_new WHERE handle = $1)`,
    [handle]
  );
  const codes = result.rows.map(r => languageIdToCode[r.language_id]).filter(Boolean);
  if (!codes.includes('en')) codes.push('en');
  return codes;
});


export const getPreventionWellnessBySlug = cache(async function getPreventionWellnessBySlug(slug, lang = 'en') {
  const languageId = languageMap[lang] || 1;

  const result = await query(
    `SELECT
    mt.prevention_wellness_id,
    m.id,
    CASE WHEN length(coalesce(mt.title, '')) = 0 THEN m.title ELSE mt.title END as title,
    m.handle as slug,
    m.created_at,
    m.updated_at,
    m.published_at,
    m.author,
    m.reviewer_slug,
    a.name as author_name,
    a.slug as author_slug,
    COALESCE(mt.body_html, m.body_html) as body_html,
    COALESCE(mt.summary_html, m.summary_html) as summary_html,
    COALESCE(mt.tags, m.tags) as tags,
    COALESCE(mt.meta_title, m.meta_title) as meta_title,
    COALESCE(mt.meta_description, m.meta_description) as meta_description,
    COALESCE(mt.cta_display_text, m.cta_display_text) as cta_display_text,
    COALESCE(mt.content_schema, m.content_schema) as content_schema,
    mt.question_bank,
    m.question_bank as en_question_bank,
    m.blog_title,
    m.image,
    m.status,
    CASE WHEN mt.prevention_wellness_id IS NOT NULL THEN true ELSE false END as has_translation,
    (SELECT array_agg(DISTINCT hb.component_key) FROM health_library_banners hb LEFT JOIN health_library_banner_assignments hba ON hb.id = hba.banner_id WHERE hb.status = 'active' AND (hba.prevention_wellness_id = m.id OR hb.audience = 'unconditional')) as banner_keys
FROM
    prevention_wellness_new m
LEFT JOIN
    prevention_wellness_translations_new mt ON m.id = mt.prevention_wellness_id AND mt.language_id = $2
LEFT JOIN
    health_library_authors a ON m.author_id = a.id
WHERE
    m.handle = $1
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
    question_bank: (() => {
      const qb = (languageId === 1 ? (post.question_bank || post.en_question_bank) : post.question_bank) || null;
      if (qb && languageId !== 1 && post.en_question_bank?.headingIndexMap) {
        qb.headingIndexMap = post.en_question_bank.headingIndexMap;
      }
      return qb;
    })(),
    bannerKeys: post.banner_keys || [],
  };
});

export async function getPreventionWellnessByLetter(letter, lang = 'en', page = 1, limit = 20) {
  const languageId = languageMap[lang] || 1;
  const offset = (page - 1) * limit;

  const countResult = await query(
    `SELECT COUNT(*)
FROM prevention_wellness_new m
LEFT JOIN prevention_wellness_translations_new mt ON m.id = mt.prevention_wellness_id AND mt.language_id = $2
WHERE (CASE WHEN length(coalesce(mt.title, '')) = 0 THEN m.title ELSE mt.title END) ILIKE $1
  AND m.status = 'published'`,
    [`${letter}%`, languageId]
  );
  const totalCount = parseInt(countResult.rows[0].count);

  const result = await query(
    `SELECT
    m.id,
    CASE WHEN length(coalesce(mt.title, '')) = 0 THEN m.title ELSE mt.title END as title,
    m.handle as slug,
    m.created_at,
    m.published_at,
    COALESCE(mt.body_html, m.body_html) as body_html,
    m.blog_title as "blogTitle"
FROM
    prevention_wellness_new m
LEFT JOIN
    prevention_wellness_translations_new mt ON m.id = mt.prevention_wellness_id AND mt.language_id = $2
WHERE
    (CASE WHEN length(coalesce(mt.title, '')) = 0 THEN m.title ELSE mt.title END) ILIKE $1
    AND m.status = 'published'
ORDER BY
    m.published_at DESC
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
