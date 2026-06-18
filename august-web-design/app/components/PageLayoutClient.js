'use client';

import PageLayout from './PageLayout';

export default function PageLayoutClient({ 
  heroProps, 
  categoryData, 
  metaTitle, 
  metaDescription,
  isWebviewSource = false,
  hideFooter = false
}) {
  return (
    <PageLayout
      heroProps={heroProps}
      categoryData={categoryData}
      isWebviewSource={isWebviewSource}
      hideFooter={hideFooter}
    />
  );
}
