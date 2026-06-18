'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { Box, Container, Typography, CircularProgress } from '@mui/material';
import { Navbar } from '@/app/components/website/Navbar';
import { Footer } from '@/app/components/website/Footer';
import DetailView from './DetailView';
import AIChatBanner from '@/app/components/AIChatBanner';
import AIChatWidget from '@/app/components/AIChatWidget';
import RecommendedTopics from './RecommendedTopics';
import FAQAccordion from './FAQAccordion';
import { getNextFiveBlogs } from '@/app/utils/recommendedBlogs';
import { articleBodySx } from './articleStyles';
import { stripBodyTag, extractFirstH1, extractFAQandRest, removeFirstH1, relocateLeadingImage } from '@/app/utils/htmlProcessing';
import { useSearchParams } from 'next/navigation';
import { useScrollReveal } from './ScrollReveal';
import SectionsWithPAA from './SectionsWithPAA';
import { useLanguageStrings } from '@/app/contexts/LanguageStringsContext';
import dynamic from 'next/dynamic';

const FirstTimeOverlayBanner = dynamic(
  () => import('@/app/components/FirstTimeOverlayBanner'),
  { ssr: false }
);

const BannerRenderer = dynamic(
  () => import('@/app/components/banners/BannerRenderer'),
  { ssr: false }
);

