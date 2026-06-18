import { query } from '@/app/lib/db';
import sectionMappings from '../sectionMappings';
const logger = require('../../../utils/logger');

// Fields that should be rendered as markdown
const markdownFields = [
  'overview',
  'symptoms',
  'when_to_see_doctor',
  'causes',
  'risk_factors',
  'complications',
  'prevention',
  'diagnosis',
  'treatment',
  'self_care',
  'preparing_for_your_appointment'
];

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    //if (lang !== 'en') 
    const languageIdQuery = `SELECT id FROM languages WHERE code = $1`;

    const languageIdResult = await query(languageIdQuery, [lang]);

    const languageId = languageIdResult.rows[0]?.id;
     let result;
     if (languageId){

      result = await query(
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
            ct.body_html AS body_html,
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
            c.created_at,
            c.updated_at
        FROM
            condition c
            LEFT JOIN condition_translations ct ON c.id = ct.condition_id AND ct.language_id = $2
        WHERE
            c.slug = $1
        `,
        [slug, languageId]
      );
 } else {
        result = await query(
        `SELECT 
            id,
            name,
            slug,
            body_html,
            overview,
            symptoms,
            when_to_see_doctor,
            causes,
            risk_factors,
            complications,
            prevention,
            diagnosis,
            treatment,
            self_care,
            preparing_for_your_appointment,
          created_at,
          updated_at
        FROM condition_new
        WHERE slug = $1`,
          [slug]
        );
 }

    if (result.rows.length === 0) {
      return Response.json(
        { error: 'Condition not found' },
        { status: 404 }
      );
    }

    const condition = result.rows[0];

    // Transform the data to include sections for markdown content
  //   const sections = markdownFields
  //  .filter(field => {
  //     const translatedContent = condition[field]
  //     const englishContent = condition[`c_${field}`]
  //     return (translatedContent || englishContent) &&  (translatedContent !== 'NaN' && translatedContent !== null && translatedContent !== undefined ) || (englishContent !== 'NaN' && englishContent !== null && englishContent !== undefined)
  //  })
  //   .map(field => ({
  //     heading: sectionMappings[lang][field],
  //      content: condition[field] || condition[`c_${field}`]
  //     }));

    // Construct the response
    const response = {
      id: condition.id,
      name: condition.name,
      slug: condition.slug,
      url: condition.url,
      sections: condition.body_html,
      meta: {
        created_at: condition.created_at,
        updated_at: condition.updated_at
      }
    };
    return Response.json(response);
  } catch (error) {
    logger.error('Database Error:', error);
    return Response.json(
      { error: 'Failed to load condition details' },
      { status: 500 }
    );
  }
} 