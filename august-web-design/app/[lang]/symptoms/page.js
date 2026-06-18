import PageLayoutClient from '@/app/components/PageLayoutClient';
import translationStrings from './language/translations'; // Import translations
import { getSymptomsIndexMetaData } from '@/app/api/symptoms/meta/getMetaDataIndex';
import { generateMetadataAlternates } from '@/app/utils/hreflang';
const logger = require('@/app/utils/logger');

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const langStrings = translationStrings[lang] || translationStrings.en;
  try {
    const metadata = await getSymptomsIndexMetaData(lang);
    return {
      title: metadata?.title || langStrings.symptomsTitle,
      description: metadata?.description || langStrings.symptomsTitle,
      alternates: generateMetadataAlternates(lang, '/symptoms'),
    };
  } catch {
    return {
      title: langStrings.symptomsTitle,
      alternates: generateMetadataAlternates(lang, '/symptoms'),
    };
  }
}

export default async function SymptomsPage({ params, searchParams }) {
  const { lang } = await params;
  const { source } = await searchParams;
  const language = lang || 'en';
  const langStrings = translationStrings[language] || translationStrings.en;
  const isWebviewSource = source === 'webview';
  
  let metaTitle = langStrings.symptomsTitle || '';
  let metaDescription = langStrings.symptomsTitle || '';

  try {
    const metadata = await getSymptomsIndexMetaData(language);
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
    baseUrl: `/${language}/symptoms`, 
    tags:['health_library', 'symptoms'], 
    indices: {
      health_library: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'Health_Library',
    }
  };

  const commonSymptomsData = {
    title: langStrings.commonSymptomsTitle,
    description: langStrings.commonSymptomsDescription,
    items: [
      {
        title: langStrings.cough,
        description: langStrings.coughDescription,
        href: `/${language}/symptoms/cough`
      },
      {
        title: langStrings.headache,
        description: langStrings.headacheDescription,
        href: `/${language}/symptoms/headache`
      },
      {
        title: langStrings.fatigue,
        description: langStrings.fatigueDescription,
        href: `/${language}/symptoms/fatigue`
      },
      {
        title: langStrings.abdominalPain,
        description: langStrings.abdominalPainDescription,
        href: `/${language}/symptoms/abdominal-pain`
      },
      {
         title: langStrings.dizziness,
         description: langStrings.dizzinessDescription,
        href: `/${language}/symptoms/dizziness`
      },
      {
        title: langStrings.backPain,
       description: langStrings.backPainDescription,
        href: `/${language}/symptoms/back-pain`
      },
      {
        title: langStrings.nausea,
       description: langStrings.nauseaDescription,
        href: `/${language}/symptoms/nausea-and-vomiting`
      },
      {
        title: langStrings.shortnessOfBreath,
        description: langStrings.shortnessOfBreathDescription,
        href: `/${language}/symptoms/shortness-of-breath`
      }
    ]
  };

  return (
    <PageLayoutClient
      heroProps={heroProps}
      categoryData={commonSymptomsData}
      metaTitle={metaTitle}
      metaDescription={metaDescription}
      isWebviewSource={isWebviewSource}
      hideFooter={isWebviewSource}
    />
  );
}
