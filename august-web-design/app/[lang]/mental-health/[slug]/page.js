import { notFound } from 'next/navigation';
import { getMentalHealthBySlug, getAvailableLanguagesForMentalHealth } from '@/app/lib/data/mental-health';
import translationStrings from '../language/translations';
import MentalHealthViewClient from './MentalHealthViewClient';
import { generateMetadataAlternates } from '@/app/utils/hreflang';
import { applyArticleStatusChecks, applyMetadataStatusChecks, extractFirstH1FromHtml, extractFirstPFromHtml } from '@/app/utils/articleStatus';
const logger = require('@/app/utils/logger');

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { slug, lang } = await params;
  const language = lang || 'en';
  const path = `/mental-health/${slug}`;
  try {
    const [mentalHealth, availableLanguages] = await Promise.all([
      getMentalHealthBySlug(slug, language),
      getAvailableLanguagesForMentalHealth(slug),
    ]);

    if (!mentalHealth) {
      return {
        title: 'Default Title',
        description: 'Default Description',
        alternates: generateMetadataAlternates(language, path, availableLanguages),
      };
    }

    const statusMeta = applyMetadataStatusChecks(mentalHealth, language, 'mental-health', slug);
    if (statusMeta) return { ...statusMeta, alternates: generateMetadataAlternates(language, path, availableLanguages) };

    const firstHeading = extractFirstH1FromHtml(mentalHealth?.body_html);
    const firstPTag = extractFirstPFromHtml(mentalHealth?.body_html);
    const firstSentence =
      typeof firstPTag === "string" && firstPTag.trim()
        ? (firstPTag.split(".")[0] || firstPTag).trim() + "."
        : null;
    const metaTitle = mentalHealth?.meta_title || firstHeading || 'Default Title';
    const metaDescription = mentalHealth?.meta_description || firstSentence || 'Default Description';

    return {
      title: metaTitle,
      description: metaDescription,
      openGraph: {
        title: metaTitle,
        description: metaDescription,
      },
      alternates: generateMetadataAlternates(language, path, availableLanguages),
    };
  } catch (error) {
    return {
      title: 'Default Title',
      description: 'Default Description',
      alternates: generateMetadataAlternates(language, path),
    };
  }
}

export default async function MentalHealthPage({ params }) {
  const { slug, lang } = await params;
  const language = lang || 'en';
  const startTime = Date.now();

  const rawStrings = translationStrings[language] || translationStrings.en;
  const langStrings = {
    ...rawStrings,
    home: rawStrings.home || 'Home',
    title: rawStrings.title || 'Mental Health',
    noMentalHealthFound: 'Topic not found',
  };

  try {
    const mentalHealth = await getMentalHealthBySlug(slug, language);

    if (!mentalHealth) {
      notFound();
    }

    applyArticleStatusChecks(mentalHealth, language, 'mental-health', slug);

    const firstHeading = extractFirstH1FromHtml(mentalHealth?.body_html);
    const metaTitle = mentalHealth?.meta_title || firstHeading || 'Default Title';
    const metaDescription = mentalHealth?.meta_description || 'Default Description';

    const breadcrumbItems = [
      { text: langStrings.home, href: `/${language}/library` },
      { text: langStrings.title, href: `/${language}/mental-health` },
      { text: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }
    ];

    return (
      <MentalHealthViewClient
        mentalHealth={mentalHealth}
        language={language}
        langStrings={langStrings}
        metaTitle={metaTitle}
        metaDescription={metaDescription}
        articleImage={mentalHealth?.image}
        breadcrumbItems={breadcrumbItems}
        questionBank={mentalHealth?.question_bank || null}
      />
    );
  } catch (error) {
    if (error.digest) throw error;
    logger.error('Error in MentalHealthPage:', error);

    return (
      <MentalHealthViewClient
        error={error.message}
        language={language}
        langStrings={langStrings}
        isLoading={false}
      />
    );
  } finally {
    const endTime = Date.now();
    logger.info(`MentalHealthPage took ${endTime - startTime}ms`);
  }
}
