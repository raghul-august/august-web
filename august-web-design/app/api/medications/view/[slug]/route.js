import { getMedicationBySlug } from '@/app/lib/data/medications';
const logger = require('../../../../utils/logger');

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const response = await getMedicationBySlug(slug, lang);

    if (!response) {
      return Response.json(
        { error: 'Medication not found' },
        { status: 404 }
      );
    }

    logger.info('medication', response);
    return Response.json(response);
  } catch (error) {
    logger.error('Database Error:', error);
    return Response.json(
      { error: 'Failed to load medication details' },
      { status: 500 }
    );
  }
}
