import { notFound } from 'next/navigation';
import AuthorViewClient from './AuthorViewClient';
import { getAuthorBySlug, getAllAuthorSlugs } from '@/app/lib/data/authors';

export async function generateMetadata({ params }) {
  const paramsData = await params;
  const authorSlug = paramsData['author-name'];
  const author = await getAuthorBySlug(authorSlug);

  if (!author) return {};

  const title = `${author.name} - Health Library`;
  return {
    title,
    description: author.description,
    openGraph: {
      title,
      description: author.description,
    },
  };
}

export default async function AuthorPage({ params }) {
  const paramsData = await Promise.resolve(params);
  const authorSlug = paramsData['author-name'];
  const lang = paramsData.lang;

  const author = await getAuthorBySlug(authorSlug);

  if (!author) {
    notFound();
  }

  const breadcrumbItems = [
    { label: 'Home', href: `${lang}` },
    { label: author.name, href: `${lang}/author/${authorSlug}` },
  ];

  return (
    <AuthorViewClient
      author={author}
      error={null}
      breadcrumbItems={breadcrumbItems}
      metaTitle={`${author.name} - Health Library`}
      metaDescription={author.description}
      language={lang}
      langStrings={{}}
    />
  );
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllAuthorSlugs();
    return slugs.map((slug) => ({
      'author-name': slug,
    }));
  } catch {
    return [];
  }
}
