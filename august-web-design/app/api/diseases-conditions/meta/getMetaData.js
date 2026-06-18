// app/actions/get-symptom-metadata.js (or .ts if using Typescript)
'use server';  // Mark this as a Server Action

import { query } from '@/app/lib/db'; // Import your existing query function
const logger = require('../../../utils/logger');

export async function getConditionMetadata(conditionId, language, tablename, idname) {
    try {

        const dbQuery = `
            SELECT title, description
            FROM condition_meta_tags
            WHERE condition_id = $1 AND language_code = $2
        `;
        const values = [conditionId, language];
        const result = await query(dbQuery, values);

        if (result.rows.length > 0) {
            return {
                title: result.rows[0].title || '',
                description: result.rows[0].description || '',
            };
        } else {
            logger.warn(`No SEO tags found in DB for condition ID: ${conditionId} and language: ${language}`);
            return { title: null, description: null }; // Signal that no metadata was found
        }
    } catch (err) {
        logger.error("Database query failed:", err);
        return { title: null, description: null }; // Signal that an error occurred
    }
}