"use client";

import { useEffect, useRef } from "react";
import { landingStyles } from "../shared/landing-styles";
import { colors } from "@/app/utils/tools/tool-colors";
import QuestionScreen from "./QuestionScreen";
import {
  type GLP1Question,
  type GLP1AnswerValue,
} from "@/app/data/tools/glp1-coverage-questions";

interface SectionProgressItem {
  title: string;
  total: number;
  answered: number;
}

interface LandingScreenProps {
  currentQuestion: GLP1Question | undefined;
  answer: GLP1AnswerValue | undefined;
  onAnswer: (questionId: string, value: GLP1AnswerValue) => void;
  onNext: () => void;
  onBack: () => void;
  sectionTitle: string;
  questionNumber: number;
  totalInSection: number;
  totalAnswered: number;
  totalApplicableQuestions: number;
  isFirstOverall: boolean;
  isLastQuestion: boolean;
  isLoading: boolean;
  bmiData?: { bmi: number; category: string; weightToLose: number } | null;
  unitSystem: "imperial" | "metric";
  onToggleUnit: () => void;
  sectionProgress: SectionProgressItem[];
  currentSectionIndex: number;
  afterContent?: React.ReactNode;
}

const PAGE_BG = colors.bg;

// Scoped reveal hook - staggers .scroll-reveal children as they cross into view.
function useIntersectionReveal(rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const els = Array.from(root.querySelectorAll<HTMLElement>(".scroll-reveal"));
    const seenParents = new WeakMap<Element, number>();
    els.forEach((el) => {
      const parent = el.parentElement;
      if (!parent) return;
      const n = seenParents.get(parent) ?? 0;
      el.style.transitionDelay = `${Math.min(n, 3) * 0.12}s`;
      seenParents.set(parent, n + 1);
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.visible = "true";
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}


export default function LandingScreen(props: LandingScreenProps) {
  const {
    currentQuestion,
    answer,
    onAnswer,
    onNext,
    onBack,
    sectionTitle,
    questionNumber,
    totalInSection,
    totalAnswered,
    totalApplicableQuestions,
    isFirstOverall,
    isLastQuestion,
    isLoading,
    bmiData,
    unitSystem,
    onToggleUnit,
    sectionProgress,
    currentSectionIndex,
    afterContent,
  } = props;

  const progressPct =
    totalApplicableQuestions > 0
      ? Math.min(100, Math.round((totalAnswered / totalApplicableQuestions) * 100))
      : 0;

  const pageRef = useRef<HTMLDivElement>(null);
  useIntersectionReveal(pageRef);

  return (
    <>
      <div ref={pageRef} style={{ ...landingStyles.page, background: PAGE_BG }}>
        <section
          style={{
            ...landingStyles.heroSection,
            minHeight: 0,
            background: PAGE_BG,
          }}
        >
          <div
            style={{ ...landingStyles.heroOverlay, maxWidth: 1100 }}
            className="tl-hero-overlay"
          >
            <div style={landingStyles.heroCard}>
              <h1
                style={landingStyles.heroHeadline}
                className="tl-hero-headline text-balance scroll-reveal"
              >
                GLP-1 <span className="accent-gradient">Insurance Coverage</span> Check
              </h1>
              <p style={landingStyles.heroTagline} className="tl-hero-tagline scroll-reveal">
                See if your insurance is likely to cover GLP-1 medications.
              </p>
            </div>

            <div className="glp1-landing-quiz-card scroll-reveal">
              <aside
                className="glp1-card-progress"
                aria-label={`Quiz progress: ${totalAnswered} of ${totalApplicableQuestions} questions answered`}
              >
                <div className="glp1-landing-progress-header">
                  <span className="glp1-landing-progress-eyebrow">Coverage check</span>
                  <span className="glp1-landing-progress-count">
                    {isLoading ? totalApplicableQuestions : totalAnswered}/{totalApplicableQuestions}
                  </span>
                </div>
                <ol className="glp1-landing-progress-list">
                  {sectionProgress.map((s, i) => {
                    const isComplete = isLoading || i < currentSectionIndex || s.answered >= s.total;
                    const isCurrent = !isLoading && i === currentSectionIndex && s.answered < s.total;
                    const state = isComplete ? "complete" : isCurrent ? "current" : "upcoming";
                    return (
                      <li
                        key={s.title}
                        className={`glp1-landing-progress-item glp1-landing-progress-item--${state}`}
                      >
                        <span className="glp1-landing-progress-marker" aria-hidden>
                          {isComplete ? (
                            <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                              <path
                                d="M2.5 6.25L4.75 8.5L9.5 3.75"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : null}
                        </span>
                        <span className="glp1-landing-progress-label">{s.title}</span>
                        <span className="glp1-landing-progress-count-small">
                          {s.answered} of {s.total}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </aside>

              <div className="glp1-card-divider" aria-hidden />

              <div className="glp1-card-main">
                <div
                  className="glp1-progress glp1-progress--mobile-only"
                  role="progressbar"
                  aria-valuenow={isLoading ? 100 : progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Quiz progress: ${totalAnswered} of ${totalApplicableQuestions} questions answered`}
                >
                  <div
                    className="glp1-progress-fill"
                    style={{ width: `${isLoading ? 100 : progressPct}%` }}
                  />
                </div>
                {isLoading ? (
                  <div className="glp1-inline-loading" role="status" aria-live="polite">
                    <span className="glp1-inline-loading-spinner" aria-hidden />
                    <div className="glp1-inline-loading-text">
                      <div className="glp1-inline-loading-title">Reviewing your coverage</div>
                      <div className="glp1-inline-loading-sub">Preparing your personalized estimate</div>
                    </div>
                  </div>
                ) : (
                  currentQuestion && (
                    <QuestionScreen
                      question={currentQuestion}
                      answer={answer}
                      onAnswer={onAnswer}
                      onNext={onNext}
                      onBack={onBack}
                      sectionTitle={sectionTitle}
                      questionNumber={questionNumber}
                      totalInSection={totalInSection}
                      isFirstOverall={isFirstOverall}
                      isLastQuestion={isLastQuestion}
                      bmiData={bmiData}
                      unitSystem={unitSystem}
                      onToggleUnit={onToggleUnit}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </section>
        
        <div style={landingStyles.contentWrapper}>
          {afterContent}
        </div>
      </div>
    </>
  );
}
