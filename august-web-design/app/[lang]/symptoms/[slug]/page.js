import { notFound } from 'next/navigation';
import { getSymptomBySlug, getAvailableLanguagesForSymptom } from '@/app/lib/data/symptoms';
import translationStrings from '../language/translations';
import SymptomViewClient from './SymptomViewClient';
import { generateMetadataAlternates } from '@/app/utils/hreflang';
import { applyArticleStatusChecks, applyMetadataStatusChecks, extractFirstH1FromHtml, extractFirstPFromHtml } from '@/app/utils/articleStatus';
const logger = require('@/app/utils/logger');

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { slug, lang } = await params;
  const language = lang || 'en';
  const path = `/symptoms/${slug}`;
  try {
    const [symptom, availableLanguages] = await Promise.all([
      getSymptomBySlug(slug, language),
      getAvailableLanguagesForSymptom(slug),
    ]);
    const statusMeta = applyMetadataStatusChecks(symptom, language, 'symptoms', slug);
    if (statusMeta) return { ...statusMeta, alternates: generateMetadataAlternates(language, path, availableLanguages) };

    const firstHeading = extractFirstH1FromHtml(symptom?.body_html);
    const firstPTag = extractFirstPFromHtml(symptom?.body_html);
    const firstSentence =
      typeof firstPTag === "string" && firstPTag.trim()
        ? (firstPTag.split(".")[0] || firstPTag).trim() + "."
        : null;
    const description =
      symptom?.meta_description || firstSentence || "Default Description ";
    return {
      title: firstHeading || "Default title",
      description,
      openGraph: {
        title: firstHeading || "Default title",
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

export default async function SymptomPage({ params }) {
  const { slug, lang } = await params;
  const language = lang || 'en';

  // Create a safe version of langStrings without functions
  const rawStrings = translationStrings[language] || translationStrings.en;
  const langStrings = {
    ...rawStrings,
    noSymptomsFound: undefined,
  };

  try {
    // Fetch symptom data from DB
    const symptom = await getSymptomBySlug(slug, language);

    if (!symptom) {
      notFound();
    }

    applyArticleStatusChecks(symptom, language, 'symptoms', slug);

    const firstHeading = extractFirstH1FromHtml(symptom?.body_html);

    const breadcrumbItems = [
      { text: rawStrings.home || 'Home', href: `/${language}/library` },
      { text: rawStrings.title || 'Symptoms', href: `/${language}/symptoms` },
      { text: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }
    ];

    return (
      <SymptomViewClient
        symptom={symptom}
        language={language}
        langStrings={langStrings}
        metaTitle={firstHeading}
        metaDescription={symptom?.meta_description}
        firstHeading={firstHeading}
        articleImage={symptom?.image}
        breadcrumbItems={breadcrumbItems}
        questionBank={symptom?.question_bank || null}
      />
    );
  } catch (error) {
    if (error.digest) throw error;
    logger.error('Error in SymptomPage:', error);
    return (
      <SymptomViewClient
        error={error.message}
        language={language}
        langStrings={langStrings}
        metaTitle={''}
        metaDescription={''}
        firstHeading={''}
      />
    );
  }
}
