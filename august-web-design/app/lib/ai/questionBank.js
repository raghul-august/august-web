import 'server-only';
import { generateWithGemini } from './gemini';
import { getGenerationPrompt, getTranslationPrompt } from './prompts';
import { query } from '@/app/lib/db';
import languageMap from '@/app/contexts/LanguageMapping';

const logger = require('@/app/utils/logger');

const LANG_NAMES = {
  en: 'English', af: 'Afrikaans', am: 'Amharic', ar: 'Arabic', be: 'Belarusian', bg: 'Bulgarian',
  bn: 'Bengali', bs: 'Bosnian', cs: 'Czech', cy: 'Welsh', da: 'Danish', de: 'German',
  el: 'Greek', es: 'Spanish', et: 'Estonian', fa: 'Persian', fi: 'Finnish', fr: 'French',
  ga: 'Irish', gd: 'Scottish Gaelic', gu: 'Gujarati', ha: 'Hausa', haw: 'Hawaiian',
  he: 'Hebrew', hi: 'Hindi', hr: 'Croatian', ht: 'Haitian Creole', hu: 'Hungarian',
  id: 'Indonesian', ig: 'Igbo', is: 'Icelandic', it: 'Italian', ja: 'Japanese',
  jv: 'Javanese', km: 'Khmer', kn: 'Kannada', ko: 'Korean', la: 'Latin', lb: 'Luxembourgish',
  lt: 'Lithuanian', lv: 'Latvian', mi: 'Maori', mk: 'Macedonian', ml: 'Malayalam',
  mn: 'Mongolian', mr: 'Marathi', ms: 'Malay', mt: 'Maltese', my: 'Burmese',
  ne: 'Nepali', nl: 'Dutch', no: 'Norwegian', om: 'Oromo', pa: 'Punjabi', pl: 'Polish',
  pt: 'Portuguese', ro: 'Romanian', ru: 'Russian', rw: 'Kinyarwanda', si: 'Sinhala',
  sk: 'Slovak', sl: 'Slovenian', sn: 'Shona', so: 'Somali', sq: 'Albanian', sr: 'Serbian',
  su: 'Sundanese', sv: 'Swedish', sw: 'Swahili', ta: 'Tamil', te: 'Telugu', tg: 'Tajik',
  th: 'Thai', tl: 'Filipino', tr: 'Turkish', uk: 'Ukrainian', ur: 'Urdu', uz: 'Uzbek',
  vi: 'Vietnamese', yo: 'Yoruba', 'zh-Hans': 'Simplified Chinese', 'zh-Hant': 'Traditional Chinese',
  zu: 'Zulu',
};

const TABLE_MAP = {
  medication: {
    base: 'medications_new',
    translation: 'medications_translations_new',
    slugColumn: 'slug',
    idColumn: 'id',
    foreignKey: 'medications_id',
    titleColumn: 'name',
    contentFields: ['description', 'before_using', 'proper_use', 'side_effects'],
  },
  symptom: {
    base: 'symptom_new',
    translation: 'symptom_translations_new',
    slugColumn: 'slug',
    idColumn: 'id',
    foreignKey: 'symptom_id',
    titleColumn: 'name',
    contentFields: ['definition', 'causes', 'when_to_see_doctor'],
  },
  disease: {
    base: 'condition_new',
    translation: 'condition_translations_new',
    slugColumn: 'slug',
    idColumn: 'id',
    foreignKey: 'condition_id',
    titleColumn: 'name',
    contentFields: ['overview', 'symptoms', 'causes', 'risk_factors', 'complications', 'prevention', 'diagnosis', 'treatment', 'self_care'],
  },
  'test-procedure': {
    base: 'test_procedures_new',
    translation: 'test_procedures_translations_new',
    slugColumn: 'slug',
    idColumn: 'id',
    foreignKey: 'test_procedure_id',
    titleColumn: 'name',
    contentFields: ['overview', 'why_its_done', 'risks', 'how_to_prepare', 'what_to_expect', 'results'],
  },
  articles: {
    base: 'blogs_translations',
    translation: 'blogs_translations',
    slugColumn: 'handle',
    idColumn: 'id',
    foreignKey: 'id',
    titleColumn: 'title',
    contentFields: ['body_html'],
  },
  'mental-health': {
    base: 'mental_health_new',
    translation: 'mental_health_translations_new',
    slugColumn: 'handle',
    idColumn: 'id',
    foreignKey: 'id',
    titleColumn: 'title',
    contentFields: ['body_html'],
  },
  'prevention-wellness': {
    base: 'prevention_wellness_new',
    translation: 'prevention_wellness_translations_new',
    slugColumn: 'handle',
    idColumn: 'id',
    foreignKey: 'prevention_wellness_id',
    titleColumn: 'title',
    contentFields: ['body_html'],
  },
};

const GENERATION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes — if placeholder is older than this, retry

function isStaleGenerating(questionBank) {
  if (!questionBank?.generating) return false;
  const startedAt = new Date(questionBank.started_at).getTime();
  return Date.now() - startedAt > GENERATION_TIMEOUT_MS;
}

