'use client';
import { useState } from 'react';
import { Box, Container, Typography, CircularProgress, Divider } from '@mui/material';
import Image from 'next/image';
import { Navbar } from '@/app/components/website/Navbar';
import ErrorView from './ErrorView';
import { Footer } from '@/app/components/website/Footer';

import ShareButton from './ShareButton';
import QRFloatingBanner from '../QRFloatingBanner';
import BreadcrumbNav from './BreadcrumbNav';
import Link from 'next/link';

export default function DetailView({
  loading,
  error,
  data,
  breadcrumbItems,
  children,
  metaTitle,
  metaDescription,
  langStrings,
  firstHeading,
  isWebviewSource = false,
  hideFooter = false,
  articleImage,
  contentSchema,
  language,
  author,
}) {
  const [imageError, setImageError] = useState(false);

  if (loading) {
    return (
      <div>
        {!isWebviewSource && <Navbar />}
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 16, pb: 8 }}>
          <CircularProgress />
        </Box>
      </div>
    );
  }

  if (error || !data) {
    return <ErrorView message={error} />;
  }

  const formattedDate = data.meta?.created_at
    ? new Date(data.meta.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div style={{ backgroundColor: '#fff' }}>
      <>
        {contentSchema && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contentSchema) }} />
        )}
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: breadcrumbItems.map((item, index) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  name: item.text,
                  ...(item.href ? { item: `https://www.meetaugust.ai${item.href}` } : {}),
                })),
              }),
            }}
          />
        )}
      </>
      {!isWebviewSource && <Navbar />}

      {/* Hero Image - above title */}
      {articleImage && !imageError && (
        <Box
          sx={{
            pt: isWebviewSource ? 0 : { xs: 10, md: 12 },
          }}
        >
          {/* Mobile: full-width, no container */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, position: 'relative', overflow: 'hidden' }}>
            <Image
              src={articleImage}
              alt={firstHeading || metaTitle || ''}
              width={768}
              height={268}
              priority
              sizes="100vw"
              onError={() => setImageError(true)}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '268px',
                objectFit: 'cover',
                objectPosition: 'center 70%',
                display: 'block',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '70%',
                background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.7) 60%, rgba(255,255,255,1) 85%)',
                pointerEvents: 'none',
              }}
            />
          </Box>
          {/* Desktop: bounded container */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Container maxWidth="md">
              <Box sx={{ maxWidth: '720px', margin: '0 auto' }}>
                <Box sx={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
                  <Image
                    src={articleImage}
                    alt={firstHeading || metaTitle || ''}
                    width={720}
                    height={280}
                    priority
                    sizes="(max-width: 768px) 100vw, 720px"
                    onError={() => setImageError(true)}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '280px',
                      objectFit: 'cover',
                      objectPosition: 'center 70%',
                      display: 'block',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '70%',
                      background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.7) 60%, rgba(255,255,255,1) 85%)',
                      pointerEvents: 'none',
                    }}
                  />
                </Box>
              </Box>
            </Container>
          </Box>
        </Box>
      )}

      {/* Article Header */}
      <Box
        sx={{
          mt: 0,
          pt: articleImage && !imageError ? 0 : (isWebviewSource ? { xs: 2, md: 3 } : { xs: 16, md: 16 }),
          position: 'relative',
          zIndex: 1,
          pb: 0,
          px: { xs: 1, md: 0 },
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              maxWidth: '720px',
              margin: '0 auto',
            }}
          >
            {/* Category label */}
            <Typography
              sx={{
                fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#206E55',
                mb: 2,
              }}
            >
              Health Library
            </Typography>

            {/* Title - Inter */}
            {firstHeading && (
              <Typography
                variant="h1"
                sx={{
                  fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                  fontWeight: 500,
                  lineHeight: 1.15,
                  color: '#1a1a1a',
                  mb: isWebviewSource ? 1.5 : 3,
                  letterSpacing: '-0.02em',
                }}
              >
                {firstHeading}
              </Typography>
            )}

            {/* Meta row: date + share */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                mb: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                {formattedDate && (
                  <Typography
                    sx={{
                      fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                      fontSize: '0.875rem',
                      color: '#666',
                      fontWeight: 500,
                    }}
                  >
                    {formattedDate}
                  </Typography>
                )}
                {language === 'en' && author?.name && author?.slug && (
                  <>
                    {formattedDate && (
                      <Typography sx={{ color: '#ccc', fontSize: '0.875rem' }}>·</Typography>
                    )}
                    <Typography
                      sx={{
                        fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                        fontSize: '0.875rem',
                        color: '#666',
                        fontWeight: 500,
                      }}
                    >
                      Written by{' '}
                      <Link
                        href={`/${language}/author/${author.slug}`}
                        style={{ color: '#206E55', textDecoration: 'none', fontWeight: 600 }}
                      >
                        {author.name}
                      </Link>
                    </Typography>
                  </>
                )}
              </Box>
              <ShareButton
                copiedText={langStrings?.linkCopied || 'Link copied to clipboard'}
                title={metaTitle}
                text={metaDescription}
              />
            </Box>

            {/* Divider */}
            <Divider sx={{ borderColor: '#206E55', borderWidth: '1px', mb: 0, opacity: 0.3 }} />

            {/* Breadcrumbs */}
            {!isWebviewSource && breadcrumbItems && breadcrumbItems.length > 0 && (
              <BreadcrumbNav items={breadcrumbItems} />
            )}
          </Box>
        </Container>
      </Box>

      {/* Article Body */}
      <Box
        sx={{
          pt: { xs: 2, md: 3 },
          pb: { xs: 6, md: 8 },
          px: { xs: 1, md: 0 },
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              maxWidth: '720px',
              margin: '0 auto',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              '& *': {
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
              },
            }}
          >
            {children}
          </Box>
        </Container>
      </Box>

      {!hideFooter && <Footer showLanguageSwitcher />}
      {!isWebviewSource && <QRFloatingBanner />}
    </div>
  );
}
