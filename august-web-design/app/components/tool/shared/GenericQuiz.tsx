"use client";

import { ReactNode, Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import { track, trackToolEvent } from "@/app/utils/analytics";
import { useQuizState } from "./hooks/useQuizState";
import { useAutoAdvance } from "./hooks/useAutoAdvance";
import { useQuestionTimer } from "./hooks/useQuestionTimer";
import QuizSuspenseFallback from "./QuizSuspenseFallback";

interface QuizToolConfig<
  TQuestion,
  TResult extends { score: number; tier: { id: string } },
> {
  toolId: string;
  startedEventName: string;
  startedEventCategory: string;
  answeredEventName: string;
  answeredEventCategory: string;
  questions: readonly TQuestion[];
  totalQuestions: number;
  computeResult: (answers: Record<number, number>) => TResult;
  scoreBucket: (score: number) => string;
  getQuestionId: (q: TQuestion) => number;
  extraAnswerTracking?: (question: TQuestion, value: number) => Record<string, unknown>;
  extraCompletionTracking?: (result: TResult) => Record<string, unknown>;
  renderLanding: (props: {
    onStartTest: () => void;
    totalQuestions: number;
    afterContent?: ReactNode;
  }) => ReactNode;
  renderQuestion: (props: {
    question: TQuestion;
    currentIndex: number;
    totalQuestions: number;
    selectedAnswer: number | null;
    onAnswer: (v: number) => void;
    onBack: () => void;
  }) => ReactNode;
  ResultsScreen: React.LazyExoticComponent<
    React.ComponentType<{ result: TResult; onRestart: () => void }>
  >;
}

interface GenericQuizProps<
  TQuestion,
  TResult extends { score: number; tier: { id: string } },
> {
  config: QuizToolConfig<TQuestion, TResult>;
  afterContent?: ReactNode;
}

export default function GenericQuiz<
  TQuestion,
  TResult extends { score: number; tier: { id: string } },
>({ config, afterContent }: GenericQuizProps<TQuestion, TResult>): ReactNode {
  const {
    screen,
    setScreen,
    currentIndex,
    setCurrentIndex,
    answers,
    setAnswers,
    handleBack,
    handleRestart,
  } = useQuizState<number>();
  const timer = useQuestionTimer();
  const hasViewedRef = useRef(false);
  const completedRef = useRef<string>("");

  useEffect(() => {
    if (hasViewedRef.current) return;
    hasViewedRef.current = true;
    trackToolEvent(config.toolId, "viewed");
  }, [config.toolId]);

  const advance = useAutoAdvance(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= config.totalQuestions) {
      setScreen("results");
    } else {
      setCurrentIndex(nextIndex);
    }
    timer.reset();
  }, 300);

  const handleStartTest = useCallback(() => {
    track(config.startedEventName, {
      event_category: config.startedEventCategory,
      total_questions: config.totalQuestions,
    });
    trackToolEvent(config.toolId, "started");
    setAnswers({});
    setCurrentIndex(0);
    timer.reset();
    setScreen("question");
  }, [config, setAnswers, setCurrentIndex, setScreen, timer]);

  const handleAnswer = useCallback(
    (value: number) => {
      const question = config.questions[currentIndex];
      const timeSpentSeconds = timer.getElapsedSeconds();
      const extraFields = config.extraAnswerTracking?.(question, value) ?? {};

      track(config.answeredEventName, {
        event_category: config.answeredEventCategory,
        question_number: config.getQuestionId(question),
        answer_value: value,
        total_answered: Object.keys(answers).length + 1,
        time_spent_seconds: timeSpentSeconds,
        ...extraFields,
      });

      setAnswers((prev) => ({ ...prev, [config.getQuestionId(question)]: value }));
      advance();
    },
    [config, currentIndex, answers, setAnswers, advance, timer],
  );

  const result = useMemo<TResult>(
    () => config.computeResult(answers),
    [config, answers],
  );

  useEffect(() => {
    if (screen !== "results") return;
    const sig = `${config.scoreBucket(result.score)}|${result.tier.id}`;
    if (sig === completedRef.current) return;
    completedRef.current = sig;
    const extraFields = config.extraCompletionTracking?.(result) ?? {};
    trackToolEvent(config.toolId, "completed", {
      score: result.score,
      score_bucket: config.scoreBucket(result.score),
      tier: result.tier.id,
      ...extraFields,
    });
  }, [config, screen, result]);

  if (screen === "question") {
    const question = config.questions[currentIndex];
    return config.renderQuestion({
      question,
      currentIndex,
      totalQuestions: config.totalQuestions,
      selectedAnswer: answers[config.getQuestionId(question)] ?? null,
      onAnswer: handleAnswer,
      onBack: () => handleBack(),
    });
  }

  if (screen === "results") {
    const { ResultsScreen } = config;
    return (
      <Suspense fallback={<QuizSuspenseFallback />}>
        <ResultsScreen result={result} onRestart={handleRestart} />
      </Suspense>
    );
  }

  return config.renderLanding({
    onStartTest: handleStartTest,
    totalQuestions: config.totalQuestions,
    afterContent,
  });
}
