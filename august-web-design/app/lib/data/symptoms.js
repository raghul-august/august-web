import { cache } from 'react';
import { query } from '@/app/lib/db';
import languageMap from '@/app/contexts/LanguageMapping';
import { languageIdToCode } from '@/app/contexts/LanguageMapping';
import sectionMappings from '@/app/api/symptoms/sectionMappings';

const markdownFields = ['definition', 'causes', 'when_to_see_doctor'];

export const getAvailableLanguagesForSymptom = cache(async function getAvailableLanguagesForSymptom(slug) {
  const result = await query(
    `SELECT DISTINCT language_id FROM symptom_translations_new
     WHERE symptom_id = (SELECT id FROM symptom_new WHERE slug = $1)`,
    [slug]
  );
  const codes = result.rows.map(r => languageIdToCode[r.language_id]).filter(Boolean);
  if (!codes.includes('en')) codes.push('en');
  return codes;
});


export const getSymptomBySlug = cache(async function getSymptomBySlug(slug, lang = 'en') {
  const languageId = languageMap[lang] || 1;

  const result = await query(
    `SELECT
          s.id,
          COALESCE(st.name, s.name) AS name,
          s.slug,
          s.url as s_url,
          s.definition as s_definition,
          s.causes as s_causes,
          s.when_to_see_doctor as s_when_to_see_doctor,
          s.body_html as s_body_html,
          st.definition AS definition,
          st.causes AS causes,
          st.when_to_see_doctor AS when_to_see_doctor,
          CASE WHEN $2::int = 1 THEN s.body_html ELSE st.body_html END AS body_html,
          st.question_bank,
          s.question_bank AS s_question_bank,
          CASE WHEN $2::int = 1 THEN s.meta_title ELSE pst.title END AS meta_title,
          CASE WHEN $2::int = 1 THEN s.meta_description ELSE pst.description END AS meta_description,
          s.created_at,
          s.image,
          s.status,
          CASE WHEN st.symptom_id IS NOT NULL THEN true ELSE false END as has_translation,
          (SELECT array_agg(DISTINCT hb.component_key) FROM health_library_banners hb LEFT JOIN health_library_banner_assignments hba ON hb.id = hba.banner_id WHERE hb.status = 'active' AND (hba.symptom_id = s.id OR hb.audience = 'unconditional')) as banner_keys
     FROM
          symptom_new s
      LEFT JOIN
          symptom_translations_new st ON s.id = st.symptom_id AND st.language_id = $2
      LEFT JOIN
          symptom_meta_tags pst ON s.id = pst.symptom_id AND pst.language_id = $2
      WHERE
          s.slug = $1`,
    [slug, languageId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const symptom = result.rows[0];
  const sections = markdownFields
    .filter(field => {
      const translatedContent = symptom[field];
      const englishContent = symptom[`s_${field}`];
      return (translatedContent || englishContent) && (translatedContent !== 'NaN' && translatedContent !== null && translatedContent !== undefined) || (englishContent !== 'NaN' && englishContent !== null && englishContent !== undefined);
    })
    .map(field => ({
      heading: sectionMappings[lang][field],
      content: symptom[field] || symptom[`s_${field}`]
    }));

  return {
    id: symptom.id,
    name: symptom.name,
    slug: symptom.slug,
    url: symptom.s_url,
    sections: sections,
    body_html: symptom.body_html,
    meta_description: symptom.meta_description,
    image: symptom.image,
    question_bank: (() => {
      const qb = (languageId === 1 ? symptom.s_question_bank : symptom.question_bank) || null;
      if (qb && languageId !== 1 && symptom.s_question_bank?.headingIndexMap) {
        qb.headingIndexMap = symptom.s_question_bank.headingIndexMap;
      }
      return qb;
    })(),
    status: symptom.status,
    has_translation: languageId === 1 ? true : symptom.has_translation,
    meta: {
      created_at: symptom.created_at
    },
    bannerKeys: symptom.banner_keys || [],
  };
});

export async function getSymptomsByLetter(letter, lang = 'en', page = 1, limit = 20) {
  const languageId = languageMap[lang] || 1;
  const offset = (page - 1) * limit;

  const result = await query(
    `WITH data AS (
      SELECT s.id,
      COALESCE(st.name, s.name) AS name,
      s.definition,
      s.slug,
      pst.title AS page_title,
      pst.description AS page_description,
      pst.indextitle AS page_indextitle,
      COUNT(*) OVER() AS total_count
      FROM symptom_new s
      LEFT JOIN symptom_translations_new st ON s.id = st.symptom_id AND st.language_id = $2
      LEFT JOIN symptoms_page_meta_tags pst ON pst.language_id = $2
      WHERE COALESCE(st.first_letter, s.first_letter) = UPPER($1)
        AND s.status = 'published'
      ORDER BY COALESCE(st.name, s.name) ASC
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
