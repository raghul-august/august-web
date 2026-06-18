'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';

const COMPONENTS = {
  telehealth_promo_v1: dynamic(() => import('./TelehealthPromoBanner'), { ssr: false }),
};

export default function BannerRenderer({ bannerKeys, pageType, articleSlug, language }) {
  const [visibleId, setVisibleId] = useState(null);
  const [hidden, setHidden] = useState(false);

  const onVisible = useCallback((id) => {
    setVisibleId((prev) => prev ?? id);
  }, []);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const onScroll = () => setHidden(footer.getBoundingClientRect().top <= window.innerHeight);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!bannerKeys?.length || hidden) return null;

  return (
    <>
      {bannerKeys.map((key) => {
        const Banner = COMPONENTS[key];
        if (!Banner || (visibleId && visibleId !== key)) return null;
        return (
          <Banner
            key={key}
            bannerId={key}
            pageType={pageType}
            articleSlug={articleSlug}
            language={language}
            onVisible={onVisible}
          />
        );
      })}
    </>
  );
}
