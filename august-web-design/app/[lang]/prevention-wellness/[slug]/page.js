import { notFound } from 'next/navigation';
import { getPreventionWellnessBySlug, getAvailableLanguagesForPreventionWellness } from '@/app/lib/data/prevention-wellness';
import translationStrings from '../language/translations';
import PreventionWellnessViewClient from './PreventionWellnessViewClient';
import { generateMetadataAlternates } from '@/app/utils/hreflang';
import { applyArticleStatusChecks, applyMetadataStatusChecks, extractFirstH1FromHtml, extractFirstPFromHtml } from '@/app/utils/articleStatus';
const logger = require('@/app/utils/logger');

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { slug, lang } = await params;
  const language = lang || 'en';
  const path = `/prevention-wellness/${slug}`;
  try {
    const [article, availableLanguages] = await Promise.all([
      getPreventionWellnessBySlug(slug, language),
      getAvailableLanguagesForPreventionWellness(slug),
    ]);

    if (!article) {
      return {
        title: 'Default Title',
        description: 'Default Description',
        alternates: generateMetadataAlternates(language, path, availableLanguages),
      };
    }

    const statusMeta = applyMetadataStatusChecks(article, language, 'prevention-wellness', slug);
    if (statusMeta) return { ...statusMeta, alternates: generateMetadataAlternates(language, path, availableLanguages) };

    const firstHeading = extractFirstH1FromHtml(article?.body_html);
    const firstPTag = extractFirstPFromHtml(article?.body_html);
    const firstSentence =
      typeof firstPTag === "string" && firstPTag.trim()
        ? (firstPTag.split(".")[0] || firstPTag).trim() + "."
        : null;
    const metaTitle = article?.meta_title || firstHeading || 'Default Title';
    const metaDescription = article?.meta_description || firstSentence || 'Default Description';

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

export default async function PreventionWellnessPage({ params }) {
  const { slug, lang } = await params;
  const language = lang || 'en';
  const startTime = Date.now();

  const rawStrings = translationStrings[language] || translationStrings.en;
  const langStrings = {
    ...rawStrings,
    home: rawStrings.home || 'Home',
    title: rawStrings.title || 'Prevention & Wellness',
    noPreventionWellnessFound: 'Topic not found',
  };

  try {
    const article = await getPreventionWellnessBySlug(slug, language);

    if (!article) {
      notFound();
    }

    applyArticleStatusChecks(article, language, 'prevention-wellness', slug);

    const firstHeading = extractFirstH1FromHtml(article?.body_html);
    const metaTitle = article?.meta_title || firstHeading || 'Default Title';
    const metaDescription = article?.meta_description || 'Default Description';

    const breadcrumbItems = [
      { text: langStrings.home, href: `/${language}/library` },
      { text: langStrings.title, href: `/${language}/prevention-wellness` },
      { text: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }
    ];

    return (
      <PreventionWellnessViewClient
        preventionWellness={article}
        language={language}
        langStrings={langStrings}
        metaTitle={metaTitle}
        metaDescription={metaDescription}
        articleImage={article?.image}
        breadcrumbItems={breadcrumbItems}
        questionBank={article?.question_bank || null}
      />
    );
  } catch (error) {
    if (error.digest) throw error;
    logger.error('Error in PreventionWellnessPage:', error);

    return (
      <PreventionWellnessViewClient
        error={error.message}
        language={language}
        langStrings={langStrings}
        isLoading={false}
      />
    );
  } finally {
    const endTime = Date.now();
    logger.info(`PreventionWellnessPage took ${endTime - startTime}ms`);
  }
}
