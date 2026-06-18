import { cache } from 'react';
import { query } from '@/app/lib/db';
import languageMap from '@/app/contexts/LanguageMapping';
import { languageIdToCode } from '@/app/contexts/LanguageMapping';
import sectionMappings from '@/app/api/medications/sectionMappings';

const markdownFields = ['brand_names', 'description', 'before_using', 'proper_use', 'sideeffects'];

export const getAvailableLanguagesForMedication = cache(async function getAvailableLanguagesForMedication(slug) {
  const result = await query(
    `SELECT DISTINCT language_id FROM medications_translations_new
     WHERE medications_id = (SELECT id FROM medications_new WHERE slug = $1)`,
    [slug]
  );
  const codes = result.rows.map(r => languageIdToCode[r.language_id]).filter(Boolean);
  if (!codes.includes('en')) codes.push('en');
  return codes;
});


export const getMedicationBySlug = cache(async function getMedicationBySlug(slug, lang = 'en') {
  const languageId = languageMap[lang] || 1;

  const result = await query(
    `SELECT
    m.id,
    COALESCE(mt.name, m.name) AS name,
    m.slug,
    m.brand_names AS m_brand_names,
    m.description AS m_description,
    m.before_using AS m_before_using,
    m.proper_use AS m_proper_use,
    m.side_effects AS m_side_effects,
    mt.brand_names AS brand_names,
    mt.description AS description,
    CASE WHEN $2::int = 1 THEN m.body_html ELSE mt.body_html END AS body_html,
    mt.before_using AS before_using,
    mt.proper_use AS proper_use,
    mt.side_effects AS side_effects,
    mt.question_bank,
    m.question_bank AS m_question_bank,
    CASE WHEN $2::int = 1 THEN m.meta_title ELSE mmt.title END AS meta_title,
    CASE WHEN $2::int = 1 THEN m.meta_description ELSE mmt.description END AS meta_description,
    m.created_at,
    m.image,
    m.status,
    CASE WHEN mt.medications_id IS NOT NULL THEN true ELSE false END as has_translation,
    (SELECT array_agg(DISTINCT hb.component_key) FROM health_library_banners hb LEFT JOIN health_library_banner_assignments hba ON hb.id = hba.banner_id WHERE hb.status = 'active' AND (hba.medication_id = m.id OR hb.audience = 'unconditional')) as banner_keys
FROM
    medications_new m
LEFT JOIN
    medications_translations_new mt ON m.id = mt.medications_id AND mt.language_id = $2
LEFT JOIN
    medications_meta_tags mmt ON m.id = mmt.medication_id AND mmt.language_id = $2
WHERE
    m.slug = $1`,
    [slug, languageId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const medication = result.rows[0];
  const sections = markdownFields
    .filter(field => {
      const translatedContent = medication[field];
      const englishContent = medication[`m_${field}`];
      return (translatedContent || englishContent) && (translatedContent !== null && translatedContent !== undefined) || (englishContent !== null && englishContent !== undefined);
    })
    .map(field => ({
      heading: sectionMappings[lang][field],
      content: medication[field] || medication[`m_${field}`]
    }));

  const brandNames = medication.brand_names
    ? medication.brand_names.split(',').map(name => name.trim())
    : [];

  return {
    id: medication.id,
    name: medication.name,
    slug: medication.slug,
    brand_names: brandNames,
    sections: sections,
    body_html: medication.body_html,
    image: medication.image,
    meta: {
      created_at: medication.created_at,
    },
    meta_title: medication.meta_title,
    meta_description: medication.meta_description,
    status: medication.status,
    has_translation: languageId === 1 ? true : medication.has_translation,
    question_bank: (() => {
      const qb = (languageId === 1 ? medication.m_question_bank : medication.question_bank) || null;
      if (qb && languageId !== 1 && medication.m_question_bank?.headingIndexMap) {
        qb.headingIndexMap = medication.m_question_bank.headingIndexMap;
      }
      return qb;
    })(),
    bannerKeys: medication.banner_keys || [],
  };
});

export async function getMedicationsByLetter(letter, lang = 'en', page = 1, limit = 20) {
  const languageId = languageMap[lang] || 1;
  const offset = (page - 1) * limit;

  const result = await query(
    `WITH data AS (
      SELECT
        m.id,
        COALESCE(mt.name, m.name) AS name,
        m.slug,
        pmt.title AS page_title,
        pmt.description AS page_description,
        pmt.indextitle AS page_indextitle,
        COUNT(*) OVER() AS total_count
      FROM
        medications_new m
      LEFT JOIN medications_translations_new mt ON m.id = mt.medications_id AND mt.language_id = $2
      LEFT JOIN medications_page_meta_tags pmt ON pmt.language_id = $2
      WHERE
        COALESCE(mt.first_letter, m.first_letter) = UPPER($1)
        AND m.status = 'published'
      ORDER BY
        COALESCE(mt.name, m.name) ASC
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
