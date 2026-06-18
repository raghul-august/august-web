import { getConditionBySlug } from '@/app/lib/data/diseases-conditions';
const logger = require('../../../../utils/logger');

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const response = await getConditionBySlug(slug, lang);

    if (!response) {
      return Response.json(
        { error: 'Condition not found' },
        { status: 404 }
      );
    }

    return Response.json(response);
  } catch (error) {
    logger.error('Database Error:', error);
    return Response.json(
      { error: 'Failed to load condition details' },
      { status: 500 }
    );
  }
}
