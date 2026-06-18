'use client';

import { useState, useEffect, useRef, forwardRef } from 'react';
import { Box, Container } from '@mui/material';
import { track } from '@/app/utils/analytics';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useArticleStrings } from '@/app/lib/i18n/articleStrings';

const AIChatWidget = forwardRef(({ pageType, articleSlug, language }, ref) => {
  const { language: lang } = useLanguage();
  const t = useArticleStrings(lang);
  const [value, setValue] = useState('');
  const [hasTrackedVisibility, setHasTrackedVisibility] = useState(false);
  const [hasTrackedFocus, setHasTrackedFocus] = useState(false);
  const textareaRef = useRef(null);
  const widgetRef = useRef(null);

  // Combine refs for external access
  const setRefs = (element) => {
    widgetRef.current = element;
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      ref.current = element;
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 33 * 3;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [value]);

  // Visibility tracking via IntersectionObserver
  useEffect(() => {
    if (!widgetRef.current || hasTrackedVisibility) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedVisibility) {
            const scrollDepth = Math.round(
              (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            track('chat_widget_visible', {
              event_category: 'Conversion Funnel',
              page_type: pageType || 'unknown',
              article_slug: articleSlug || 'unknown',
              language: language || 'en',
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

    observer.observe(widgetRef.current);

    return () => observer.disconnect();
  }, [pageType, articleSlug, language, hasTrackedVisibility]);

  // Focus tracking handler
  const handleFocus = () => {
    if (!hasTrackedFocus) {
      track('chat_widget_focused', {
        event_category: 'Conversion Funnel',
        page_type: pageType || 'unknown',
        article_slug: articleSlug || 'unknown',
        language: language || 'en',
        is_mobile: window.innerWidth < 768
      });
      setHasTrackedFocus(true);
    }
  };

  const handleSend = () => {
    let trimmed = value.trim();
    const hasCustomMessage = trimmed.length > 0;
    if (!trimmed) trimmed = 'Hello August';

    // Track conversion event BEFORE redirect
    track('chat_widget_submit', {
      event_category: 'Conversion Funnel',
      page_type: pageType || 'unknown',
      article_slug: articleSlug || 'unknown',
      language: language || 'en',
      message_length: trimmed.length,
      has_custom_message: hasCustomMessage,
      is_mobile: window.innerWidth < 768
    });

    const encoded = encodeURIComponent(trimmed);
    const slug = encodeURIComponent(articleSlug || '');
    window.open(`/chat?msg=${encoded}&src=library&slug=${slug}`, '_self');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      ref={setRefs}
      sx={{
        py: { xs: 4, sm: 5, md: 6 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="md" sx={{ px: { xs: 0, sm: 2 } }}>
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{
            fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
            fontWeight: 300,
            fontSize: 'clamp(2rem, 4vw, 3.75rem)',
            lineHeight: 1.1,
            color: '#206E55',
            margin: 0,
            padding: 0,
          }}>
            Health Companion
            <br />
            trusted by{' '}
            <span style={{ fontWeight: 500 }}>6M</span> people
          </h2>
          <p style={{
            fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
            textAlign: 'center',
            fontSize: 'clamp(0.875rem, 1.2vw, 1.25rem)',
            color: '#111111',
            lineHeight: 1.6,
            margin: '16px 0 0 0',
          }}>
            Get clear medical guidance
            <br />
            on symptoms, medications, and lab reports.
          </p>
        </div>

        {/* Chat Input Box */}
        <Box
          sx={{
            width: '100%',
            maxWidth: '700px',
            mx: 'auto',
            borderRadius: { xs: '16px', sm: '24px' },
            border: '1px solid #E8EBEA',
            backgroundColor: '#fff',
            boxShadow: '0 45px 13px rgba(0,0,0,0), 0 29px 11px rgba(0,0,0,0), 0 16px 10px rgba(0,0,0,0.02), 0 7px 7px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Textarea area */}
          <Box
            sx={{
              width: '100%',
              p: { xs: '12px 12px 0 12px', sm: '16px 24px 0 24px' },
              boxSizing: 'border-box',
            }}
          >
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              onFocus={handleFocus}
              placeholder={` ${t.askAnything}`}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontFamily: 'Manrope, sans-serif',
                fontSize: '18px',
                fontWeight: 400,
                lineHeight: '30px',
                color: '#000',
                background: 'transparent',
                resize: 'none',
                overflow: 'auto',
                minHeight: '30px',
                maxHeight: '90px',
                boxSizing: 'border-box',
              }}
            />
          </Box>

          {/* Button row */}
          <Box
            sx={{
              width: '100%',
              p: { xs: '8px 12px 12px', sm: '12px 24px 16px' },
              display: 'flex',
              justifyContent: 'flex-end',
              boxSizing: 'border-box',
            }}
          >
            <button
              onClick={handleSend}
              style={{
                height: '48px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(to bottom, #2D9B77, #206E55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                flexShrink: 0,
                fontFamily: 'Manrope, sans-serif',
                fontSize: '16px',
                fontWeight: 800,
                color: 'white',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              <span>{t.askAugust}</span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.8597 0.0496118C12.5371 -0.187055 13.1877 0.463612 12.9511 1.14095L9.00107 12.4276C8.74441 13.1596 7.72441 13.2009 7.40974 12.4923L5.50374 8.20428L8.18641 5.52095C8.27473 5.42616 8.32281 5.3008 8.32053 5.17126C8.31824 5.04173 8.26576 4.91814 8.17416 4.82653C8.08255 4.73492 7.95896 4.68245 7.82942 4.68016C7.69989 4.67788 7.57452 4.72596 7.47974 4.81428L4.79641 7.49695L0.508407 5.59095C-0.20026 5.27561 -0.15826 4.25628 0.573074 3.99961L11.8597 0.0496118Z"
                  fill="white"
                />
              </svg>
            </button>
          </Box>

          <style jsx global>{`
            .ai-chat-widget textarea::placeholder {
              color: #A0A7A5;
            }
            textarea::-webkit-scrollbar {
              width: 6px;
            }
            textarea::-webkit-scrollbar-track {
              background: transparent;
            }
            textarea::-webkit-scrollbar-thumb {
              background: #D1D5D4;
              border-radius: 3px;
            }
            textarea::-webkit-scrollbar-thumb:hover {
              background: #A0A7A5;
            }
          `}</style>
        </Box>


      </Container>
    </Box>
  );
});

AIChatWidget.displayName = 'AIChatWidget';

export default AIChatWidget;