export default function ArticleViewClient({
  article,
  config,
  language,
  langStrings,
  metaTitle,
  metaDescription,
  error,
  articleImage,
  breadcrumbItems,
  questionBank,
  // optional props for specific types
  firstHeading: firstHeadingOverride,
  recommendedItems,
  currentSlug,
  bodyContent,
  isLoading,
}) {
  useScrollReveal();
  const chatWidgetRef = useRef(null);
  const [recommendedTopics, setRecommendedTopics] = useState([]);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();
  const isWebviewSource = searchParams?.get('source') === 'webview';

  // always call the hook (rules of hooks), but only act on it when config says so
  const { languageStrings, updateLanguageStrings } = useLanguageStrings();

  useEffect(() => {
    if (config.usesLanguageContext && language && langStrings && !languageStrings[language]) {
      updateLanguageStrings(language, langStrings);
    }
  }, [config.usesLanguageContext, language, langStrings, languageStrings, updateLanguageStrings]);

  // first-visit welcome banner
  useEffect(() => {
    setIsClient(true);
    if (isWebviewSource) return;
    const hasVisitedBefore = typeof window !== 'undefined' && localStorage?.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
      const timer = setTimeout(() => {
        setShowWelcomeBanner(true);
        localStorage?.setItem('hasVisitedBefore', 'true');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isWebviewSource]);

  // recommended topics
  useEffect(() => {
    if (recommendedItems && recommendedItems.length > 0 && currentSlug) {
      // dynamic recommendations (blog)
      const recs = getNextFiveBlogs(recommendedItems, currentSlug, 5);
      setRecommendedTopics(recs.map(r => ({
        title: r.title,
        description: r.description || r.excerpt || '',
        href: r.href || `/${language}/articles/${r.slug}`,
      })));
    } else if (config.getRecommendedTopics) {
      const allTopics = config.getRecommendedTopics(language, langStrings);
      const slug = article?.slug || '';
      setRecommendedTopics(getNextFiveBlogs(allTopics, slug, 5));
    }
  }, [article, language, langStrings, recommendedItems, currentSlug, config]);

  const scrollToChatWidget = () => {
    if (chatWidgetRef.current) {
      const pos = chatWidgetRef.current.getBoundingClientRect().top + window.pageYOffset;
      const offset = pos - (window.innerHeight / 2) + (chatWidgetRef.current.offsetHeight / 2);
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  // process HTML content
  const { processedHtml, faq } = useMemo(() => {
    if (!article) return { processedHtml: '', faq: [] };
    const rawHtml = article[config.htmlField];
    if (!rawHtml) return { processedHtml: '', faq: [] };
    const stripped = stripBodyTag(rawHtml);
    const { restHtml, faq } = extractFAQandRest(stripped);
    const withoutH1 = removeFirstH1(restHtml);
    const final = config.relocateImage ? relocateLeadingImage(withoutH1) : withoutH1;
    return { processedHtml: final, faq };
  }, [article, config.htmlField, config.relocateImage]);

  const firstHeading = useMemo(() => {
    if (firstHeadingOverride) return firstHeadingOverride;
    if (!article) return '';
    const rawHtml = article[config.htmlField];
    return extractFirstH1(stripBodyTag(rawHtml)) || article.title || article.name || '';
  }, [article, config.htmlField, firstHeadingOverride]);

  // loading state (blog)
  if (isLoading) {
    return (
      <div>
        {!isWebviewSource && <Navbar />}
        <Box sx={{ pt: 16, pb: { xs: 3, md: 4 }, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: { xs: '40vh', md: '50vh' } }}>
          <CircularProgress size={{ xs: 32, md: 40 }} />
        </Box>
        {!isWebviewSource && <Footer showLanguageSwitcher />}
      </div>
    );
  }

  // error state
  if (error || !article) {
    return (
      <div>
        {!isWebviewSource && <Navbar />}
        <Box sx={{ pt: 16, pb: { xs: 3, md: 4 } }}>
          <Container sx={{ px: { xs: 0, sm: 0, md: 0 } }}>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }, textAlign: { xs: 'center', md: 'left' } }}>
              {error || langStrings?.noMentalHealthFound || langStrings?.noBlogsFound || 'Not found'}
            </Typography>
          </Container>
        </Box>
        {!isWebviewSource && <Footer showLanguageSwitcher />}
      </div>
    );
  }

  // build data object that DetailView expects (needs meta.created_at for date display)
  const viewData = article.meta ? article : {
    ...article,
    meta: { created_at: article.published_at || article.created_at },
  };

  const articleSlug = article.slug || '';
  const articleTitle = article.title || article.name || config.articleNameFallback;
  const author = config.supportsAuthor && article.author_name
    ? { name: article.author_name, slug: article.author_slug }
    : null;

  return (
    <DetailView
      loading={false}
      error={error}
      firstHeading={firstHeading}
      data={viewData}
      metaTitle={metaTitle}
      metaDescription={metaDescription}
      langStrings={langStrings}
      isWebviewSource={isWebviewSource}
      hideFooter={isWebviewSource}
      articleImage={articleImage || article.image || null}
      contentSchema={article.content_schema}
      breadcrumbItems={breadcrumbItems}
      language={language}
      author={author}
    >
      <>
        {!isWebviewSource && isClient && showWelcomeBanner && (
          <FirstTimeOverlayBanner
            onClose={() => setShowWelcomeBanner(false)}
            language={language}
            langStrings={langStrings}
            pageType={config.pageType}
            articleSlug={articleSlug}
          />
        )}
        {!isWebviewSource && (
          <AIChatBanner
            onAskQuestion={scrollToChatWidget}
            displayText={config.supportsCta ? article.cta_display_text : undefined}
            pageType={config.pageType}
            articleSlug={articleSlug}
            language={language}
          />
        )}
        {!isWebviewSource && article.bannerKeys?.length > 0 && (
          <BannerRenderer
            bannerKeys={article.bannerKeys}
            pageType={config.pageType}
            articleSlug={articleSlug}
            language={language}
          />
        )}
        <Box sx={articleBodySx}>
          {bodyContent || (
            <SectionsWithPAA
              html={processedHtml}
              questionBank={questionBank}
              articleName={articleTitle}
              pageType={config.pageType}
              articleSlug={articleSlug}
              language={language}
            />
          )}
          <FAQAccordion faq={faq} articleTitle={articleTitle} />
        </Box>
        <div style={{ marginTop: 20, fontSize: 11, lineHeight: 1.5, color: '#aaa' }}>
          <span style={{ fontWeight: 600 }}>Medical Disclaimer:</span> This article is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare provider for diagnosis and treatment decisions. If you are experiencing a medical emergency, call 911 or go to the nearest emergency room immediately.
        </div>
        {!isWebviewSource && (
          <AIChatWidget
            ref={chatWidgetRef}
            pageType={config.pageType}
            articleSlug={articleSlug}
            language={language}
          />
        )}
        {!isWebviewSource && recommendedTopics.length > 0 && (
          <Box mt={4}>
            <RecommendedTopics
              title={langStrings?.[config.recommendedTitleKey] || config.recommendedTitleFallback}
              items={recommendedTopics}
            />
          </Box>
        )}
      </>
    </DetailView>
  );
}
