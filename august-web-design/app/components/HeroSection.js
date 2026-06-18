'use client';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import SearchBar from './SearchBar';
import AlphabetGrid from './AlphabetGrid';

export default function HeroSection({ 
  title, 
  description, 
  searchPlaceholder,
  indices,
  browseByLetterText,
  baseUrl,
  tags
}) {
  return (
    <Box 
      sx={{ 
        backgroundColor: 'var(--lib-bg-primary, #f4f5f5)',
        pt: 16,
        pb: { xs: 4, sm: 5, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 3, sm: 4, md: 6 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              sx={{
                fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#088F7B',
                mb: 1.5,
              }}
            >
              Health Library
            </Typography>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: 'var(--lib-text-primary, #111111)',
                mb: { xs: 2, sm: 3 },
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'var(--lib-text-secondary, #767f7c)',
                mb: { xs: 3, sm: 4 },
                fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' }
              }}
            >
              {description}
            </Typography>
            <SearchBar placeholder={searchPlaceholder} indices={indices} tags={tags} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ 
              backgroundColor: 'white',
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              boxShadow: 'var(--lib-shadow-subtle)',
              border: '1px solid var(--lib-border, #E8EAE8)'
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                  fontWeight: 600,
                  mb: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                {browseByLetterText}
              </Typography>
              <AlphabetGrid baseUrl={baseUrl} />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
