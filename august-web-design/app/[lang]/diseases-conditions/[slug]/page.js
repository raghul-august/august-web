import { notFound } from 'next/navigation';
import DetailViewClient from '@/app/components/shared/DetailViewClient';
import { getConditionBySlug, getAvailableLanguagesForCondition } from '@/app/lib/data/diseases-conditions';
import translationStrings from '../language/translations';
import { generateMetadataAlternates } from '@/app/utils/hreflang';
import { applyArticleStatusChecks, applyMetadataStatusChecks, extractFirstH1FromHtml, extractFirstPFromHtml } from '@/app/utils/articleStatus';
const logger = require('@/app/utils/logger');

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { slug, lang } = await params;
  const language = lang || 'en';
  const path = `/diseases-conditions/${slug}`;
  try {
    const [condition, availableLanguages] = await Promise.all([
      getConditionBySlug(slug, language),
      getAvailableLanguagesForCondition(slug),
    ]);
    const statusMeta = applyMetadataStatusChecks(condition, language, 'diseases-conditions', slug);
    if (statusMeta) return { ...statusMeta, alternates: generateMetadataAlternates(language, path, availableLanguages) };

    const firstHeading = extractFirstH1FromHtml(condition?.sections);
    const firstPTag = extractFirstPFromHtml(condition?.sections);
    const firstSentence =
      typeof firstPTag === "string" && firstPTag.trim()
        ? (firstPTag.split(".")[0] || firstPTag).trim() + "."
        : null;
    const description =
      condition?.meta_description || firstSentence || "Default Description";
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

export default async function ConditionPage({ params }) {
  const { slug, lang } = await params;
  const language = lang || 'en';

  // Create a safe version of langStrings without functions
  const rawStrings = translationStrings[language] || translationStrings.en;
  const langStrings = {
    ...rawStrings,
    noConditionsFound: undefined
  };

  try {
    // Fetch condition data from DB
    const condition = await getConditionBySlug(slug, language);

    if (!condition) {
      notFound();
    }

    applyArticleStatusChecks(condition, language, 'diseases-conditions', slug);

    const firstHeading = extractFirstH1FromHtml(condition?.sections);

    const breadcrumbItems = [
      { text: langStrings.home, href: `/${language}/library` },
      { text: langStrings.title, href: `/${language}/diseases-conditions` },
      { text: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }
    ];

    return (
      <DetailViewClient
        condition={condition}
        breadcrumbItems={breadcrumbItems}
        metaTitle={firstHeading}
        metaDescription={condition?.meta_description}
        firstHeading={firstHeading}
        language={language}
        langStrings={langStrings}
        articleImage={condition?.image}
        questionBank={condition?.question_bank || null}
      />
    );
  } catch (error) {
    if (error.digest) throw error;
    logger.error('Error in ConditionPage:', error);
    return (
      <DetailViewClient
        error={error.message}
        language={language}
        langStrings={langStrings}
        breadcrumbItems={[
          { text: langStrings.home, href: `/${language}/library` },
          { text: langStrings.title, href: `/${language}/diseases-conditions` }
        ]}
        metaTitle={''}
        metaDescription={''}
        firstHeading={''}
      />
    );
  }
}
