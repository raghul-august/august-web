'use client';

import ArticleViewClient from '@/app/components/shared/ArticleViewClient';
import { ARTICLE_VIEW_CONFIGS } from '@/app/components/shared/articleViewConfig';

export default function MedicationViewClient({ medication, ...rest }) {
  return <ArticleViewClient article={medication} config={ARTICLE_VIEW_CONFIGS.medication} {...rest} />;
}
