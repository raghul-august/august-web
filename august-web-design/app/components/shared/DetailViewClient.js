'use client';

import ArticleViewClient from './ArticleViewClient';
import { ARTICLE_VIEW_CONFIGS } from './articleViewConfig';

export default function DetailViewClient({ condition, ...rest }) {
  return <ArticleViewClient article={condition} config={ARTICLE_VIEW_CONFIGS.disease} {...rest} />;
}
