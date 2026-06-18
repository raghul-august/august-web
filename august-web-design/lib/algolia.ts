/**
 * Shared Algolia client. Env vars are validated at boot by `next.config.mjs`
 * — if any are missing the dev server / build refuses to start, so these
 * reads can assume the values are present.
 *
 * Callers: `app/(webapp)/explore/page.tsx`, `app/components/SearchBar.js`.
 */

export const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
export const ALGOLIA_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY!;
export const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!;

function makeHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-algolia-application-id': ALGOLIA_APP_ID,
    'x-algolia-api-key': ALGOLIA_API_KEY,
  };
}

export interface AlgoliaHit {
  objectID?: string;
  [key: string]: unknown;
}

export interface AlgoliaSearchResponse<H = AlgoliaHit> {
  hits?: H[];
  page?: number;
  nbPages?: number;
  nbHits?: number;
}

interface SearchOptions {
  /** Index name. Defaults to NEXT_PUBLIC_ALGOLIA_INDEX_NAME. */
  indexName?: string;
  /** Extra params merged into the Algolia body (hitsPerPage, filters, etc). */
  params?: Record<string, unknown>;
}

/**
 * Execute an Algolia query. Throws a descriptive error on non-2xx responses
 * so callers see status + body in logs.
 */
export async function algoliaSearch<H = AlgoliaHit>(
  query: string,
  options: SearchOptions = {}
): Promise<AlgoliaSearchResponse<H>> {
  const indexName = options.indexName || ALGOLIA_INDEX_NAME;
  const url = `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${indexName}/query`;
  const body = JSON.stringify({ query, ...(options.params || {}) });

  const response = await fetch(url, {
    method: 'POST',
    headers: makeHeaders(),
    body,
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => '<unreadable>');
    throw new Error(
      `Algolia ${indexName} responded ${response.status}: ${bodyText.slice(0, 200)}`
    );
  }

  return response.json();
}
