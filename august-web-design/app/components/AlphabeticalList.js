'use client';
import React, { useState, useMemo } from 'react'; // Import useMemo
import { Box, Typography, List, ListItem, Divider, Pagination, Stack } from '@mui/material';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { getRedirectPath } from '@/app/utils/getRedirectPath';
const logger = require('../utils/logger');

export default function AlphabeticalList({ items, letter, section, pagination, onPageChange }) {
  const { language } = useLanguage();
  const decodedLetter = decodeURIComponent(letter);

  const handlePageChange = async (event, value) => {
    logger.info('Changing page to:', value);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (onPageChange) {
      await onPageChange(value);
    }
  };

  const getViewUrl = (item) => {
    if (item.href) {
      return `/${language}${item.href}`;
    }
    return `/${language}/${section}/${item.slug}`;
  };

  // Calculate the height based on the number of items.
  const containerHeight = useMemo(() => {
    const baseHeight = 50; // Minimum height for an empty list
    const itemHeight = 81;  // Estimated height per item
    const padding = 20; //Padding around items to increase visual space

    return Math.max(baseHeight, items.length * itemHeight); // Ensure a minimum height
  }, [items]);

  return (
    <Box>
      <Typography
        variant="h4"
        component="h2"
        sx={{
          mb: 3,
          fontWeight: 'bold',
          fontFamily: "var(--font-manrope), 'Manrope', sans-serif"
        }}
      >
        {decodedLetter.toUpperCase()}
      </Typography>
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: '16px',
          boxShadow: 'var(--lib-shadow-subtle)',
          border: '1px solid var(--lib-border, #E8EAE8)',
          mt: 2,
          mb: 4,
          height: `${containerHeight}px`, // Use calculated height here
          overflowY: 'auto' // Add scroll if needed
        }}
      >
        {items.map((item, index) => (
          <Box key={item.id}>
            <Box
              sx={{
                p: 3,
                borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <Link
                href={getRedirectPath(getViewUrl(item))}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block',
                  width: '100%'
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                    '&:hover': {
                      color: 'primary.main',
                    }
                  }}
                >
                  {item.name || item.title}
                </Typography>
                {item.short_description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {item.short_description}
                  </Typography>
                )}
              </Link>
            </Box>
          </Box>
        ))}
      </Box>
      <Box sx={{
        bgcolor: 'white',
        borderRadius: 1,
        border: '1px solid rgba(0, 0, 0, 0.12)',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        mt: 3
      }}>
        <Stack
          spacing={2}
          alignItems="center"
          sx={{
            py: 3,
            px: 2,
            maxWidth: '1200px',
            margin: '0 auto'
          }}
        >
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            siblingCount={1}
            boundaryCount={1}
            sx={{
              '& .MuiPaginationItem-root': {
                fontSize: '1.1rem',
                minWidth: 40,
                height: 40,
                margin: '0 4px',
                borderRadius: '24px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.12)',
                  transform: 'scale(1.1)'
                }
              },
              '& .Mui-selected': {
                fontWeight: 'bold',
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'scale(1.1)'
                }
              },
              '& .MuiPaginationItem-page': {
                border: '1px solid rgba(0, 0, 0, 0.23)',
                '&:hover': {
                  borderColor: 'primary.main'
                }
              }
            }}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontWeight: 500,
              fontSize: '0.95rem',
              color: 'text.secondary',
              padding: '6px 12px',
              bgcolor: 'rgba(0, 0, 0, 0.04)',
              borderRadius: '16px',
              display: 'inline-block'
            }}
          >
            Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} items
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
