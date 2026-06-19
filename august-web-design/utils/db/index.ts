'use server'
import { Pool } from "pg"

const hasDbConfig =
  process.env.PG_HOST &&
  process.env.PG_PORT &&
  process.env.PG_USER &&
  process.env.PG_PASSWORD &&
  process.env.PG_DATABASE;

const pool = hasDbConfig
  ? new Pool({
      host: process.env.PG_HOST,
      port: parseInt(process.env.PG_PORT || '5432', 10),
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ssl: {
        rejectUnauthorized: false,
      },
    })
  : null;

export async function executeQuery(
  query: string,
  params: (
    | string
    | number
    | boolean
    | Date
    | null
    | Buffer
    | bigint
    | object
    | string[]
    | number[]
    | Buffer[]
  )[] = []
) {
  if (!pool) {
    throw new Error('Database not configured. Set PG_HOST, PG_PORT, PG_USER, PG_PASSWORD, and PG_DATABASE.');
  }
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    throw error;
  }
}