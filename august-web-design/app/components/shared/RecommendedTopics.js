'use client';

import React from 'react';
import { Box, Container, Typography, Card, CardActionArea, CardContent } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Link from 'next/link';
import { getRedirectPath } from '@/app/utils/getRedirectPath';

export default function RecommendedTopics({ title = 'Recommended Topics', items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <Box sx={{ py: 6, backgroundColor: '#fff' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h2"
          align="center"
          sx={{
            fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
            fontWeight: 700,
            mb: 3,
            fontSize: {
              xs: '1.5rem',
              sm: '1.75rem',
              md: '2rem',
            },
            lineHeight: { xs: 1.25, sm: 1.2, md: 1.15 },
            color: '#1a1a1a',
          }}
        >
          {title}
        </Typography>

        <Box sx={{ maxWidth: 800, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map((item, idx) => (
            <Card key={idx} variant="outlined" sx={{
              borderRadius: '12px',
              backgroundColor: 'rgba(32, 110, 85, 0.03)',
              backdropFilter: 'saturate(180%) blur(20px)',
              WebkitBackdropFilter: 'saturate(180%) blur(20px)',
              border: '1px solid #E8EAE8',
              boxShadow: 'none',
            }}>
              <Link href={getRedirectPath(item.href)} style={{ textDecoration: 'none', color: 'inherit' }}>
                <CardActionArea sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif", fontWeight: 700, mb: 0.5, color: '#1a1a1a' }}>
                      {item.title}
                    </Typography>
                    {item.description && (
                      <Typography variant="body2" sx={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif", color: '#666' }}>
                        {item.description}
                      </Typography>
                    )}
                  </Box>
                  <ChevronRightIcon color="action" />
                </CardActionArea>
              </Link>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
