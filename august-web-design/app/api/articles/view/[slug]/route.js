import { getBlogBySlug } from '@/app/lib/data/blog';
const logger = require('../../../../utils/logger');

export async function GET(request) {
  try {
    logger.info("FETCHING BLOG FROM DB USING SLUG")
    const slug = request.nextUrl.pathname.split('/').pop();
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const response = await getBlogBySlug(slug, lang);

    if (!response) {
      return Response.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return Response.json(response);
  } catch (error) {
    logger.error('Error:', error);
    return Response.json(
      { error: 'Failed to load blog post details' },
      { status: 500 }
    );
  }
}
