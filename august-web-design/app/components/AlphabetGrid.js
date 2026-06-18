'use client';
import { Grid, Box, Typography } from '@mui/material';
import Link from 'next/link';
import { usePathname} from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import languageAlphabets from '../contexts/LanguageAlphabets';
import { getRedirectPath } from '@/app/utils/getRedirectPath';


function decodeURIComponentHelper(str) {
  return decodeURIComponent(str);
}


export default function AlphabetGrid({ baseUrl = '' }) {
    const pathname = usePathname();
  const resp = useLanguage();
  const lang=resp.language;
  //const lang = searchParams.get('lang') || 'en';
  const alphabet = languageAlphabets[lang] || languageAlphabets.en;
  
  return (
    <Grid container spacing={{ xs: 0.5, sm: 1 }}>
      {alphabet.map((letter) => (
        <Grid item xs={3} sm={2} key={letter}>
          <Link
            href={getRedirectPath(`${baseUrl}/index/${decodeURIComponentHelper(letter).toLowerCase()}`)} // Use the correct API URL and keep the lang query
            style={{ textDecoration: 'none' }}
          >
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '12px',
                p: { xs: 0.5, sm: 1 },
                textAlign: 'center',
                transition: 'all 0.2s',
                '&:hover, &:active': {
                  backgroundColor: '#206E55',
                  color: 'white',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                },
                cursor: 'pointer',
                '@media (hover: none)': {
                  '&:hover': {
                    boxShadow: 'none',
                  }
                }
              }}
            >
              <Typography 
                variant="h6"
                sx={{
                  fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                  fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }
                }}
              >
                {letter}
              </Typography>
            </Box>
          </Link>
        </Grid>
      ))}
    </Grid>
  );
}
