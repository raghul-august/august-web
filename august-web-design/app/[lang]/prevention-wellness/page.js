import PageLayoutClient from '@/app/components/PageLayoutClient';
import translationStrings from './language/translations';
import { generateMetadataAlternates } from '@/app/utils/hreflang';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const langStrings = translationStrings[lang] || translationStrings.en;
  return {
    title: langStrings.title,
    description: langStrings.description || langStrings.title,
    alternates: generateMetadataAlternates(lang, '/prevention-wellness'),
  };
}

export default async function PreventionWellnessPage({ params, searchParams }) {
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
    baseUrl: `/${language}/prevention-wellness`,
    tags: ['health_library', 'prevention_wellness'],
    indices: {
      health_library: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'Health_Library',
    }
  };

  const commonTopicsData = {
    title: langStrings.commonTopicsTitle,
    description: langStrings.commonTopicsDescription,
    items: [
      {
        title: langStrings.nutrition,
        description: langStrings.nutritionDescription,
        href: `/${language}/prevention-wellness/nutrition`
      },
      {
        title: langStrings.exercise,
        description: langStrings.exerciseDescription,
        href: `/${language}/prevention-wellness/exercise`
      },
      {
        title: langStrings.sleepHygiene,
        description: langStrings.sleepHygieneDescription,
        href: `/${language}/prevention-wellness/sleep-hygiene`
      },
      {
        title: langStrings.stressManagement,
        description: langStrings.stressManagementDescription,
        href: `/${language}/prevention-wellness/stress-management`
      },
      {
        title: langStrings.vaccinations,
        description: langStrings.vaccinationsDescription,
        href: `/${language}/prevention-wellness/vaccinations`
      },
      {
        title: langStrings.preventiveScreenings,
        description: langStrings.preventiveScreeningsDescription,
        href: `/${language}/prevention-wellness/preventive-screenings`
      },
      {
        title: langStrings.heartHealth,
        description: langStrings.heartHealthDescription,
        href: `/${language}/prevention-wellness/heart-health`
      },
      {
        title: langStrings.healthyAging,
        description: langStrings.healthyAgingDescription,
        href: `/${language}/prevention-wellness/healthy-aging`
      }
    ]
  };

  return (
    <PageLayoutClient
      heroProps={heroProps}
      categoryData={commonTopicsData}
      metaTitle={metaTitle}
      metaDescription={metaDescription}
      isWebviewSource={isWebviewSource}
      hideFooter={isWebviewSource}
    />
  );
}
