'use client';

import { Suspense, lazy } from 'react';
import { Navbar } from '@/app/components/website/Navbar';
import Link from 'next/link';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { getRedirectPath } from '@/app/utils/getRedirectPath';
import { useEffect } from 'react';
import { initPerformanceMonitoring, logBundleInfo } from '@/app/utils/performance';

// Lightweight components
import {
  LightweightBox,
  LightweightContainer,
  LightweightGrid,
  LightweightTypography
} from '@/app/components/LightweightLayout';
import LightweightCard, { LightweightCardContent } from '@/app/components/LightweightCard';

// Lazy load non-critical components
const SearchBar = lazy(() => import('@/app/components/SearchBar'));
const Footer = lazy(() => import('@/app/components/website/Footer').then(m => ({ default: m.Footer })));

// Loading component for SearchBar
const SearchBarSkeleton = () => (
  <div style={{ 
    height: '56px', 
    backgroundColor: '#f5f5f5', 
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px'
  }}>
    <span style={{ color: '#666' }}>Loading search...</span>
  </div>
);

// Loading component for Footer
const FooterSkeleton = () => (
  <div style={{ height: '200px', backgroundColor: '#f5f5f5', marginTop: '32px' }} />
);

export default function HomeClientOptimized({
  language,
  categories,
  initialMetadata,
  featuredBlogs,
  error,
  isWebviewSource = false
}) {
  const { t } = useLanguage();
  const metaTitle = initialMetadata?.title || t('home.title') || '';
  const metaDescription = initialMetadata?.description || t('home.title') || '';

  // Initialize performance monitoring
  useEffect(() => {
    initPerformanceMonitoring();
    
    // Log bundle info after a short delay to ensure all resources are loaded
    const timer = setTimeout(() => {
      logBundleInfo();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <div>
        <Navbar isWebviewSource={isWebviewSource} />
        <LightweightBox className="heroSection">
          <LightweightContainer>
            <LightweightTypography variant="h4" style={{ color: 'red' }}>
              {error}
            </LightweightTypography>
          </LightweightContainer>
        </LightweightBox>
        {!isWebviewSource && (
          <Suspense fallback={<FooterSkeleton />}>
            <Footer showLanguageSwitcher />
          </Suspense>
        )}
      </div>
    );
  }

  return (
    <div>

      <Navbar isWebviewSource={isWebviewSource} />

      {/* Hero Section */}
      <LightweightBox className="heroSection">
        <LightweightContainer maxWidth="lg">
          <LightweightGrid container spacing={6}>
            <LightweightGrid item xs={12} md={6}>
              <LightweightTypography
                variant="h2"
                component="h1"
                className="textBold mb3 wordWrap"
              >
                {t('home.title')}
              </LightweightTypography>
              <LightweightTypography
                variant="h6"
                className="textSecondary mb4"
              >
                {t('home.subtitle')}
              </LightweightTypography>
              <Suspense fallback={<SearchBarSkeleton />}>
                <SearchBar
                  placeholder={t('home.searchPlaceholder')}
                  indices={{
                    health_library: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'Health_Library',
                  }}
                  tags={['health_library']}
                />
              </Suspense>
            </LightweightGrid>
          </LightweightGrid>
        </LightweightContainer>
      </LightweightBox>

      {/* Categories Section */}
      <LightweightBox className="section">
        <LightweightContainer maxWidth="lg">
          <LightweightTypography
            variant="h4"
            component="h2"
            className="textBold mb4"
          >
            {t('home.commonCategories.title')}
          </LightweightTypography>

          <LightweightGrid container spacing={4}>
            {categories.map((category) => (
              <LightweightGrid item xs={12} sm={6} md={3} key={category.key}>
                <Link href={getRedirectPath(category.href)} style={{ textDecoration: 'none' }}>
                  <LightweightCard>
                    <LightweightCardContent>
                      <h3>
                        {t(`home.commonCategories.${category.key}.title`)}
                      </h3>
                      <p>
                        {t(`home.commonCategories.${category.key}.description`)}
                      </p>
                    </LightweightCardContent>
                  </LightweightCard>
                </Link>
              </LightweightGrid>
            ))}
          </LightweightGrid>
        </LightweightContainer>
      </LightweightBox>

      {/* Featured Articles Section */}
      <LightweightBox className="section mb100">
        <LightweightContainer maxWidth="lg">
          <LightweightBox className="flexBetween mb4">
            <LightweightTypography
              variant="h4"
              component="h2"
              className="textBold"
            >
              {t('home.featuredArticles.title')}
            </LightweightTypography>
            <Link href={getRedirectPath(`/${language}/articles`)} style={{ textDecoration: 'none' }}>
              <LightweightTypography
                variant="subtitle1"
                className="textPrimary hoverUnderline"
              >
                {t('home.viewAll')}
              </LightweightTypography>
            </Link>
          </LightweightBox>

          <LightweightGrid container spacing={4}>
            {featuredBlogs.map((blog, index) => (
              <LightweightGrid item xs={12} sm={6} md={3} key={index}>
                <Link href={getRedirectPath(blog.href)} style={{ textDecoration: 'none' }}>
                  <LightweightCard>
                    <LightweightCardContent>
                      <div className="blogTitle">
                        {blog.title}
                      </div>
                      <div className="blogDescription">
                        {blog.description}
                      </div>
                    </LightweightCardContent>
                  </LightweightCard>
                </Link>
              </LightweightGrid>
            ))}
          </LightweightGrid>
        </LightweightContainer>
      </LightweightBox>
      
      {!isWebviewSource && (
        <Suspense fallback={<FooterSkeleton />}>
          <Footer showLanguageSwitcher />
        </Suspense>
      )}
    </div>
  );
}
