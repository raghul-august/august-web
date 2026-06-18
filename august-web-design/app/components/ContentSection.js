'use client';
import { Box, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';

export default function ContentSection({ sections }) {
  return (
    <Box>
      {sections.map((section, index) => (
        <Box 
          key={index} 
          sx={{ 
            mb: index < sections.length - 1 ? 6 : 0
          }}
        >
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              mb: 3,
              mt: index > 0 ? 4 : 0
            }}
          >
            {section.heading}
          </Typography>
          <Box 
            sx={{
              '& p': {
                mb: 2,
                lineHeight: 1.7,
              },
              '& ul, & ol': {
                mt: 1,
                mb: 2,
                pl: 4,
              },
              '& li': {
                mb: 1,
                listStyle: 'disc',
              },
              '& a': {
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                }
              }
            }}
          >
            <ReactMarkdown>
              {section.content}
            </ReactMarkdown>
          </Box>
        </Box>
      ))}
    </Box>
  );
} 