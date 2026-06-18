'use client';

import { useRef, useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { track } from '@/app/utils/analytics';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useArticleStrings } from '@/app/lib/i18n/articleStrings';

export default function AIChatBanner({ onAskQuestion, displayText, pageType, articleSlug, language }) {
  const { language: lang } = useLanguage();
  const t = useArticleStrings(lang);
  const bannerRef = useRef(null);
  const [hasTrackedVisibility, setHasTrackedVisibility] = useState(false);

  // Visibility tracking via IntersectionObserver
  useEffect(() => {
    if (!bannerRef.current || hasTrackedVisibility) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedVisibility) {
            const scrollDepth = Math.round(
              (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            track('chat_banner_visible', {
              event_category: 'Conversion Funnel',
              page_type: pageType || 'unknown',
              article_slug: articleSlug || 'unknown',
              language: language || 'en',
              display_text: displayText || 'default',
              scroll_depth_percent: scrollDepth,
              is_mobile: window.innerWidth < 768
            });

            setHasTrackedVisibility(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(bannerRef.current);

    return () => observer.disconnect();
  }, [pageType, articleSlug, language, displayText, hasTrackedVisibility]);

  // Click handler with tracking
  const handleAskQuestionClick = () => {
    track('ask_question_clicked', {
      event_category: 'Conversion Funnel',
      page_type: pageType || 'unknown',
      article_slug: articleSlug || 'unknown',
      language: language || 'en',
      display_text: displayText || 'default',
      is_mobile: window.innerWidth < 768
    });

    if (onAskQuestion) {
      onAskQuestion();
    }
  };

  return (
    <Box
      ref={bannerRef}
      sx={{
        maxWidth: '800px',
        margin: '0.75rem auto 2rem',
        backgroundColor: 'rgba(26, 85, 66, 0.05)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderRadius: '16px',
        p: { xs: 2, sm: 3 },
        border: '1px solid rgba(32, 110, 85, 0.08)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        justifyContent: 'space-between'
      }}
    >
      <Typography
        variant="body1"
        sx={{
          fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
          color: '#1a1a1a',
          fontSize: { xs: '1rem', sm: '1.1rem' },
          fontWeight: 700,
          textAlign: { xs: 'center', sm: 'left' }
        }}
      >
        {displayText || t.questionOnTopic}
      </Typography>
      <Button
        variant="contained"
        onClick={handleAskQuestionClick}
        size="large"
        sx={{
          fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
          backgroundColor: '#206E55',
          '&:hover': {
            backgroundColor: '#1a5a46'
          },
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          px: 4,
          py: 1.5,
          borderRadius: '100px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          minWidth: { xs: '100%', sm: 'auto' },
          whiteSpace: 'nowrap'
        }}
      >
        {t.askQuestion}
      </Button>
    </Box>
  );
}
