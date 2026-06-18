/**
 * Directus API Client
 * Lightweight wrapper for server-to-server Directus REST API calls.
 * Uses a static token for authentication (no session expiry).
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

/**
 * Fetch data from the Directus REST API.
 * @param {string} endpoint - API endpoint (e.g., '/items/condition_new')
 * @param {object} params - Query parameters as key-value pairs
 * @returns {Promise<object>} - Parsed JSON response
 */
export async function fetchFromDirectus(endpoint, params = {}) {
  const url = new URL(endpoint, DIRECTUS_URL);

  // Add query parameters
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, typeof value === 'object' ? JSON.stringify(value) : value);
    }
  }

  const headers = {
    'Content-Type': 'application/json',
  };

  if (DIRECTUS_TOKEN) {
    headers['Authorization'] = `Bearer ${DIRECTUS_TOKEN}`;
  }

  const response = await fetch(url.toString(), {
    headers,
    next: { revalidate: 60 }, // Cache for 60 seconds in Next.js
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Directus API error ${response.status}: ${errorBody}`);
  }

  return response.json();
}
