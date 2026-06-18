import { cache } from 'react';
import { query } from '@/app/lib/db';
import languageMap from '@/app/contexts/LanguageMapping';
import { languageIdToCode } from '@/app/contexts/LanguageMapping';
import sectionMappings from '@/app/api/tests-procedures/sectionMappings';

const markdownFields = ['overview', 'why_its_done', 'risks', 'how_to_prepare', 'what_to_expect', 'results'];

export const getAvailableLanguagesForTest = cache(async function getAvailableLanguagesForTest(slug) {
  const result = await query(
    `SELECT DISTINCT language_id FROM test_procedures_translations_new
     WHERE procedure_id = (SELECT id FROM test_procedures_new WHERE slug = $1)`,
    [slug]
  );
  const codes = result.rows.map(r => languageIdToCode[r.language_id]).filter(Boolean);
  if (!codes.includes('en')) codes.push('en');
  return codes;
});


export const getTestBySlug = cache(async function getTestBySlug(slug, lang = 'en') {
  const languageId = languageMap[lang] || 1;
  const sectionMap = sectionMappings[lang] || sectionMappings.en;

  const result = await query(
    `SELECT
          tp.id,
          COALESCE(tpt.name, tp.name) AS name,
          tp.slug,
          tp.overview as tp_overview,
          tp.why_its_done as tp_why_its_done,
          tp.risks as tp_risks,
          tp.how_to_prepare as tp_how_to_prepare,
          tp.what_to_expect as tp_what_to_expect,
          tp.results as tp_results,
          tp.body_html as tp_body_html,
          tpt.overview AS overview,
          tpt.why_its_done AS why_its_done,
          tpt.risks AS risks,
          tpt.how_to_prepare AS how_to_prepare,
          tpt.what_to_expect AS what_to_expect,
          tpt.results AS results,
          CASE WHEN $2::int = 1 THEN tp.body_html ELSE tpt.body_html END AS body_html,
          tpt.question_bank,
          tp.question_bank AS tp_question_bank,
          CASE WHEN $2::int = 1 THEN tp.meta_title ELSE ttpt.title END AS meta_title,
          CASE WHEN $2::int = 1 THEN tp.meta_description ELSE ttpt.description END AS meta_description,
          tp.created_at,
          tp.image,
          tp.status,
          CASE WHEN tpt.procedure_id IS NOT NULL THEN true ELSE false END as has_translation,
          (SELECT array_agg(DISTINCT hb.component_key) FROM health_library_banners hb LEFT JOIN health_library_banner_assignments hba ON hb.id = hba.banner_id WHERE hb.status = 'active' AND (hba.test_procedure_id = tp.id OR hb.audience = 'unconditional')) as banner_keys
      FROM
          test_procedures_new tp
      LEFT JOIN
          test_procedures_translations_new tpt ON tp.id = tpt.procedure_id AND tpt.language_id = $2
      LEFT JOIN
          procedures_meta_tags ttpt ON tp.id = ttpt.procedure_id AND ttpt.language_id = $2
      WHERE
          tp.slug = $1`,
    [slug, languageId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const test = result.rows[0];
  const sections = markdownFields
    .filter(field => {
      const translatedContent = test[field];
      const englishContent = test[`tp_${field}`];
      return (translatedContent || englishContent) && (translatedContent !== 'NaN' && translatedContent !== null && translatedContent !== undefined) || (englishContent !== 'NaN' && englishContent !== null && englishContent !== undefined);
    })
    .map(field => ({
      heading: sectionMap?.[field] || sectionMappings.en[field] || field,
      content: test[field] || test[`tp_${field}`]
    }));

  return {
    id: test.id,
    name: test.name,
    slug: test.slug,
    sections: sections,
    body_html: test.body_html,
    meta_description: test.meta_description,
    image: test.image,
    question_bank: (() => {
      const qb = (languageId === 1 ? test.tp_question_bank : test.question_bank) || null;
      if (qb && languageId !== 1 && test.tp_question_bank?.headingIndexMap) {
        qb.headingIndexMap = test.tp_question_bank.headingIndexMap;
      }
      return qb;
    })(),
    status: test.status,
    has_translation: languageId === 1 ? true : test.has_translation,
    meta: {
      created_at: test.created_at
    },
    bannerKeys: test.banner_keys || [],
  };
});

export async function getTestsByLetter(letter, lang = 'en', page = 1, limit = 20) {
  const languageId = languageMap[lang] || 1;
  const offset = (page - 1) * limit;

  const result = await query(
    `WITH data AS (
      SELECT tp.id,
        COALESCE(tpt.name, tp.name) AS name,
        tp.slug,
        ttpt.title AS page_title,
        ttpt.description AS page_description,
        ttpt.indextitle AS page_indextitle,
        COUNT(*) OVER() as total_count
      FROM test_procedures_new tp
      LEFT JOIN test_procedures_translations_new tpt ON tp.id = tpt.procedure_id AND tpt.language_id = $2
      LEFT JOIN procedures_page_meta_tags ttpt ON ttpt.language_id = $2
      WHERE COALESCE(tpt.first_letter, tp.first_letter) = UPPER($1)
        AND tp.status = 'published'
      ORDER BY COALESCE(tpt.name, tp.name) ASC
      LIMIT $3 OFFSET $4
    )
    SELECT *, (SELECT COALESCE(MAX(total_count), 0) FROM data) as total FROM data`,
    [letter, languageId, limit, offset]
  );

  const totalCount = result.rows[0]?.total || 0;
  return {
    items: result.rows,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
}
