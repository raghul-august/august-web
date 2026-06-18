'use client';

import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box } from '@mui/material';
import { sanitizeAndSecureHtmlLinks } from '@/app/utils/sanitizeHtmlLinks';
import InlineFollowUp from './InlineFollowUp';
import ScrollReveal from './ScrollReveal';

function transformQuestionBank(questionBank) {
  if (!questionBank?.prompts) return null;
  const groups = {};
  for (const p of questionBank.prompts) {
    if (!groups[p.position]) groups[p.position] = [];
    groups[p.position].push({
      question: p.question,
      answer: p.answer,
      relatedQuestions: p.followup_question
        ? [{ question: p.followup_question, answer: p.followup_answer }]
        : [],
    });
  }
  return groups;
}

/**
 * Splits HTML by h2 headings and renders PAA blocks between sections.
 *
 * Matching:
 * - English: direct heading text match (position = English heading = page heading)
 * - Non-English: uses headingIndexMap stored in the question bank to map
 *   English heading positions to h2 indices, then matches by index
 *
 * Used by all article ViewClients.
 */
export default function SectionsWithPAA({ html, questionBank, articleName, pageType, articleSlug, language }) {
  const generationTriggered = useRef(false);
  const searchParams = useSearchParams();
  const isWebviewSource = searchParams?.get('source') === 'webview';

  // Trigger generation after 7 seconds if questionBank is missing
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isWebview = new URLSearchParams(window.location.search).get('source') === 'webview';
    if (isWebview || questionBank || generationTriggered.current || !pageType || !articleSlug) return;

    const timer = setTimeout(() => {
      generationTriggered.current = true;
      fetch('/api/question-bank/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: articleSlug, lang: language || 'en', contentType: pageType }),
      }).catch(() => {});
    }, 7000);

    return () => clearTimeout(timer);
  }, [questionBank, pageType, articleSlug, language]);

  if (!html) return null;

  // Don't show "People also asked" follow-up blocks in webview
  if (isWebviewSource) {
    return <div dangerouslySetInnerHTML={{ __html: sanitizeAndSecureHtmlLinks(html) }} />;
  }

  const questionGroups = transformQuestionBank(questionBank);

  // Split by h2 tags
  const parts = html.split(/(?=<h2[^>]*>)/i);
  const sections = parts.map(part => {
    const trimmed = part.trim();
    if (!trimmed) return null;
    const h2Match = trimmed.match(/<h2[^>]*>(.*?)<\/h2>/i);
    const heading = h2Match ? h2Match[1].replace(/<[^>]*>/g, '').trim() : null;
    return { heading, content: trimmed };
  }).filter(Boolean);

  if (sections.length <= 1 || !questionGroups) {
    return <div dangerouslySetInnerHTML={{ __html: sanitizeAndSecureHtmlLinks(html) }} />;
  }

  // Build h2 index -> questions map using headingIndexMap (for non-English support)
  const headingIndexMap = questionBank?.headingIndexMap || {};
  const indexToQuestions = {};
  for (const [position, questions] of Object.entries(questionGroups)) {
    const idx = headingIndexMap[position];
    if (idx !== undefined) {
      indexToQuestions[idx] = questions;
    }
  }
  const hasIndexMap = Object.keys(indexToQuestions).length > 0;

  const shown = new Set();
  let h2Count = 0;

  return (
    <>
      {sections.map((section, i) => {
        let questions = null;

        if (section.heading) {
          const currentH2Index = h2Count;
          h2Count++;

          // Try direct text match first (English)
          if (questionGroups[section.heading] && !shown.has(section.heading)) {
            questions = questionGroups[section.heading];
            shown.add(section.heading);
          }
          // Fall back to index match (non-English)
          else if (hasIndexMap && indexToQuestions[currentH2Index] && !shown.has(currentH2Index)) {
            questions = indexToQuestions[currentH2Index];
            shown.add(currentH2Index);
          }
        }

        return (
          <ScrollReveal key={i}>
            <div dangerouslySetInnerHTML={{ __html: sanitizeAndSecureHtmlLinks(section.content) }} />
            {questions && questions.length > 0 && (
              <InlineFollowUp questions={questions.slice(0, 2)} medName={articleName} pageType={pageType} articleSlug={articleSlug} language={language} />
            )}
          </ScrollReveal>
        );
      })}
    </>
  );
}
