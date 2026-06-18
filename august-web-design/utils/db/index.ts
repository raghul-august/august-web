'use server'
import { Pool } from "pg"

if (
  !process.env.PG_HOST ||
  !process.env.PG_PORT ||
  !process.env.PG_USER ||
  !process.env.PG_PASSWORD ||
  !process.env.PG_DATABASE
) {
  throw new Error(
    'Postgres environment variables are not set. Please set PG_HOST, PG_PORT, PG_USER, PG_PASSWORD, and PG_DATABASE.'
  );
}


const pool = new Pool({
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
  try {
    //console.log("EXECUTING QUERY: ", query, params);
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    //console.log('DATABASE QUERY ERROR: ', error);
    throw error;
  }
}