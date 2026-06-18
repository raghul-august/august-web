import PageLayoutClient from '@/app/components/PageLayoutClient';
import translationStrings from './language/translations';
import { generateMetadataAlternates } from '@/app/utils/hreflang';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const langStrings = translationStrings[lang] || translationStrings.en;
  return {
    title: langStrings.title,
    description: langStrings.description || langStrings.title,
    alternates: generateMetadataAlternates(lang, '/mental-health'),
  };
}

export default async function MentalHealthPage({ params, searchParams }) {
  const { lang } = await params;
  const { source } = await searchParams;
  const language = lang || 'en';
  const langStrings = translationStrings[language] || translationStrings.en;
  const isWebviewSource = source === 'webview';

  const metaTitle = langStrings.title || '';
  const metaDescription = langStrings.description || langStrings.title || '';

  const heroProps = {
    title: langStrings.title,
    description: langStrings.description,
    searchPlaceholder: langStrings.searchPlaceholder,
    browseByLetterText: langStrings.browseByLetter,
    baseUrl: `/${language}/mental-health`,
    tags: ['health_library', 'mental_health'],
    indices: {
      health_library: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'Health_Library',
    }
  };

  const commonMentalHealthData = {
    title: langStrings.commonTopicsTitle,
    description: langStrings.commonTopicsDescription,
    items: [
      {
        title: langStrings.depression,
        description: langStrings.depressionDescription,
        href: `/${language}/mental-health/depression`
      },
      {
        title: langStrings.anxiety,
        description: langStrings.anxietyDescription,
        href: `/${language}/mental-health/anxiety`
      },
      {
        title: langStrings.ptsd,
        description: langStrings.ptsdDescription,
        href: `/${language}/mental-health/ptsd`
      },
      {
        title: langStrings.bipolarDisorder,
        description: langStrings.bipolarDisorderDescription,
        href: `/${language}/mental-health/bipolar-disorder`
      },
      {
        title: langStrings.ocd,
        description: langStrings.ocdDescription,
        href: `/${language}/mental-health/ocd`
      },
      {
        title: langStrings.adhd,
        description: langStrings.adhdDescription,
        href: `/${language}/mental-health/adhd`
      },
      {
        title: langStrings.eatingDisorders,
        description: langStrings.eatingDisordersDescription,
        href: `/${language}/mental-health/eating-disorders`
      },
      {
        title: langStrings.schizophrenia,
        description: langStrings.schizophreniaDescription,
        href: `/${language}/mental-health/schizophrenia`
      }
    ]
  };

  return (
    <PageLayoutClient
      heroProps={heroProps}
      categoryData={commonMentalHealthData}
      metaTitle={metaTitle}
      metaDescription={metaDescription}
      isWebviewSource={isWebviewSource}
      hideFooter={isWebviewSource}
    />
  );
}