async function writePlaceholder(tableConfig, isBlog, slug, languageId, isEnglish) {
  const placeholder = JSON.stringify({ generating: true, started_at: new Date().toISOString() });
  if (isBlog) {
    await query(`UPDATE blogs_translations SET question_bank = $1 WHERE handle = $2 AND language_id = $3`, [placeholder, slug, languageId]);
  } else if (isEnglish) {
    await query(`UPDATE ${tableConfig.base} SET question_bank = $1 WHERE ${tableConfig.slugColumn} = $2`, [placeholder, slug]);
  } else {
    await query(`UPDATE ${tableConfig.translation} SET question_bank = $1 WHERE ${tableConfig.foreignKey} = (SELECT ${tableConfig.idColumn} FROM ${tableConfig.base} WHERE ${tableConfig.slugColumn} = $2) AND language_id = $3`, [placeholder, slug, languageId]);
  }
}

async function clearPlaceholder(tableConfig, isBlog, slug, languageId, isEnglish) {
  if (isBlog) {
    await query(`UPDATE blogs_translations SET question_bank = NULL WHERE handle = $1 AND language_id = $2 AND question_bank::text LIKE '%"generating"%'`, [slug, languageId]);
  } else if (isEnglish) {
    await query(`UPDATE ${tableConfig.base} SET question_bank = NULL WHERE ${tableConfig.slugColumn} = $1 AND question_bank::text LIKE '%"generating"%'`, [slug]);
  } else {
    await query(`UPDATE ${tableConfig.translation} SET question_bank = NULL WHERE ${tableConfig.foreignKey} = (SELECT ${tableConfig.idColumn} FROM ${tableConfig.base} WHERE ${tableConfig.slugColumn} = $1) AND language_id = $2 AND question_bank::text LIKE '%"generating"%'`, [slug, languageId]);
  }
}

export async function generateQuestionBank(slug, lang, contentType) {
  try {
    const tableConfig = TABLE_MAP[contentType];
    if (!tableConfig) {
      logger.error(`[QuestionBank] Invalid contentType: ${contentType}`);
      return;
    }

    const languageId = languageMap[lang] || 1;
    const isEnglish = languageId === 1;
    const isBlog = contentType === 'articles';

    // Check if question_bank already exists for this slug + language
    let existsResult;
    if (isBlog) {
      existsResult = await query(
        `SELECT question_bank FROM blogs_translations WHERE handle = $1 AND language_id = $2`,
        [slug, languageId]
      );
    } else if (isEnglish) {
      existsResult = await query(
        `SELECT question_bank FROM ${tableConfig.base} WHERE ${tableConfig.slugColumn} = $1`,
        [slug]
      );
    } else {
      existsResult = await query(
        `SELECT question_bank FROM ${tableConfig.translation} WHERE ${tableConfig.foreignKey} = (SELECT ${tableConfig.idColumn} FROM ${tableConfig.base} WHERE ${tableConfig.slugColumn} = $1) AND language_id = $2`,
        [slug, languageId]
      );
    }

    const existing = existsResult.rows[0]?.question_bank;

    // Already has real questions — skip
    if (existing && !existing.generating) {
      return;
    }

    // Another process is generating — skip unless it's stale
    if (existing?.generating && !isStaleGenerating(existing)) {
      return;
    }

    // Write placeholder to claim this generation
    await writePlaceholder(tableConfig, isBlog, slug, languageId, isEnglish);

    // If non-English, ensure English version exists first
    let englishQuestionBank = null;
    if (!isEnglish) {
      let englishResult;
      if (isBlog) {
        englishResult = await query(
          `SELECT question_bank FROM blogs_translations WHERE handle = $1 AND language_id = 1`,
          [slug]
        );
      } else {
        englishResult = await query(
          `SELECT question_bank FROM ${tableConfig.base} WHERE ${tableConfig.slugColumn} = $1`,
          [slug]
        );
      }

      const enQb = englishResult.rows[0]?.question_bank;
      if (enQb && enQb.prompts) {
        englishQuestionBank = enQb;
      } else {
        // Generate English first
        await generateEnglish(slug, contentType, tableConfig, isBlog);
        // Re-fetch
        const refetch = isBlog
          ? await query(`SELECT question_bank FROM blogs_translations WHERE handle = $1 AND language_id = 1`, [slug])
          : await query(`SELECT question_bank FROM ${tableConfig.base} WHERE ${tableConfig.slugColumn} = $1`, [slug]);
        if (refetch.rows.length > 0 && refetch.rows[0].question_bank) {
          englishQuestionBank = refetch.rows[0].question_bank;
        } else {
          logger.error(`[QuestionBank] Failed to generate English for ${contentType}/${slug}`);
          return;
        }
      }

      // Translate
      await translateAndStore(slug, contentType, tableConfig, isBlog, englishQuestionBank, lang, languageId);
      return;
    }

    // Generate English
    await generateEnglish(slug, contentType, tableConfig, isBlog);

  } catch (error) {
    logger.error(`[QuestionBank] Error for ${contentType}/${slug}/${lang}:`, error);
    // Clear placeholder so next visitor can retry
    await clearPlaceholder(tableConfig, isBlog, slug, languageId, isEnglish).catch(() => {});
  }
}

