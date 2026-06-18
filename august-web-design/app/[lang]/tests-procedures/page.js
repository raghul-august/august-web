import PageLayoutClient from '@/app/components/PageLayoutClient';
import translationStrings from './language/translations';
import { getProcedureIndexMetaData } from '@/app/api/tests-procedures/meta/getMetaDataIndex';
import { generateMetadataAlternates } from '@/app/utils/hreflang';
const logger = require('@/app/utils/logger');

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const langStrings = translationStrings[lang] || translationStrings.en;
  try {
    const metadata = await getProcedureIndexMetaData(lang);
    return {
      title: metadata?.title || langStrings.title,
      description: metadata?.description || langStrings.title,
      alternates: generateMetadataAlternates(lang, '/tests-procedures'),
    };
  } catch {
    return {
      title: langStrings.title,
      alternates: generateMetadataAlternates(lang, '/tests-procedures'),
    };
  }
}

export default async function TestsPage({ params: paramsPromise, searchParams: searchParamsPromise }) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const language = params?.lang || 'en';
  const langStrings = translationStrings[language] || translationStrings.en;
  const source = searchParams?.source;
  const isWebviewSource = source === 'webview';
  let metaTitle = langStrings.title || '';
  let metaDescription = langStrings.title || '';

  try {
    const metadata = await getProcedureIndexMetaData(language); // Use the language
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
      baseUrl: `/${language}/tests-procedures`, 
    tags:['health_library', 'procedures'], 
    indices: {
      health_library: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'Health_Library',
    }
  };

  const commonTestsData = {
    title: langStrings.commonTestsTitle,
    description:langStrings.commonTestsDescription,
    items: [
      {
        title: langStrings.completeBloodCount, 
        description:langStrings.completeBloodCountDescription ,
         href: `/${language}/tests-procedures/complete-blood-count-cbc`
      },
      {
        title: langStrings.endoscopy,
        description: langStrings.endoscopyDescription, 
        href: `/${language}/tests-procedures/upper-endoscopy`
        
      },
      {
        title: langStrings.mriScan,
         description: langStrings.mriScanDescription,
         href: `/${language}/tests-procedures/mri`
         
      },
      {
        title: langStrings.ctScan,
        description: langStrings.ctScanDescription,
        href: `/${language}/tests-procedures/ct-scan`
        
      },
      {
        title: langStrings.colonoscopy,
        description: langStrings.colonoscopyDescription,
        href: `/${language}/tests-procedures/colonoscopy`
        
      },
      {
        title: langStrings.echocardiogram,
        description:langStrings.echocardiogramDescription ,
        href: `/${language}/tests-procedures/echocardiogram`
        
      },
      {
        title: langStrings.stressTest,
        description: langStrings.stressTestDescription,
        href: `/${language}/tests-procedures/stress-test`
        
      },
      {
        title: langStrings.mammogram,
        description: langStrings.mammogramDescription,
        href: `/${language}/tests-procedures/mammogram`
      }
    ]
  };

  return (
    <PageLayoutClient
      heroProps={heroProps}
      categoryData={commonTestsData}
      metaTitle={metaTitle}
      metaDescription={metaDescription}
      isWebviewSource={isWebviewSource}
      hideFooter={isWebviewSource}
    />
  );
} 
