import { getTestBySlug } from '@/app/lib/data/tests-procedures';
const logger = require('../../../../utils/logger');

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const response = await getTestBySlug(slug, lang);

    if (!response) {
      return Response.json(
        { error: 'Test or procedure not found' },
        { status: 404 }
      );
    }

    return Response.json(response);
  } catch (error) {
    logger.error('Database Error:', error);
    return Response.json(
      { error: 'Failed to load test details' },
      { status: 500 }
    );
  }
}
