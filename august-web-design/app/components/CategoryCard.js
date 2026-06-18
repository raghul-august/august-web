'use client';
import { Card, CardContent, Typography, CardActionArea } from '@mui/material';
import Link from 'next/link';
import { getRedirectPath } from '@/app/utils/getRedirectPath';

export default function CategoryCard({ title, description, href }) {
  return (
    <Link href={getRedirectPath(href)} style={{ textDecoration: 'none' }}>
      <Card 
        sx={{ 
          height: '100%',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 'var(--lib-shadow-card)',
          },
          borderRadius: '16px',
          backgroundColor: '#fff',
          padding: '24px 16px',
          boxShadow: 'var(--lib-shadow-subtle)',
          border: '1px solid var(--lib-border, #E8EAE8)',
        }}
      >
        <CardActionArea sx={{ height: '100%' }}>
          <CardContent>
            <Typography gutterBottom variant="h6" component="h3" sx={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif", fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif" }}>
              {description}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Link>
  );
} 