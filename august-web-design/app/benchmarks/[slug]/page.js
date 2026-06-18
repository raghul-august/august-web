import { notFound } from 'next/navigation';
import translationStrings from '@/app/[lang]/articles/language/translations';
import BlogViewClient from '@/app/[lang]/articles/[slug]/BlogViewClient';
import HealthBenchContent from './HealthBenchContent';

const BLOG_POST = {
  title: "How August got a perfect HealthBench score (and why it's not enough)",
  body_html: '',
  author: 'Anuruddh Mishra, Dr. Deep Bhatt',
  published_at: '2025-05-15',
  image: null,
};

const META_DESCRIPTION = "August scored a perfect 1.00 on HealthBench Consensus emergency escalation and explains why that's just the starting line.";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (slug !== 'safety-and-healthbench') {
    return {};
  }
  return {
    title: BLOG_POST.title,
    description: META_DESCRIPTION,
    openGraph: {
      title: BLOG_POST.title,
      description: META_DESCRIPTION,
    },
    alternates: {
      canonical: `/benchmarks/${slug}`,
    },
  };
}

export default async function BenchmarkSlugPage({ params }) {
  const { slug } = await params;
  if (slug !== 'safety-and-healthbench') {
    notFound();
  }

  const langStrings = {
    ...translationStrings.en,
    home: translationStrings.en.home || 'Home',
    noBlogsFound: translationStrings.en.noBlogsFound || 'Page not found',
  };

  return (
    <BlogViewClient
      blogPost={BLOG_POST}
      language="en"
      langStrings={langStrings}
      metaTitle={BLOG_POST.title}
      metaDescription={META_DESCRIPTION}
      isLoading={false}
      featuredBlogs={[]}
      currentSlug={slug}
      section="benchmarks"
      bodyContent={<HealthBenchContent />}
    />
  );
}
