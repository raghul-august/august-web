import { getSymptomBySlug } from '@/app/lib/data/symptoms';
const logger = require('../../../../utils/logger');

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const response = await getSymptomBySlug(slug, lang);

    if (!response) {
      return Response.json(
        { error: 'Symptom not found' },
        { status: 404 }
      );
    }

    return Response.json(response);
  } catch (error) {
    logger.error('Database Error:', error);
    return Response.json(
      { error: 'Failed to load symptom details' },
      { status: 500 }
    );
  }
}
