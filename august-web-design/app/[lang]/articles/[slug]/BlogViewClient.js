'use client';

import ArticleViewClient from '@/app/components/shared/ArticleViewClient';
import { ARTICLE_VIEW_CONFIGS } from '@/app/components/shared/articleViewConfig';

export default function BlogViewClient({ blogPost, featuredBlogs, currentSlug, section, bodyContent, isLoading, ...rest }) {
  return (
    <ArticleViewClient
      article={blogPost}
      config={ARTICLE_VIEW_CONFIGS.articles}
      recommendedItems={featuredBlogs}
      currentSlug={currentSlug}
      bodyContent={bodyContent}
      isLoading={isLoading}
      {...rest}
    />
  );
}
