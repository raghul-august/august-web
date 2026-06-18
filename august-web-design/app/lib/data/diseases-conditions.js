import { cache } from 'react';
import { query } from '@/app/lib/db';
import languageMap from '@/app/contexts/LanguageMapping';
import { languageIdToCode } from '@/app/contexts/LanguageMapping';

export const getAvailableLanguagesForCondition = cache(async function getAvailableLanguagesForCondition(slug) {
  const result = await query(
    `SELECT DISTINCT language_id FROM condition_translations_new
     WHERE condition_id = (SELECT id FROM condition_new WHERE slug = $1)`,
    [slug]
  );
  const codes = result.rows.map(r => languageIdToCode[r.language_id]).filter(Boolean);
  if (!codes.includes('en')) codes.push('en');
  return codes;
});


export const getConditionBySlug = cache(async function getConditionBySlug(slug, lang = 'en') {
  const languageId = languageMap[lang] || 1;

  const result = await query(
    `SELECT
        c.id,
        COALESCE(ct.name, c.name) AS name,
        c.slug,
        c.body_html AS c_body_html,
        c.overview AS c_overview,
        c.symptoms AS c_symptoms,
        c.when_to_see_doctor AS c_when_to_see_doctor,
        c.causes AS c_causes,
        c.risk_factors AS c_risk_factors,
        c.complications AS c_complications,
        c.prevention AS c_prevention,
        c.diagnosis AS c_diagnosis,
        c.treatment AS c_treatment,
        c.self_care AS c_self_care,
        c.preparing_for_your_appointment AS c_preparing_for_your_appointment,
        CASE WHEN $2::int = 1 THEN c.body_html ELSE ct.body_html END AS body_html,
        ct.overview AS overview,
        ct.symptoms AS symptoms,
        ct.when_to_see_doctor AS when_to_see_doctor,
        ct.causes AS causes,
        ct.risk_factors AS risk_factors,
        ct.complications AS complications,
        ct.prevention AS prevention,
        ct.diagnosis AS diagnosis,
        ct.treatment AS treatment,
        ct.self_care AS self_care,
        ct.preparing_for_your_appointment AS preparing_for_your_appointment,
        ct.question_bank,
        c.question_bank AS c_question_bank,
        c.created_at,
        c.updated_at,
        CASE WHEN $2::int = 1 THEN c.meta_title ELSE cct.title END AS meta_title,
        CASE WHEN $2::int = 1 THEN c.meta_description ELSE cct.description END AS meta_description,
        c.image,
        c.status,
        CASE WHEN ct.condition_id IS NOT NULL THEN true ELSE false END as has_translation,
        (SELECT array_agg(DISTINCT hb.component_key) FROM health_library_banners hb LEFT JOIN health_library_banner_assignments hba ON hb.id = hba.banner_id WHERE hb.status = 'active' AND (hba.condition_id = c.id OR hb.audience = 'unconditional')) as banner_keys
    FROM
        condition_new c
        LEFT JOIN condition_translations_new ct ON c.id = ct.condition_id AND ct.language_id = $2
        LEFT JOIN condition_meta_tags cct ON c.id = cct.condition_id AND cct.language_id = $2
    WHERE
        c.slug = $1`,
    [slug, languageId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const condition = result.rows[0];
  return {
    id: condition.id,
    name: condition.name,
    slug: condition.slug,
    url: condition.url,
    sections: condition.body_html,
    meta_description: condition.meta_description,
    image: condition.image,
    question_bank: (() => {
      const qb = (languageId === 1 ? condition.c_question_bank : condition.question_bank) || null;
      if (qb && languageId !== 1 && condition.c_question_bank?.headingIndexMap) {
        qb.headingIndexMap = condition.c_question_bank.headingIndexMap;
      }
      return qb;
    })(),
    status: condition.status,
    has_translation: languageId === 1 ? true : condition.has_translation,
    meta: {
      created_at: condition.created_at,
      updated_at: condition.updated_at
    },
    bannerKeys: condition.banner_keys || [],
  };
});

export async function getConditionsByLetter(letter, lang = 'en', page = 1, limit = 20) {
  const languageId = languageMap[lang] || 1;
  const offset = (page - 1) * limit;

  const result = await query(
    `WITH data AS (
      SELECT
        c.id,
        COALESCE(ct.name, c.name) AS name,
        c.slug,
        pct.title AS page_title,
        pct.description AS page_description,
        pct.indextitle AS page_indextitle,
        COUNT(*) OVER() AS total_count
      FROM
        condition_new c
      LEFT JOIN condition_translations_new ct ON c.id = ct.condition_id AND ct.language_id = $2
      LEFT JOIN conditions_page_meta_tags pct ON pct.language_id = $2
      WHERE
        COALESCE(ct.first_letter, c.first_letter) = UPPER($1)
        AND c.status = 'published'
      ORDER BY
        COALESCE(ct.name, c.name) ASC
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
