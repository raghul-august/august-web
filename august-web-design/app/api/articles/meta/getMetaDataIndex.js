'use server'
const logger = require('../../../utils/logger');

const mockMetadata = {
  en: {
    title: 'Health Blog - Expert Medical Articles and Health Tips',
    description: 'Explore our comprehensive collection of health articles, medical insights, and wellness tips written by healthcare experts.',
    indextitle: 'Health Blog'
  },
  es: {
    title: 'Blog de Salud - Artículos Médicos y Consejos de Salud',
    description: 'Explore nuestra colección completa de artículos de salud, conocimientos médicos y consejos de bienestar escritos por expertos en salud.',
    indextitle: 'Blog de Salud'
  }
};

export async function getBlogIndexMetaData(language) {
    try {
        const startTime = Date.now();
        
        // Get mock metadata for the requested language, fallback to English
        const metadata = mockMetadata[language] || mockMetadata.en;
        
        const endTime = Date.now();
        logger.info('the index meta data took', endTime-startTime, 'milliseconds');
            
        if (metadata) {
            return {
                title: metadata.title || '',
                description: metadata.description || '',
                indextitle: metadata.indextitle || '',
            };
        } else {
            logger.warn(`No SEO tags found for language: ${language}`);
            return { title: null, description: null, indextitle: null };
        }
    } catch (err) {
        logger.error("Error fetching metadata:", err);
        return { title: null, description: null, indextitle: null };
    }
}
