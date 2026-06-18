import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

const CATEGORY_TABLE = {
  'articles':              { table: 'blogs',                   column: 'handle' },
  'diseases-conditions':   { table: 'condition_new',           column: 'slug' },
  'symptoms':              { table: 'symptom_new',             column: 'slug' },
  'medications':           { table: 'medications_new',         column: 'slug' },
  'tests-procedures':      { table: 'test_procedures_new',     column: 'slug' },
  'mental-health':         { table: 'mental_health_new',       column: 'handle' },
  'prevention-wellness':   { table: 'prevention_wellness_new', column: 'handle' },
};

export async function GET(request, { params }) {
  const { category, slug } = await params;
  const config = CATEGORY_TABLE[category];
  if (!config) return NextResponse.json({ status: null }, { status: 404 });

  const result = await query(
    `SELECT status FROM ${config.table} WHERE ${config.column} = $1 LIMIT 1`,
    [slug]
  );
  return NextResponse.json(
    { status: result.rows[0]?.status || null },
    { headers: { 'Cache-Control': 'public, max-age=3600' } }
  );
}
