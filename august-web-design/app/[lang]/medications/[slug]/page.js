import { notFound } from 'next/navigation';
import { getMedicationBySlug, getAvailableLanguagesForMedication } from '@/app/lib/data/medications';
import translationStrings from '../language/translations';
import MedicationViewClient from './MedicationViewClient';
import { generateMetadataAlternates } from '@/app/utils/hreflang';
import { applyArticleStatusChecks, applyMetadataStatusChecks, extractFirstH1FromHtml, extractFirstPFromHtml } from '@/app/utils/articleStatus';
const logger = require('@/app/utils/logger');

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { slug, lang } = await params;
  const language = lang || 'en';
  const path = `/medications/${slug}`;
  try {
    const [medication, availableLanguages] = await Promise.all([
      getMedicationBySlug(slug, language),
      getAvailableLanguagesForMedication(slug),
    ]);
    const statusMeta = applyMetadataStatusChecks(medication, language, 'medications', slug);
    if (statusMeta) return { ...statusMeta, alternates: generateMetadataAlternates(language, path, availableLanguages) };

    const firstHeading = extractFirstH1FromHtml(medication?.body_html);
    const firstPTag = extractFirstPFromHtml(medication?.body_html);
    const firstSentence =
      typeof firstPTag === "string" && firstPTag.trim()
        ? (firstPTag.split(".")[0] || firstPTag).trim() + "."
        : null;
    const title = medication?.meta_title || firstHeading || medication?.name || "Default title";
    const description =
      medication?.meta_description || firstSentence || "Default Description";
    return {
      title,
      description,
      openGraph: {
        title,
        description,
      },
      alternates: generateMetadataAlternates(language, path, availableLanguages),
    };
  } catch (error) {
    return {
      title: 'Default title',
      description: 'Default Description',
      alternates: generateMetadataAlternates(language, path),
    };
  }
}

export default async function MedicationPage({ params }) {
    const { slug, lang } = await params;
    const language = lang || 'en';
    const startTime = Date.now();

    // Create a safe version of langStrings without functions
    const rawStrings = translationStrings[language] || translationStrings.en;
    const langStrings = {
        ...rawStrings,
        noMedicationsFound: undefined
    };

    try {
        // Fetch medication data from DB
        const medication = await getMedicationBySlug(slug, language);

        if (!medication) {
          notFound();
        }

        applyArticleStatusChecks(medication, language, 'medications', slug);

        const { name, meta_title, meta_description } = medication || {};

        // Use the fetched meta data, or fall back to medication name if meta data is missing
        const metaTitle = meta_title || name || 'Default Title';
        const metaDescription = meta_description || name || 'Default Description';

        const breadcrumbItems = [
            { text: rawStrings.home || 'Home', href: `/${language}/library` },
            { text: rawStrings.medicationsTitle || 'Medications', href: `/${language}/medications` },
            { text: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }
        ];

        const component = (
            <MedicationViewClient
                medication={medication}
                language={language}
                langStrings={langStrings}
                metaTitle={metaTitle}
                metaDescription={metaDescription}
                articleImage={medication?.image}
                breadcrumbItems={breadcrumbItems}
                questionBank={medication?.question_bank || null}
            />
        );

        return component;
    } catch (error) {
        if (error.digest) throw error;
        logger.error('Error in MedicationPage:', error);
        return (
            <MedicationViewClient
                error={error.message}
                language={language}
                langStrings={langStrings}
            />
        );
    } finally {
        const endTime = Date.now();
        logger.info(`MedicationPage took ${endTime - startTime}ms`);
    }
}
