import { getAllBlogPosts, getCategories } from '@/app/lib/data/blog-posts';
import BlogPageClient from './BlogPageClient';

export const revalidate = 3600;

export const metadata = {
  title: 'Blog - Latest from August',
  description: 'Updates, benchmarks, and research from the August team.',
};

export default async function BlogsPage() {
  const [posts, categories] = await Promise.all([
    getAllBlogPosts(),
    getCategories(),
  ]);

  const sorted = [...categories].sort((a, b) => a.localeCompare(b));
  return <BlogPageClient posts={posts} categories={['All', ...sorted]} />;
}
