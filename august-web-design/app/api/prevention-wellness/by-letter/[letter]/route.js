import { getPreventionWellnessByLetter } from '@/app/lib/data/prevention-wellness';
const logger = require('../../../../utils/logger');

export const revalidate = 3600;

export async function GET(request, { params }) {
  try {
    const { letter } = await params;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    const data = await getPreventionWellnessByLetter(letter, lang, page, limit);
    return Response.json(data);
  } catch (error) {
    logger.error('Database Error:', error);
    return Response.json({ error: 'Failed to load prevention & wellness topics' }, { status: 500 });
  }
}
