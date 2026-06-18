'use client';

import { Box, Typography, IconButton, Container } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import DetailView from '@/app/components/shared/DetailView';
import Image from 'next/image';
import { Navbar } from '@/app/components/website/Navbar';
import BreadcrumbNav from '@/app/components/shared/BreadcrumbNav';
import { Footer } from '@/app/components/website/Footer';


export default function AuthorViewClient({ 
  author, 
  error,
  breadcrumbItems,
  metaTitle,
  metaDescription,
  langStrings
}) {
  if (!author) {
    return null;
  }

  return (
    <div>

      <Navbar />
      <Box sx={{ bgcolor: 'grey.50', pt: 16, pb: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mt: 4 }}>
            <Box sx={{ 
              width: 200, 
              height: 200, 
              position: 'relative',
              borderRadius: '50%',
              overflow: 'hidden'
            }}>
              <Image
                src={author.image}
                alt={author.name}
                fill
                sizes="200px"
                style={{ objectFit: 'cover' }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h2" component="h1">
                {author.name}
              </Typography>
              {(author.credentials || author.designation) && (
                <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                  {[author.credentials, author.designation].filter(Boolean).join(', ')}
                </Typography>
              )}
              {author.linkedin && (
                <IconButton 
                  href={author.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Profile"
                  sx={{ 
                    color: '#0077b5',
                    width: 'fit-content',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 119, 181, 0.1)'
                    }
                  }}
                >
                  <LinkedInIcon fontSize="large" />
                </IconButton>
              )}
            </Box>
          </Box>
        </Container>
      </Box>
      <Box sx={{ py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            maxWidth: '800px',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            '& *': {
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }
          }}>
            {(author.description || '').split('\n\n').map((paragraph, index) => (
              <Typography key={index} variant="body1" paragraph>
                {paragraph}
              </Typography>
            ))}
          </Box>
        </Container>
      </Box>
      <Footer showLanguageSwitcher />
    </div>
  );
}