"use client";

import { ReactNode, Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { track, trackToolEvent } from "@/app/utils/analytics";
import type { PillRecord } from "@/app/data/tools/pill-identifier-config";
import type { PillSearchResult } from "@/app/utils/tools/pill-identifier-search";
import LandingScreen from "./LandingScreen";
import SearchScreen, { type SearchInputs } from "./SearchScreen";
import QuizSuspenseFallback from "../shared/QuizSuspenseFallback";
import { ToolAuthGate } from "@/components/auth";

const ResultsScreen = lazy(() => import("./ResultsScreen"));

type Screen = "landing" | "search" | "results";

const EMPTY_INPUTS: SearchInputs = { imprint: "", color: "", shape: "" };

export default function PillIdentifier({ afterContent }: { afterContent?: ReactNode }) {
  const [screen, setScreen] = useState<Screen>("landing");
  const [inputs, setInputs] = useState<SearchInputs>(EMPTY_INPUTS);
  const [result, setResult] = useState<PillSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const hasViewedRef = useRef(false);
  const completedRef = useRef("");

  useEffect(() => {
    if (hasViewedRef.current) return;
    hasViewedRef.current = true;
    trackToolEvent("pill-identifier", "viewed");
  }, []);

  useEffect(() => {
    if (screen !== "results" || !result) return;
    const sig = `${result.query.imprint ?? ""}|${result.query.color ?? ""}|${result.query.shape ?? ""}|${result.matches.length}`;
    if (sig === completedRef.current) return;
    completedRef.current = sig;
    trackToolEvent("pill-identifier", "completed", {
      imprint: result.query.imprint ?? null,
      color: result.query.color ?? null,
      shape: result.query.shape ?? null,
      match_count: result.matches.length,
      top_match_id: result.matches[0]?.id ?? null,
    });
  }, [screen, result]);

  const handleStart = useCallback(() => {
    trackToolEvent("pill-identifier", "started");
    setInputs(EMPTY_INPUTS);
    setScreen("search");
  }, []);

  const handleSearch = useCallback(async (q: SearchInputs) => {
    setIsLoading(true);
    setInputs(q);
    track("pill_identifier_searched", {
      event_category: "Pill Identifier",
      has_imprint: Boolean(q.imprint),
      has_color: Boolean(q.color),
      has_shape: Boolean(q.shape),
    });
    try {
      const params = new URLSearchParams();
      if (q.imprint) params.set("imprint", q.imprint);
      if (q.color) params.set("color", q.color);
      if (q.shape) params.set("shape", q.shape);
      const res = await fetch(`/api/pill-identifier?${params}`);
      const data = (await res.json()) as PillSearchResult;
      setResult(data);
      setScreen("results");
    } catch {
      setResult({ matches: [], total: 0, query: q, normalizedImprint: q.imprint });
      setScreen("results");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleBackFromSearch = useCallback(() => setScreen("landing"), []);
  const handleBackFromResults = useCallback(() => setScreen("search"), []);
  const handleRefine = useCallback(() => setScreen("search"), []);

  const handleRestart = useCallback(() => {
    completedRef.current = "";
    setInputs(EMPTY_INPUTS);
    setResult(null);
    setScreen("landing");
  }, []);

  if (screen === "search") {
    return (
      <SearchScreen
        initial={inputs}
        isLoading={isLoading}
        onBack={handleBackFromSearch}
        onSubmit={handleSearch}
      />
    );
  }

  if (screen === "results" && result) {
    return (
      <>
        <Suspense fallback={<QuizSuspenseFallback />}>
          <ResultsScreen
            query={result.query}
            matches={result.matches}
            onBack={handleBackFromResults}
            onRefine={handleRefine}
            onRestart={handleRestart}
          />
        </Suspense>
        <ToolAuthGate active={screen === "results" && !!result} />
      </>
    );
  }

  return <LandingScreen onStart={handleStart} afterContent={afterContent} />;
}
