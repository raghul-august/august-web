'use server';

import { query } from '@/app/lib/db';
const logger = require('../../../utils/logger');

export async function getPreventionWellnessIndexMetaData(language) {
    try {
        const dbQuery = `SELECT title, description, indextitle FROM prevention_wellness_page_meta_tags WHERE language_code = $1`;
        const values = [language];
        const result = await query(dbQuery, values);

        if (result.rows.length > 0) {
            return {
                title: result.rows[0].title || '',
                description: result.rows[0].description || '',
                indextitle: result.rows[0].indextitle || ''
            };
        } else {
            logger.warn(`No SEO tags found in DB for language: ${language}`);
            return { title: null, description: null, indextitle: null };
        }
    } catch (err) {
        logger.error("Database query failed:", err);
        return { title: null, description: null, indextitle: null };
    }
}