async function generateEnglish(slug, contentType, tableConfig, isBlog) {
  // Fetch article content
  let articleResult;
  if (isBlog) {
    articleResult = await query(
      `SELECT id, title, body_html FROM blogs_translations WHERE handle = $1 AND language_id = 1`,
      [slug]
    );
  } else {
    const fields = ['id', tableConfig.titleColumn, 'body_html', ...tableConfig.contentFields].join(', ');
    articleResult = await query(
      `SELECT ${fields} FROM ${tableConfig.base} WHERE ${tableConfig.slugColumn} = $1`,
      [slug]
    );
  }

  if (articleResult.rows.length === 0) {
    logger.error(`[QuestionBank] Article not found: ${contentType}/${slug}`);
    return;
  }

  const article = articleResult.rows[0];
  const articleName = article.name || article.title || slug;

  // Build content string from available fields
  const contentParts = tableConfig.contentFields
    .map(field => article[field])
    .filter(Boolean);
  const articleContent = contentParts.join('\n\n').substring(0, 8000); // Limit to avoid token overflow

  // Extract h2 headings — prefer body_html, fall back to content fields
  const htmlForHeadings = article.body_html || articleContent;
  const headingRegex = /<h2[^>]*>(.*?)<\/h2>/gi;
  const sectionHeadings = [];
  let headingMatch;
  while ((headingMatch = headingRegex.exec(htmlForHeadings)) !== null) {
    const heading = headingMatch[1].replace(/<[^>]*>/g, '').trim();
    if (heading) sectionHeadings.push(heading);
  }

  // If no h2 headings found, try h3
  if (sectionHeadings.length === 0) {
    const h3Regex = /<h3[^>]*>(.*?)<\/h3>/gi;
    while ((headingMatch = h3Regex.exec(htmlForHeadings)) !== null) {
      const heading = headingMatch[1].replace(/<[^>]*>/g, '').trim();
      if (heading) sectionHeadings.push(heading);
    }
  }

  logger.info(`[QuestionBank] Found ${sectionHeadings.length} headings for ${contentType}/${slug}: ${sectionHeadings.join(', ')}`);

  // Generate via Gemini
  const prompt = getGenerationPrompt(articleName, contentType, articleContent, sectionHeadings);
  const generated = await generateWithGemini(prompt);

  // Validate response
  if (!generated?.prompts || !Array.isArray(generated.prompts)) {
    logger.error(`[QuestionBank] Invalid Gemini response for ${contentType}/${slug}`);
    return;
  }

  // Build heading index map: English heading text -> h2 index (0-based)
  const headingIndexMap = {};
  sectionHeadings.forEach((h, idx) => { headingIndexMap[h] = idx; });

  const questionBank = {
    generated_at: new Date().toISOString(),
    headingIndexMap,
    prompts: generated.prompts,
  };

  // Store in DB
  if (isBlog) {
    await query(
      `UPDATE blogs_translations SET question_bank = $1 WHERE handle = $2 AND language_id = 1`,
      [JSON.stringify(questionBank), slug]
    );
  } else {
    await query(
      `UPDATE ${tableConfig.base} SET question_bank = $1 WHERE ${tableConfig.slugColumn} = $2`,
      [JSON.stringify(questionBank), slug]
    );
  }

  logger.info(`[QuestionBank] Generated English for ${contentType}/${slug}`);
}

async function translateAndStore(slug, contentType, tableConfig, isBlog, englishQuestionBank, lang, languageId) {
  const langName = LANG_NAMES[lang] || lang;
  const prompt = getTranslationPrompt(englishQuestionBank, langName);
  const translated = await generateWithGemini(prompt);

  if (!translated?.prompts || !Array.isArray(translated.prompts)) {
    logger.error(`[QuestionBank] Invalid translation response for ${contentType}/${slug}/${lang}`);
    return;
  }

  const translatedBank = {
    generated_at: new Date().toISOString(),
    prompts: translated.prompts,
  };

  if (isBlog) {
    await query(
      `UPDATE blogs_translations SET question_bank = $1 WHERE handle = $2 AND language_id = $3`,
      [JSON.stringify(translatedBank), slug, languageId]
    );
  } else {
    await query(
      `UPDATE ${tableConfig.translation} SET question_bank = $1 WHERE ${tableConfig.foreignKey} = (SELECT ${tableConfig.idColumn} FROM ${tableConfig.base} WHERE ${tableConfig.slugColumn} = $2) AND language_id = $3`,
      [JSON.stringify(translatedBank), slug, languageId]
    );
  }

  logger.info(`[QuestionBank] Translated ${contentType}/${slug} to ${lang}`);
}
