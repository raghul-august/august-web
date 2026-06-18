'use client';
import { Typography, Box, Grid, Container } from '@mui/material';
import CategoryCard from './CategoryCard';

export default function CategorySection({ title, description, items }) {
  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h2"
          sx={{ mb: 2, fontWeight: 'bold', fontFamily: "var(--font-manrope), 'Manrope', sans-serif", letterSpacing: '-0.02em' }}
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          sx={{ mb: 4, color: 'var(--lib-text-secondary, #767f7c)', maxWidth: '800px' }}
        >
          {description}
        </Typography>
        <Grid container spacing={3}>
          {items.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <CategoryCard {...item} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
} 