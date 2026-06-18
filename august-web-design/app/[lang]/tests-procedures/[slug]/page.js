import { notFound } from 'next/navigation';
import { getTestBySlug, getAvailableLanguagesForTest } from '@/app/lib/data/tests-procedures';
import translationStrings from '../language/translations';
import TestProcedureClient from './TestProcedureClient';
import { generateMetadataAlternates } from '@/app/utils/hreflang';
import { applyArticleStatusChecks, applyMetadataStatusChecks, extractFirstH1FromHtml, extractFirstPFromHtml } from '@/app/utils/articleStatus';
const logger = require('@/app/utils/logger');

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { slug, lang } = await params;
  const language = lang || 'en';
  const path = `/tests-procedures/${slug}`;
  try {
    const [test, availableLanguages] = await Promise.all([
      getTestBySlug(slug, language),
      getAvailableLanguagesForTest(slug),
    ]);
    const statusMeta = applyMetadataStatusChecks(test, language, 'tests-procedures', slug);
    if (statusMeta) return { ...statusMeta, alternates: generateMetadataAlternates(language, path, availableLanguages) };

    const firstHeading = extractFirstH1FromHtml(test?.body_html) || "Default";
    const firstPTag = extractFirstPFromHtml(test?.body_html);
    const firstSentence =
      typeof firstPTag === "string" && firstPTag.trim()
        ? (firstPTag.split(".")[0] || firstPTag).trim() + "."
        : null;
    const description = test?.meta_description || firstSentence || "Default";
    return {
      title: firstHeading,
      description,
      openGraph: {
        title: firstHeading,
        description,
      },
      alternates: generateMetadataAlternates(language, path, availableLanguages),
    };
  } catch (error) {
    return {
      title: 'Default',
      description: 'Default',
      alternates: generateMetadataAlternates(language, path),
    };
  }
}

export default async function TestProcedurePage({ params }) {
  const { slug, lang } = await params;
  const language = lang || 'en';

  // Create a safe version of langStrings without functions
  const rawStrings = translationStrings[language] || translationStrings.en;
  const langStrings = {
    ...rawStrings,
    noTestsFound: undefined
  };

  try {
    // Fetch test data from DB
    const test = await getTestBySlug(slug, language);

    if (!test) {
      notFound();
    }

    applyArticleStatusChecks(test, language, 'tests-procedures', slug);

    const firstHeading = extractFirstH1FromHtml(test?.body_html);

    const breadcrumbItems = [
      { text: rawStrings.home || 'Home', href: `/${language}/library` },
      { text: rawStrings.title || 'Tests & Procedures', href: `/${language}/tests-procedures` },
      { text: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }
    ];

    return (
      <TestProcedureClient
        test={test}
        language={language}
        langStrings={langStrings}
        metaTitle={firstHeading}
        metaDescription={test?.meta_description}
        firstHeading={firstHeading}
        articleImage={test?.image}
        breadcrumbItems={breadcrumbItems}
        questionBank={test?.question_bank || null}
      />
    );
  } catch (error) {
    if (error.digest) throw error;
    logger.error('Error in TestProcedurePage:', error);
    return (
      <TestProcedureClient
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
