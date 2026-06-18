'use client';
import { Box, Typography } from '@mui/material';
import Link from 'next/link';
import { getRedirectPath } from '@/app/utils/getRedirectPath';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function BreadcrumbNav({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <Box
      component="nav"
      aria-label="breadcrumb"
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'nowrap',
        gap: 0.5,
        overflow: 'hidden',
        pt: { xs: 1, md: 1.5 },
        pb: 0,
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: isLast ? 1 : 0, minWidth: isLast ? 0 : 'auto' }}>
            {index > 0 && (
              <NavigateNextIcon
                sx={{
                  fontSize: '0.875rem',
                  color: '#999',
                }}
              />
            )}
            {isLast ? (
              <Typography
                sx={{
                  fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: '#666',
                  lineHeight: 1.4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: { xs: '180px', md: '300px' },
                }}
              >
                {item.text}
              </Typography>
            ) : (
              <Link
                href={getRedirectPath(item.href)}
                passHref
                style={{ textDecoration: 'none' }}
              >
                <Typography
                  sx={{
                    fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: '#206E55',
                    lineHeight: 1.4,
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {item.text}
                </Typography>
              </Link>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
