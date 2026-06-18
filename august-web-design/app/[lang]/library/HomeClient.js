'use client';

import { Suspense, lazy } from 'react';
import { Navbar } from '@/app/components/website/Navbar';
// Optimized MUI imports for better tree shaking
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from 'next/link';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { getRedirectPath } from '@/app/utils/getRedirectPath';
import { useEffect } from 'react';
import { initPerformanceMonitoring, logBundleInfo } from '@/app/utils/performance';

// Lazy load non-critical components
const SearchBar = lazy(() => import('@/app/components/SearchBar'));
const Footer = lazy(() => import('@/app/components/website/Footer').then(m => ({ default: m.Footer })));

// Loading component for SearchBar
const SearchBarSkeleton = () => (
  <Box sx={{ 
    height: '56px', 
    backgroundColor: '#f5f5f5', 
    borderRadius: '52px',
    display: 'flex',
    alignItems: 'center',
    px: 2
  }}>
    <Typography variant="body1" color="text.secondary">
      Loading search...
    </Typography>
  </Box>
);

// Loading component for Footer
const FooterSkeleton = () => (
  <Box sx={{ height: '200px', backgroundColor: '#f5f5f5', mt: 4 }} />
);

export default function HomeClient({
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
        <Box sx={{ backgroundColor: 'var(--lib-bg-primary, #f4f5f5)', pt: 16, pb: 4 }}>
          <Container>
            <Typography variant="h4" color="error">
              {error}
            </Typography>
          </Container>
        </Box>
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
      <Box sx={{ backgroundColor: 'var(--lib-bg-primary, #f4f5f5)', pt: 16, pb: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif", fontWeight: 400, letterSpacing: '-0.02em', mb: 3, wordWrap: 'break-word' }}
              >
                {t('home.title')}
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: 'var(--lib-text-secondary, #767f7c)', mb: 4 }}
              >
                {t('home.subtitle')}
              </Typography>
              <Suspense fallback={<SearchBarSkeleton />}>
                <SearchBar
                  placeholder={t('home.searchPlaceholder')}
                  indices={{
                    health_library: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'Health_Library',
                  }}
                  tags={['health_library']}
                />
              </Suspense>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Categories Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif", fontWeight: 400, letterSpacing: '-0.02em', mb: 4 }}
          >
            {t('home.commonCategories.title')}
          </Typography>

          <Grid container spacing={4}>
            {categories.map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category.key}>
                <Link href={getRedirectPath(category.href)} style={{ textDecoration: 'none' }}>
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 'var(--lib-shadow-card)'
                      },
                      borderRadius: '16px',
                      backgroundColor: '#fff',
                      padding: '24px 16px',
                      boxShadow: 'var(--lib-shadow-subtle)',
                      border: '1px solid var(--lib-border, #E8EAE8)',
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif", fontWeight: '500' }}
                      >
                        {t(`home.commonCategories.${category.key}.title`)}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif" }}
                      >
                        {t(`home.commonCategories.${category.key}.description`)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      {/* Featured Articles Section */}
      <Box sx={{ py: 8, marginBottom: '100px' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif", fontWeight: 400, letterSpacing: '-0.02em' }}
            >
              {t('home.featuredArticles.title')}
            </Typography>
            <Link href={getRedirectPath(`/${language}/articles`)} style={{ textDecoration: 'none' }}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: 'primary.main',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {t('home.viewAll')}
              </Typography>
            </Link>
          </Box>

          <Grid container spacing={4}>
            {featuredBlogs.map((blog, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Link href={getRedirectPath(blog.href)} style={{ textDecoration: 'none' }}>
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 'var(--lib-shadow-card)'
                      },
                      borderRadius: '16px',
                      backgroundColor: '#fff',
                      padding: '24px 16px',
                      boxShadow: 'var(--lib-shadow-subtle)',
                      border: '1px solid var(--lib-border, #E8EAE8)',
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                          fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                          fontWeight: '500',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.3,
                          mb: 2
                        }}
                      >
                        {blog.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {blog.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      {!isWebviewSource && (
        <Suspense fallback={<FooterSkeleton />}>
          <Footer showLanguageSwitcher />
        </Suspense>
      )}
    </div>
  );
}
