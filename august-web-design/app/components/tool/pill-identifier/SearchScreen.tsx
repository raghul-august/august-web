"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { PILL_COLORS, PILL_SHAPES } from "@/app/data/tools/pill-identifier-config";
import type { PillRecord } from "@/app/data/tools/pill-identifier-config";
import QuizContainer from "../shared/QuizContainer";

export interface SearchInputs {
  imprint: string;
  color: string;
  shape: string;
}

interface SearchScreenProps {
  initial: SearchInputs;
  onBack: () => void;
  onSubmit: (q: SearchInputs) => void;
  isLoading: boolean;
}

export default function SearchScreen({
  initial,
  onBack,
  onSubmit,
  isLoading,
}: SearchScreenProps) {
  const [imprint, setImprint] = useState(initial.imprint);
  const [color, setColor] = useState(initial.color);
  const [shape, setShape] = useState(initial.shape);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<PillRecord[]>([]);

  useEffect(() => {
    const q = imprint.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    const handle = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/pill-identifier?imprint=${encodeURIComponent(q)}`);
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { matches?: PillRecord[] };
        if (cancelled) return;
        const seen = new Set<string>();
        const out: PillRecord[] = [];
        for (const rec of data.matches ?? []) {
          if (!rec.imprint) continue;
          const key = `${rec.imprint}|${rec.drug}|${rec.strength}`;
          if (seen.has(key)) continue;
          seen.add(key);
          out.push(rec);
          if (out.length >= 50) break;
        }
        setSuggestions(out);
      } catch {
        // best-effort autocomplete
      }
    }, 200);
    return () => { cancelled = true; clearTimeout(handle); };
  }, [imprint]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isLoading) return;
      onSubmit({ imprint: imprint.trim(), color, shape });
    },
    [imprint, color, shape, isLoading, onSubmit],
  );

  const isEmpty = !imprint.trim() && !color && !shape;

  return (
    <QuizContainer showFooter={true}>
      <div className="px-5 pt-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="flex items-center justify-center p-1 bg-transparent border-none cursor-pointer text-[var(--text-primary)] transition-opacity duration-150 hover:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col pt-6 pb-10 px-8 sm:px-6 max-w-[560px] mx-auto w-full"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-7"
        >
          <span className="inline-block text-xs font-medium tracking-wider text-(--brand-primary) bg-white px-3 py-1.5 rounded-full mb-4">
            Pill details
          </span>
          <h2 className="text-[1.3rem] font-medium leading-[1.4] text-(--text-primary) tracking-[-0.01em] m-0 max-[480px]:!text-[1.15rem]">
            What is stamped on the pill?
          </h2>
          <p className="mt-3 text-[0.9rem] leading-normal text-(--text-tertiary)">
            Enter the imprint first. Color and shape narrow the result if too
            many pills match.
          </p>
        </motion.div>

        {/* Imprint */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-5"
        >
          <label
            htmlFor="pill-imprint"
            className="block text-[0.78rem] font-medium text-(--text-secondary) mb-1.5"
          >
            Imprint
          </label>
          <div className="relative">
            <input
              id="pill-imprint"
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              className="tool-input"
              placeholder="e.g. L484 or M 367"
              value={imprint}
              onChange={(e) => {
                setImprint(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                window.setTimeout(() => setShowSuggestions(false), 120);
              }}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="pill-suggest-panel" role="listbox">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="option"
                    aria-selected={false}
                    className="pill-suggest-option"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setImprint(s.imprint);
                      if (s.color) setColor(s.color);
                      if (s.shape) setShape(s.shape);
                      setShowSuggestions(false);
                    }}
                  >
                    <div className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="font-medium text-(--text-primary) text-md">
                        {s.imprint}
                      </span>
                      <span className="truncate text-sm text-(--text-tertiary)">
                        {s.drug} · {s.strength}
                      </span>
                    </div>
                    <span className="shrink-0 text-sm text-(--text-tertiary) capitalize">
                      {[s.color, s.shape].filter(Boolean).join(" · ")}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Color */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mb-5"
        >
          <label
            htmlFor="pill-color"
            className="block text-[0.78rem] font-medium text-(--text-secondary) mb-2"
          >
            Color <span className="text-(--text-tertiary)">(optional)</span>
          </label>
          <select
            id="pill-color"
            className="tool-input"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          >
            <option value="">Any color</option>
            {PILL_COLORS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Shape */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-7"
        >
          <label
            htmlFor="pill-shape"
            className="block text-[0.78rem] font-medium text-(--text-secondary) mb-2"
          >
            Shape <span className="text-(--text-tertiary)">(optional)</span>
          </label>
          <select
            id="pill-shape"
            className="tool-input"
            value={shape}
            onChange={(e) => setShape(e.target.value)}
          >
            <option value="">Any shape</option>
            {PILL_SHAPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="flex items-center justify-center gap-3 flex-wrap"
        >
          <button
            type="submit"
            className="tool-btn tool-btn--primary"
            disabled={isEmpty || isLoading}
          >
            {isLoading ? "Searching…" : "Search"}
          </button>
          {(color || shape || imprint) && (
            <button
              type="button"
              className="tool-btn tool-btn--ghost"
              onClick={() => {
                setImprint("");
                setColor("");
                setShape("");
              }}
              disabled={isLoading}
            >
              Clear
            </button>
          )}
        </motion.div>
        <p
          className="tl-disclaimer text-center"
          style={{ maxWidth: 560, margin: "32px auto 0" }}
        >
          A pill identifier is not a substitute for a pharmacist. If you
          have an unattended or unfamiliar pill in your home, contact your
          pharmacist or local poison control centre before taking it.
        </p>
      </form>
    </QuizContainer>
  );
}
