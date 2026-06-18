import { useState, useCallback } from "react";

export type QuizScreen = "landing" | "question" | "loading" | "results";

export interface UseQuizStateOpts<S extends string = QuizScreen, A = unknown> {
  initialScreen?: S;
  initialAnswers?: Record<number, A>;
}

export function useQuizState<A = unknown, S extends string = QuizScreen>(
  opts: UseQuizStateOpts<S, A> = {}
) {
  const [screen, setScreen] = useState<S>((opts.initialScreen ?? "landing") as S);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, A>>(opts.initialAnswers ?? {});

  const handleBack = useCallback(
    (onLandingFromFirst?: () => void) => {
      if (currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
        setScreen("question" as S);
      } else {
        onLandingFromFirst?.();
        setScreen("landing" as S);
      }
    },
    [currentIndex]
  );

  const handleRestart = useCallback(() => {
    setAnswers({});
    setCurrentIndex(0);
    setScreen("landing" as S);
  }, []);

  return {
    screen,
    setScreen,
    currentIndex,
    setCurrentIndex,
    answers,
    setAnswers,
    handleBack,
    handleRestart,
  };
}
