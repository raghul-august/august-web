'use client';

import { useState, useRef, useEffect } from 'react';
import { Box, Typography, Collapse } from '@mui/material';
import { useArticleStrings } from '@/app/lib/i18n/articleStrings';
import { track } from '@/app/utils/analytics';

const font = "var(--font-manrope), 'Manrope', sans-serif";
const green = '#206E55';

function ChevronDown({ open }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        flexShrink: 0,
      }}
    >
      <path d="M3 5L7 9L11 5" stroke={open ? green : '#bbb'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRight({ color = green, size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M2.5 6h7M6.5 3L9.5 6l-3 3" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


/**
 * Question row — answer only, no per-question gate.
 */
function QuestionRow({ question, answer, isNew, isFollowUp, open, onToggle, onFirstOpen }) {
  const [hasOpened, setHasOpened] = useState(false);

  const handleToggle = () => {
    if (!open && !hasOpened) {
      setHasOpened(true);
      onFirstOpen?.();
    }
    onToggle();
  };

  return (
    <Box
      sx={{
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        overflow: 'hidden',
        animation: isNew
          ? (isFollowUp ? 'followUpSlide 0.5s cubic-bezier(0.16, 1, 0.3, 1), followUpHighlight 1.2s ease-out' : 'questionSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)')
          : 'none',
        '@keyframes questionSlideIn': {
          from: { opacity: 0, transform: 'translateY(6px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '@keyframes followUpSlide': {
          from: { opacity: 0, maxHeight: 0 },
          to: { opacity: 1, maxHeight: '120px' },
        },
        '@keyframes followUpHighlight': {
          '0%': { backgroundColor: 'rgba(32, 110, 85, 0.08)' },
          '100%': { backgroundColor: 'transparent' },
        },
      }}
    >
      <Box
        component="button"
        onClick={handleToggle}
        aria-expanded={open}
        sx={{
          all: 'unset',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          width: '100%',
          boxSizing: 'border-box',
          py: '12px',
          px: { xs: '12px', md: '16px' },
          textAlign: 'left',
          transition: 'background 0.15s ease',
          '&:hover': { background: 'rgba(32, 110, 85, 0.02)' },
        }}
      >
        <Box
          sx={{
            flex: 1,
            fontFamily: font,
            fontSize: '0.95rem',
            fontWeight: open ? 600 : 450,
            lineHeight: 1.5,
            color: green,
            transition: 'color 0.15s',
          }}
        >
          {question}
        </Box>
        <ChevronDown open={open} />
      </Box>

      <Collapse in={open} timeout={280}>
        <Typography
          sx={{
            fontFamily: font,
            fontSize: '0.8rem',
            lineHeight: 1.55,
            color: '#666',
            px: { xs: '12px', md: '16px' },
            pb: '10px',
          }}
        >
          {answer}
        </Typography>
      </Collapse>
    </Box>
  );
}

/**
 * Typewriter placeholder that cycles through CTAs.
 */
function TypewriterPlaceholder({ placeholders }) {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const current = placeholders[textIndex];

    if (paused) {
      const timer = setTimeout(() => {
        setPaused(false);
        setDeleting(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (deleting) {
      if (charIndex === 0) {
        setDeleting(false);
        setTextIndex((prev) => (prev + 1) % placeholders.length);
        return;
      }
      const timer = setTimeout(() => setCharIndex((c) => c - 1), 30);
      return () => clearTimeout(timer);
    }

    if (charIndex < current.length) {
      const timer = setTimeout(() => setCharIndex((c) => c + 1), 60);
      return () => clearTimeout(timer);
    }

    // Finished typing — pause
    setPaused(true);
  }, [charIndex, deleting, paused, textIndex]);

  const displayed = placeholders[textIndex].substring(0, charIndex);

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        fontFamily: font,
        fontSize: '0.9rem',
        color: '#bbb',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {displayed}
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          width: '1.5px',
          height: '1.1em',
          background: '#bbb',
          ml: '1px',
          animation: 'cursorBlink 0.8s step-end infinite',
          '@keyframes cursorBlink': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0 },
          },
        }}
      />
    </Box>
  );
}

/**
 * Detached ask input with typewriter placeholder.
 */
function AskInput({ medName, pageType, articleSlug, t }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const translatedPlaceholders = [t.haveAQuestion, t.stillConfused, t.cantFindAnswer, t.notWhatYouWereLooking];
  const active = value.trim().length > 0;

  const handleSubmit = () => {
    if (!active) return;
    const question = value.trim();
    track('paa_input_submitted', {
      page_type: pageType || 'unknown',
      article_slug: articleSlug || 'unknown',
      question_length: question.length,
    });
    const context = `Hi August, I was reading a ${pageType || 'health'} article on ${medName || 'this topic'}. I have a question: ${question}`;
    const slug = encodeURIComponent(articleSlug || '');
    const url = `/chat?msg=${encodeURIComponent(context)}&src=library&slug=${slug}`;
    window.open(url, '_self');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Box sx={{ mt: '16px', mb: '8px' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: `1.5px solid ${active ? green : 'rgba(32, 110, 85, 0.2)'}`,
          borderRadius: '12px',
          py: '10px',
          px: '14px',
          background: '#fff',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          boxShadow: active ? '0 0 0 3px rgba(32, 110, 85, 0.08)' : 'none',
          '&:focus-within': {
            borderColor: green,
            boxShadow: '0 0 0 3px rgba(32, 110, 85, 0.08)',
          },
        }}
      >
        <Box sx={{ flex: 1, position: 'relative' }}>
          {!value && !focused && <TypewriterPlaceholder placeholders={translatedPlaceholders} />}
          <Box
            component="input"
            type="text"
            placeholder={focused ? `${t.askAbout} ${medName || ''}...` : ''}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => {
              setFocused(true);
              track('paa_input_focused', {
                page_type: pageType || 'unknown',
                article_slug: articleSlug || 'unknown',
              });
            }}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            sx={{
              all: 'unset',
              width: '100%',
              fontFamily: font,
              fontSize: '0.9rem',
              color: '#1a1a1a',
              position: 'relative',
              zIndex: 1,
              '&::placeholder': {
                color: '#bbb',
              },
            }}
          />
        </Box>
        <Box
          component="button"
          onClick={handleSubmit}
          sx={{
            all: 'unset',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: active ? 'pointer' : 'default',
            width: 34,
            height: 34,
            borderRadius: '10px',
            background: active ? green : 'rgba(32, 110, 85, 0.08)',
            transition: 'all 0.2s ease',
            flexShrink: 0,
            ...(active && {
              '&:hover': {
                background: '#1a5a46',
                transform: 'scale(1.05)',
              },
            }),
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke={active ? '#fff' : green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={active ? '#fff' : green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Box>
      </Box>
    </Box>
  );
}

/**
 * People also ask — integrated into article flow.
 * - Accordion: only one question open at a time
 * - Progressive injection: opening a question adds related questions below it
 * - Input field at bottom for personalized questions
 */
export default function InlineFollowUp({ questions, medName, pageType, articleSlug, language }) {
  const t = useArticleStrings(language || 'en');
  const initial = (questions || []).filter((q) => !q.isCTA).map((q) => ({ ...q, isNew: false, isFollowUp: false }));
  const [visibleQuestions, setVisibleQuestions] = useState(initial);
  const [expandedQ, setExpandedQ] = useState(null);
  const openedSet = useRef(new Set());
  const blockRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!blockRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          track('paa_block_visible', {
            page_type: pageType || 'unknown',
            article_slug: articleSlug || 'unknown',
          });
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(blockRef.current);
    return () => observer.disconnect();
  }, [pageType, articleSlug]);

  if (initial.length === 0) return null;

  const handleToggle = (q) => {
    const isOpening = expandedQ !== q.question;
    setExpandedQ(isOpening ? q.question : null);
    if (isOpening) {
      openedSet.current.add(q.question);
      track('paa_question_expanded', {
        page_type: pageType || 'unknown',
        article_slug: articleSlug || 'unknown',
        question: q.question,
        is_followup: !!q.isFollowUp,
      });
    }
  };

  const handleFirstOpen = (q) => {
    if (!q.relatedQuestions?.length) return;
    setVisibleQuestions((prev) => {
      const existingSet = new Set(prev.map((vq) => vq.question));
      const toAdd = q.relatedQuestions.filter((rq) => !existingSet.has(rq.question));
      if (!toAdd.length) return prev;
      track('paa_followup_injected', {
        page_type: pageType || 'unknown',
        article_slug: articleSlug || 'unknown',
        parent_question: q.question,
      });
      const insertAt = prev.findIndex((vq) => vq.question === q.question) + 1;
      const next = [...prev];
      next.splice(insertAt, 0, ...toAdd.map((rq) => ({ ...rq, isNew: true, isFollowUp: true })));
      return next;
    });
  };

  return (
    <Box
      ref={blockRef}
      sx={{
        my: { xs: '16px', md: '24px' },
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <Typography
        sx={{
          fontFamily: font,
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.09em',
          textTransform: 'uppercase',
          color: green,
          opacity: 0.5,
          mb: '4px',
        }}
      >
        {t.peopleAlsoAsk}
      </Typography>

      {visibleQuestions.map((q) => (
        <QuestionRow
          key={q.question}
          question={q.question}
          answer={q.answer}
          isNew={q.isNew}
          isFollowUp={q.isFollowUp}
          open={expandedQ === q.question}
          onToggle={() => handleToggle(q)}
          onFirstOpen={() => handleFirstOpen(q)}
        />
      ))}

      <AskInput medName={medName} pageType={pageType} articleSlug={articleSlug} visible={isVisible} t={t} />
    </Box>
  );
}
