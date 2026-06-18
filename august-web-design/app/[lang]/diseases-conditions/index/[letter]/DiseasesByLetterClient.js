'use client';
const logger = require('@/app/utils/logger');
import { useState } from 'react';
import { Navbar } from '@/app/components/website/Navbar';
import AlphabeticalList from '@/app/components/AlphabeticalList';
import AlphabetGrid from '@/app/components/AlphabetGrid';
import { Box, Container, Typography, Grid } from '@mui/material';
import SearchBar from '@/app/components/SearchBar';
import { Footer } from '@/app/components/website/Footer';

import { fetchByLetter } from '@/app/lib/api';
import { useSearchParams } from 'next/navigation';

function decodeLetter(letter) {
  try {
    return decodeURIComponent(letter);
  } catch (e) {
    logger.error("Failed to decode URI Component", letter, e);
    return letter;
  }
}

export default function DiseasesByLetterClient({ 
  initialData, 
  letter, 
  language, 
  metaIndexTitle, 
  metaDescription, 
  langStrings, 
  error,
  isWebviewSource: hideDownloadButtonFromServer = false,
}) {
  const [conditions, setConditions] = useState(initialData.items);
  const [pagination, setPagination] = useState(initialData.pagination);
  const decodedLetter = decodeLetter(letter);
  logger.info('Client Component Conditions:', conditions);
  const searchParams = useSearchParams();
  const shouldHideDownloadButton =
    hideDownloadButtonFromServer || searchParams.get('source') === 'webview';

  const handlePageChange = async (page) => {
    try {
      const data = await fetchByLetter('diseases-conditions', letter, language, page);
      setConditions(data.items);
      setPagination(data.pagination);
    } catch (error) {
      logger.error('Error fetching page:', error);
    }
  };

  return (
    <div>

      <Navbar isWebviewSource={shouldHideDownloadButton} />
      
      {/* Hero Section */}
      <Box 
        sx={{ 
          backgroundColor: 'var(--lib-bg-primary, #f4f5f5)',
          pt: 16,
          pb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom
                sx={{
                  fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  mb: 3
                }}
              >
                {langStrings.title}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{
                  color: 'var(--lib-text-secondary, #767f7c)',
                  mb: 4
                }}
              >
                {langStrings.description}
              </Typography>
              <SearchBar 
                placeholder={langStrings.searchPlaceholder} 
                indices={{
                  health_library: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'Health_Library',
                }}
                tags={['health_library', 'conditions']} 
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
                <Typography
                  variant="h6"
                  sx={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif", fontWeight: 600, mb: 2 }}
                >
                  {langStrings.browseByLetter}
                </Typography>
                <AlphabetGrid baseUrl={`/${language}/diseases-conditions`} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Alphabetical List Section */}
      <Box 
        sx={{ 
          backgroundColor: 'white',
          py: 4
        }}
      >
        <Container maxWidth="lg">
        {conditions.length > 0 ? (
      <AlphabeticalList 
        items={conditions} 
        letter={letter}
        section="diseases-conditions"
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    ) : (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {langStrings.noConditionsFoundMessage} {/* Use the pre-computed message */}
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
