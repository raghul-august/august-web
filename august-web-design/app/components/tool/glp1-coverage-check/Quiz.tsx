"use client";

import { useState, useCallback, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import { sections } from "@/app/data/tools/glp1-coverage-questions";
import type { GLP1Answers, GLP1AnswerValue, GLP1Question } from "@/app/data/tools/glp1-coverage-questions";
import { computeGLP1Coverage, calculateBMI, getBMICategory } from "@/app/utils/tools/glp1-coverage-scoring";
import { track, trackIdle, trackToolEvent } from "@/app/utils/analytics";
import QuizSuspenseFallback from "@/app/components/tool/shared/QuizSuspenseFallback";
import { colors } from "@/app/utils/tools/tool-colors";
import LandingScreen from "./LandingScreen";
import { ToolAuthGate } from "@/components/auth";

const ResultsScreen = lazy(() => import("./ResultsScreen"));

type Screen = "quiz" | "loading" | "results";

function getApplicableQuestions(sectionIndex: number, currentAnswers: GLP1Answers): GLP1Question[] {
  return sections[sectionIndex].questions.filter((q) => {
    if (!q.condition) return true;
    const conditionAnswer = currentAnswers[q.condition.questionId];
    return q.condition.values.includes(conditionAnswer as string);
  });
}

export default function Quiz({
  afterContent,
}: {
  afterContent?: React.ReactNode;
}) {
  const [screen, setScreen] = useState<Screen>("quiz");

  // Quiz start fires once on mount - the landing-inline model means the quiz
  // is considered "started" the moment the page renders.
  useEffect(() => {
    const totalQs = sections.reduce(
      (acc, _, i) => acc + getApplicableQuestions(i, {}).length,
      0
    );
    track("glp1_quiz_started", {
      event_category: "GLP-1 Coverage Check",
      total_questions: totalQs,
    });
  }, []);
  const [answers, setAnswers] = useState<GLP1Answers>({});
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">("imperial");
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndexInSection, setCurrentQuestionIndexInSection] = useState(0);
  const questionStartTime = useRef<number>(Date.now());
  const answersRef = useRef<GLP1Answers>({});
  answersRef.current = answers;

  const applicableQuestions = useMemo(
    () => getApplicableQuestions(currentSectionIndex, answers),
    [currentSectionIndex, answers]
  );

  const currentQuestion = applicableQuestions[currentQuestionIndexInSection];

  const questionCounts = useMemo(
    () => sections.map((_, i) => getApplicableQuestions(i, answers).length),
    [answers]
  );

  const answeredCounts = useMemo(
    () =>
      sections.map((_, i) =>
        getApplicableQuestions(i, answers).filter((q) => answers[q.id] !== undefined).length
      ),
    [answers]
  );

  const totalApplicableQuestions = useMemo(
    () => questionCounts.reduce((a, b) => a + b, 0),
    [questionCounts]
  );

  const totalAnswered = useMemo(
    () => answeredCounts.reduce((a, b) => a + b, 0),
    [answeredCounts]
  );

  const bmiData = useMemo(() => {
    const height = answers.height as { feet: number; inches: number } | undefined;
    const weight = answers.weight as number | undefined;
    if (height && weight) {
      const bmi = calculateBMI(height.feet, height.inches, weight);
      const goalWeight = answers.goal_weight as number | undefined;
      return {
        bmi,
        category: getBMICategory(bmi),
        weightToLose: goalWeight ? Math.max(0, weight - goalWeight) : 0,
      };
    }
    return null;
  }, [answers]);

  const result = useMemo(() => computeGLP1Coverage(answers), [answers]);

  const loadingFallback = <QuizSuspenseFallback bg={colors.bg} />;

  const handleAnswer = useCallback(
    (questionId: string, value: GLP1AnswerValue) => {
      const timeSpentMs = Date.now() - questionStartTime.current;
      trackIdle("glp1_question_answered", {
        event_category: "GLP-1 Coverage Check",
        section: sections[currentSectionIndex].title,
        question_id: questionId,
        time_spent_seconds: Math.round(timeSpentMs / 1000),
      });
      const newAnswers = { ...answersRef.current, [questionId]: value };
      answersRef.current = newAnswers;
      setAnswers(newAnswers);
      questionStartTime.current = Date.now();
    },
    [currentSectionIndex]
  );

  const handleNext = useCallback(() => {
    const latestAnswers = answersRef.current;
    const applicable = getApplicableQuestions(currentSectionIndex, latestAnswers);

    if (currentQuestionIndexInSection < applicable.length - 1) {
      setCurrentQuestionIndexInSection((prev) => prev + 1);
    } else if (currentSectionIndex < sections.length - 1) {
      trackIdle("glp1_section_completed", {
        event_category: "GLP-1 Coverage Check",
        section_name: sections[currentSectionIndex].title,
      });
      setCurrentSectionIndex((prev) => prev + 1);
      setCurrentQuestionIndexInSection(0);
    } else {
      trackIdle("glp1_section_completed", {
        event_category: "GLP-1 Coverage Check",
        section_name: sections[currentSectionIndex].title,
      });
      const coverageResult = computeGLP1Coverage(latestAnswers);
      const heightVal = latestAnswers.height as { feet: number; inches: number } | undefined;
      const weightVal = latestAnswers.weight as number | undefined;
      const bmi = heightVal && weightVal ? calculateBMI(heightVal.feet, heightVal.inches, weightVal) : 0;
      track("glp1_quiz_completed", {
        event_category: "GLP-1 Coverage Check",
        coverage_tier: coverageResult.overallTier.tier,
        bmi,
        has_contraindications: coverageResult.hasContraindications,
      });
      setScreen("loading");
    }
    questionStartTime.current = Date.now();
  }, [currentSectionIndex, currentQuestionIndexInSection]);

  const handleBack = useCallback(() => {
    if (currentQuestionIndexInSection > 0) {
      setCurrentQuestionIndexInSection((prev) => prev - 1);
    } else if (currentSectionIndex > 0) {
      const prevSectionIndex = currentSectionIndex - 1;
      const prevApplicable = getApplicableQuestions(prevSectionIndex, answersRef.current);
      setCurrentSectionIndex(prevSectionIndex);
      setCurrentQuestionIndexInSection(Math.max(0, prevApplicable.length - 1));
    }
    // First question: no-op. Back button is hidden by QuestionScreen when
    // questionNumber === 1, so this is unreachable from the UI.
    questionStartTime.current = Date.now();
  }, [currentSectionIndex, currentQuestionIndexInSection]);

  // Inline "reviewing your coverage" pause - the quiz card shows a spinner
  // for a beat before we swap in the results. No separate loading page.
  useEffect(() => {
    if (screen !== "loading") return;
    const t = setTimeout(() => setScreen("results"), 1400);
    return () => clearTimeout(t);
  }, [screen]);

  const handleRestart = useCallback(() => {
    setAnswers({});
    answersRef.current = {};
    setCurrentSectionIndex(0);
    setCurrentQuestionIndexInSection(0);
    setScreen("quiz");

    if(window !== undefined) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const sectionProgress = useMemo(
    () =>
      sections.map((s, i) => ({
        title: s.title,
        total: questionCounts[i],
        answered: answeredCounts[i],
      })),
    [questionCounts, answeredCounts]
  );

  const isLastQuestion =
    currentSectionIndex === sections.length - 1 &&
    currentQuestionIndexInSection === applicableQuestions.length - 1;

  if (screen === "results") {
    return (
      <Suspense fallback={loadingFallback}>
        <ResultsScreen result={result} answers={answers} onRestart={handleRestart} />
        <ToolAuthGate active={screen === "results"} />
      </Suspense>
    );
  }

  return (
    <>
      <LandingScreen
        currentQuestion={currentQuestion}
        answer={currentQuestion ? answers[currentQuestion.id] : undefined}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onBack={handleBack}
        sectionTitle={sections[currentSectionIndex].title}
        questionNumber={currentQuestionIndexInSection + 1}
        totalInSection={applicableQuestions.length}
        totalAnswered={totalAnswered}
        totalApplicableQuestions={totalApplicableQuestions}
        isFirstOverall={currentSectionIndex === 0 && currentQuestionIndexInSection === 0}
        isLastQuestion={isLastQuestion}
        isLoading={screen === "loading"}
        bmiData={currentSectionIndex === 1 ? bmiData : null}
        unitSystem={unitSystem}
        onToggleUnit={() => setUnitSystem((s) => (s === "imperial" ? "metric" : "imperial"))}
        sectionProgress={sectionProgress}
        currentSectionIndex={currentSectionIndex}
        afterContent={afterContent}
      />
      <ToolAuthGate active={screen === "loading"} />
    </>
  );
}
