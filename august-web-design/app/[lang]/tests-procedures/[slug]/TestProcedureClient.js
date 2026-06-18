'use client';

import ArticleViewClient from '@/app/components/shared/ArticleViewClient';
import { ARTICLE_VIEW_CONFIGS } from '@/app/components/shared/articleViewConfig';

export default function TestProcedureClient({ test, ...rest }) {
  return <ArticleViewClient article={test} config={ARTICLE_VIEW_CONFIGS['test-procedure']} {...rest} />;
}
