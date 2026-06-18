'use client';

import ArticleViewClient from '@/app/components/shared/ArticleViewClient';
import { ARTICLE_VIEW_CONFIGS } from '@/app/components/shared/articleViewConfig';

export default function PreventionWellnessViewClient({ preventionWellness, ...rest }) {
  return <ArticleViewClient article={preventionWellness} config={ARTICLE_VIEW_CONFIGS['prevention-wellness']} {...rest} />;
}
