import { cache } from 'react';
import { query } from '@/app/lib/db';

const AUTHOR_COLUMNS = 'id, name, slug, description, credentials, designation, image, email, linkedin, twitter, status';

export const getAuthorBySlug = cache(async function getAuthorBySlug(slug) {
  const result = await query(
    `SELECT ${AUTHOR_COLUMNS} FROM health_library_authors WHERE slug = $1`,
    [slug]
  );
  return result.rows[0] || null;
});

export async function getAllAuthorSlugs() {
  const result = await query(
    `SELECT slug FROM health_library_authors WHERE status = 'published'`
  );
  return result.rows.map(r => r.slug);
}

export async function getAuthorById(id) {
  const result = await query(
    `SELECT ${AUTHOR_COLUMNS} FROM health_library_authors WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}
