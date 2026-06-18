import { getBlogsByLetter } from '@/app/lib/data/blog';
const logger = require('../../../../utils/logger');

export const revalidate = 3600;

export async function GET(request) {
  try {
    const letter = request.nextUrl.pathname.split('/').pop();
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    const data = await getBlogsByLetter(letter, lang, page, limit);

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    logger.error('Error:', error);
    return Response.json(
      { error: 'Failed to load blogs' },
      { status: 500 }
    );
  }
}
