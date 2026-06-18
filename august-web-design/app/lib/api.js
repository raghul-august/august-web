// Client-safe API module — uses fetch() to hit API routes.
// Used by 'use client' components for pagination, etc.
// Server components should import from @/app/lib/data/* directly.

export async function fetchByLetter(category, letter, lang = 'en', page = 1, limit = 20) {
  try {
    const apiUrl = `/api/${category}/by-letter/${letter}?lang=${encodeURIComponent(lang)}&page=${page}&limit=${limit}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept-Language': lang,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      items: data.items || [],
      pagination: data.pagination || {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
      }
    };
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch data. Please try again later.');
  }
}

export async function fetchBySlug(category, slug, lang = 'en') {
  try {
    const apiUrl = `/api/${category}/view/${slug}?lang=${encodeURIComponent(lang)}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept-Language': lang,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
