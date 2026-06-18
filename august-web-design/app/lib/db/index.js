import pool from '../../../lib/db';
const logger = require('../../utils/logger');

export async function query(text, params) {
  let client;
  try {
    logger.info('Attempting database connection...');
    client = await pool.connect();
    logger.info('Connected to database successfully');
    logger.info('Executing query:', text);
    logger.info('Query params:', params);
    const result = await client.query(text, params);
    logger.info('Query executed successfully, row count:', result.rowCount);
    return result;
  } catch (error) {
    logger.error('Database error:', error);
    logger.error('Query:', text);
    logger.error('Params:', params);
    throw error;
  } finally {
    if (client) {
      logger.info('Releasing database connection');
      client.release();
    }
  }
}

export async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export const __dangerous__poolForTesting = process.env.NODE_ENV === 'test' ? pool : null;
