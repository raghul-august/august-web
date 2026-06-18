import PageLayoutClient from '@/app/components/PageLayoutClient';
import { getConditionIndexMetaData } from '@/app/api/diseases-conditions/meta/getMetaDataIndex';
import translationStrings from './language/translations';
import { generateMetadataAlternates } from '@/app/utils/hreflang';
const logger = require('@/app/utils/logger');

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const langStrings = translationStrings[lang] || translationStrings.en;
  try {
    const metadata = await getConditionIndexMetaData(lang);
    return {
      title: metadata?.title || langStrings.title,
      description: metadata?.description || langStrings.title,
      alternates: generateMetadataAlternates(lang, '/diseases-conditions'),
    };
  } catch {
    return {
      title: langStrings.title,
      alternates: generateMetadataAlternates(lang, '/diseases-conditions'),
    };
  }
}

export default async function DiseasesPage({ params: paramsPromise, searchParams: searchParamsPromise }) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const language = params?.lang || 'en';
  const langStrings = translationStrings[language] || translationStrings.en;
  const source = searchParams?.source;
  const isWebviewSource = source === 'webview';

  // Fetch metadata server-side
  let metaTitle = langStrings.title || '';
  let metaDescription = langStrings.title || '';

  try {
    const metadata = await getConditionIndexMetaData(language);
    if (metadata) {
      metaTitle = metadata.title || langStrings.title;
      metaDescription = metadata.description || langStrings.title;
    } else {
      logger.warn(`No home page SEO tags found in DB for language: ${language}`);
    }
  } catch (error) {
    logger.error("Error fetching home metadata:", error);
    // Default values already set above
  }

  const heroProps = {
    title: langStrings.title,
    description: langStrings.description,
    searchPlaceholder: langStrings.searchPlaceholder,
    browseByLetterText: langStrings.browseByLetter,
    baseUrl: `/${language}/diseases-conditions`,
    indices: {
      health_library: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'Health_Library',
    },
    tags: ['health_library', 'conditions']
  };

  const commonDiseasesData = {
    title: langStrings.commonDiseasesTitle,
    description: langStrings.commonDiseasesDescription,
    items: [
      {
        title: langStrings.type2Diabetes,
        description: langStrings.type2DiabetesDescription,
        href: `/${language}/diseases-conditions/type-2-diabetes`
      },
      {
        title: langStrings.hypertension,
        description: langStrings.hypertensionDescription,
        href: `/${language}/diseases-conditions/high-blood-pressure`
      },
      {
        title: langStrings.asthma,
        description: langStrings.asthmaDescription,
        href: `/${language}/diseases-conditions/asthma`
      },
      {
        title: langStrings.arthritis,
        description: langStrings.arthritisDescription,
        href: `/${language}/diseases-conditions/arthritis`
      },
      {
        title: langStrings.depression,
        description: langStrings.depressionDescription,
        href: `/${language}/diseases-conditions/depression`
      },
      {
        title: langStrings.heartDisease,
        description: langStrings.heartDiseaseDescription,
        href: `/${language}/diseases-conditions/heart-disease`
      },
      {
        title: langStrings.gerd,
        description: langStrings.gerdDescription,
        href: `/${language}/diseases-conditions/gerd`
      },
      {
        title: langStrings.migraine,
        description: langStrings.migraineDescription,
        href: `/${language}/diseases-conditions/migraine-headache`
      }
    ]
  };

  return (
    <PageLayoutClient
      heroProps={heroProps}
      categoryData={commonDiseasesData}
      metaTitle={metaTitle}
      metaDescription={metaDescription}
      isWebviewSource={isWebviewSource}
      hideFooter={isWebviewSource}
    />
  );
}
