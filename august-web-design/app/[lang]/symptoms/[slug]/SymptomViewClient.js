'use client';

import ArticleViewClient from '@/app/components/shared/ArticleViewClient';
import { ARTICLE_VIEW_CONFIGS } from '@/app/components/shared/articleViewConfig';

export default function SymptomViewClient({ symptom, ...rest }) {
  return <ArticleViewClient article={symptom} config={ARTICLE_VIEW_CONFIGS.symptom} {...rest} />;
}
