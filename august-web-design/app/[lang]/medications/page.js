import PageLayoutClient from '@/app/components/PageLayoutClient';
import translationStrings from './language/translations';
import { getMedicationsIndexMetaData } from '@/app/api/medications/meta/getMetaDataIndex';
import { generateMetadataAlternates } from '@/app/utils/hreflang';
const logger = require('@/app/utils/logger');

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const langStrings = translationStrings[lang] || translationStrings.en;
  try {
    const metadata = await getMedicationsIndexMetaData(lang);
    return {
      title: metadata?.title || langStrings.medicationsTitle,
      description: metadata?.description || langStrings.medicationsDescription,
      alternates: generateMetadataAlternates(lang, '/medications'),
    };
  } catch {
    return {
      title: langStrings.medicationsTitle,
      description: langStrings.medicationsDescription,
      alternates: generateMetadataAlternates(lang, '/medications'),
    };
  }
}

export default async function MedicationsPage({ params: paramsPromise, searchParams: searchParamsPromise }) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const language = params?.lang || 'en';
  const langStrings = translationStrings[language] || translationStrings.en;
  const source = searchParams?.source;
  const isWebviewSource = source === 'webview';

  // Fetch metadata server-side
  let metaTitle = langStrings.medicationsTitle || '';
  let metaDescription = langStrings.medicationsTitle || '';

  try {
    const metadata = await getMedicationsIndexMetaData(language);
    if (metadata) {
      metaTitle = metadata.title || langStrings.medicationsTitle;
      metaDescription = metadata.description || langStrings.medicationsTitle;
    } else {
      logger.warn(`No home page SEO tags found in DB for language: ${language}`);
    }
  } catch (error) {
    logger.error("Error fetching home metadata:", error);
    // Default values already set above
  }

  const heroProps = {
    title: langStrings.medicationsTitle,
    description: langStrings.medicationsDescription,
    searchPlaceholder: langStrings.medicationsSearchPlaceholder,
    browseByLetterText: langStrings.browseByLetter,
    baseUrl: `/${language}/medications`,
    indices: {
      health_library: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'Health_Library',
    },
    tags: ['medications', 'health_library']
  };

  const commonMedicationsData = {
    title: langStrings.commonMedicationsTitle,
    description: langStrings.commonMedicationsDescription,
    items: [
      {
        title: langStrings.lisinoprilTitle,
        description: langStrings.lisinoprilDescription,
        href: `/${language}/medications/lisinopril-oral-route`
      },
      {
        title: langStrings.metforminTitle,
        description: langStrings.metforminDescription,
        href: `/${language}/medications/metformin-oral-route`
      },
      {
        title: langStrings.vitaminDTitle,
        description: langStrings.vitaminDDescription,
        href: `/${language}/medications/vitamin-d-and-related-compounds-oral-route-parenteral-route`
      },
      {
        title: langStrings.omeprazoleTitle,
        description: langStrings.omeprazoleDescription,
        href: `/${language}/medications/omeprazole-oral-route`
      },
      {
        title: langStrings.fishOilTitle,
        description: langStrings.fishOilDescription,
        href: `/${language}/medications/fat-emulsion-fish-oil-and-soybean-oil-intravenous-route`
      },
      {
        title: langStrings.atorvastatinTitle,
        description: langStrings.atorvastatinDescription,
        href: `/${language}/medications/atorvastatin-oral-route`
      },
      {
        title: langStrings.aspirinTitle,
        description: langStrings.aspirinDescription,
        href: `/${language}/medications/aspirin-oral-route`
      },
      {
        title: langStrings.sertralineTitle,
        description: langStrings.sertralineDescription,
        href: `/${language}/medications/sertraline-oral-route`
      }
    ]
  };

  return (
    <PageLayoutClient
      heroProps={heroProps}
      categoryData={commonMedicationsData}
      metaTitle={metaTitle}
      metaDescription={metaDescription}
      isWebviewSource={isWebviewSource}
      hideFooter={isWebviewSource}
    />
  );
}
