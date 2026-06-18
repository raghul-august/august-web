'use client';
const logger = require('@/app/utils/logger');

import { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from '@/app/components/website/Navbar';
import AlphabeticalList from '@/app/components/AlphabeticalList';
import AlphabetGrid from '@/app/components/AlphabetGrid';
import { Box, Container, Typography, Grid } from '@mui/material';
import SearchBar from '@/app/components/SearchBar';
import { Footer } from '@/app/components/website/Footer';

import { fetchByLetter } from '@/app/lib/api';
import CircularProgress from '@mui/material/CircularProgress';
import { useSearchParams } from 'next/navigation';

export default function BlogsByLetterClient({
  initialData,
  letter,
  decodedLetter,
  language,
  langStrings,
  metaIndexTitle,
  metaDescription,
  error,
  isWebviewSource: hideDownloadButtonFromServer = false,
}) {
  const [blogs, setBlogs] = useState(initialData.items);
  const [pagination, setPagination] = useState(initialData.pagination);
  const searchParams = useSearchParams();
  const shouldHideDownloadButton =
    hideDownloadButtonFromServer || searchParams.get('source') === 'webview';

  useEffect(() => {
    logger.info('Initial blogs data:', JSON.stringify(initialData.items, null, 2));
    logger.info('Initial pagination:', JSON.stringify(initialData.pagination, null, 2));
  }, [initialData]);
  const prefetchedData = useRef({});
  const [isLoading, setIsLoading] = useState(false);

  const prefetchNextPage = useCallback(async (nextPage) => {
    if (nextPage <= pagination.totalPages && !prefetchedData.current[nextPage]) {
      try { 
        const data = await fetchByLetter('articles', letter, language, nextPage);
        prefetchedData.current[nextPage] = data;
      } catch (error) {
        logger.error('Error prefetching page:', error);
      }
    }
  }, [letter, language, pagination.totalPages]);

  useEffect(() => { 
    const currentPage = pagination.page;
    if (currentPage < pagination.totalPages) {
      prefetchNextPage(currentPage + 1);
    }
  }, [pagination.page, prefetchNextPage, pagination.totalPages]);

  const handlePageChange = async (page) => {
    setIsLoading(true);
    try {
      if (prefetchedData.current[page]) {
        const data = prefetchedData.current[page];
        setBlogs(data.items);
        setPagination(data.pagination);
        delete prefetchedData.current[page];
      } else {
        const data = await fetchByLetter('articles', letter, language, page);
        setBlogs(data.items);
        setPagination(data.pagination);
      } 
    } catch (error) {
      logger.error('Error fetching page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>

      <Navbar isWebviewSource={shouldHideDownloadButton} />
      
      {/* Hero Section */}
      <Box sx={{ backgroundColor: 'var(--lib-bg-primary, #f4f5f5)', pt: 16, pb: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom
                sx={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif", fontWeight: 600, letterSpacing: '-0.02em', mb: 3 }}
              >
                {langStrings.blogTitle}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ color: 'var(--lib-text-secondary, #767f7c)', mb: 4 }}
              >
                {langStrings.blogDescription}
              </Typography>
              <SearchBar 
                placeholder={langStrings.blogSearchPlaceholder} 
                indices={{
                  health_library: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'Health_Library',
                }}
                tags={['blogs']} 
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{
                backgroundColor: 'white',
                p: 3,
                borderRadius: 2,
                boxShadow: 'var(--lib-shadow-subtle)',
                border: '1px solid var(--lib-border, #E8EAE8)'
              }}>
                <Typography variant="h6" sx={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif", fontWeight: 600, mb: 2 }}>
                  {langStrings.browseByLetter}
                </Typography>
                <AlphabetGrid baseUrl={`/${language}/articles`} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Alphabetical List Section */}
      <Box sx={{ backgroundColor: 'white', py: 4, position: 'relative' }}>
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <Container maxWidth="lg">
          {error ? (
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
          ) : blogs.length > 0 ? (
            <AlphabeticalList 
              items={blogs} 
              letter={letter}
              section="blog"
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                {langStrings.noBlogsFound}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {langStrings.tryAnother}
              </Typography>
            </Box>
          )}
        </Container>
      </Box>
      {!shouldHideDownloadButton && <Footer showLanguageSwitcher />}
    </div>
  );
}
