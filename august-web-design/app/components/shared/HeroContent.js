'use client';
import { Box, Container, Typography } from '@mui/material';
import ShareButton from './ShareButton';

export default function HeroContent({ title, description, children, langStrings }) {
  return (
    <Box sx={{ backgroundColor: 'var(--lib-bg-primary, #f4f5f5)', py: 6 }}>
      <Container maxWidth="lg">
        {children}
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
            fontWeight: 600,
            letterSpacing: '-0.02em',
            mb: 3,
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            hyphens: 'auto'
          }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            variant="h6"
            sx={{
              color: 'var(--lib-text-secondary, #767f7c)',
              mb: 2,
              maxWidth: '800px',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}
          >
            {description}
          </Typography>
        )}
        <ShareButton copiedText={langStrings?.linkCopied || 'Link copied to clipboard'} />
      </Container>
    </Box>
  );
}
