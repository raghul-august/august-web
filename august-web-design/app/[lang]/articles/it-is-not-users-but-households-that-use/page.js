import { Suspense } from 'react';
import translationStrings from '@/app/[lang]/articles/language/translations';
import BlogViewClient from '@/app/[lang]/articles/[slug]/BlogViewClient';
import HouseholdsContent from './HouseholdsContent';

const BLOG_POST = {
  title: "We Have 6 Million Users. We Serve Closer to 12 Million People.",
  body_html: '',
  author: null,
  published_at: '2026-02-21',
  image: null,
};

const META_DESCRIPTION = "We analyzed 150 million messages on August and found that digital health in India doesn't serve individuals. It serves households.";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const language = lang || 'en';
  return {
    title: BLOG_POST.title,
    description: META_DESCRIPTION,
    openGraph: {
      title: BLOG_POST.title,
      description: META_DESCRIPTION,
    },
    alternates: {
      canonical: `/${language}/articles/it-is-not-users-but-households-that-use`,
    },
  };
}

export default async function AboutSlugPage({ params }) {
  const { lang } = await params;
  const language = lang || 'en';
  const rawStrings = translationStrings[language] || translationStrings.en;
  const langStrings = {
    ...rawStrings,
    home: rawStrings.home || 'Home',
    noBlogsFound: rawStrings.noBlogsFound || 'Page not found',
  };

  return (
    <Suspense>
      <BlogViewClient
        blogPost={BLOG_POST}
        language={language}
        langStrings={langStrings}
        metaTitle={BLOG_POST.title}
        metaDescription={META_DESCRIPTION}
        isLoading={false}
        featuredBlogs={[]}
        currentSlug="it-is-not-users-but-households-that-use"
        section="about"
        bodyContent={<HouseholdsContent />}
      />
    </Suspense>
  );
}
