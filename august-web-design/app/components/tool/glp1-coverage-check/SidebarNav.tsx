"use client";

import type { SectionState } from "./ApplicationShell";

interface SidebarNavProps {
  sections: { id: string; title: string; subtitle: string }[];
  sectionStates: SectionState[];
  currentSectionIndex: number;
  questionCounts: number[];
  answeredCounts: number[];
  onSectionClick: (index: number) => void;
}

export default function SidebarNav({
  sections,
  sectionStates,
  currentSectionIndex,
  questionCounts,
  answeredCounts,
  onSectionClick,
}: SidebarNavProps) {
  const totalAnswered = answeredCounts.reduce((sum, n) => sum + n, 0);
  const totalQuestions = questionCounts.reduce((sum, n) => sum + n, 0);
  const activeSection = sections[currentSectionIndex];

  return (
    <nav
      aria-label="Coverage check sections"
      className="glp1-sidebar bg-[#FEFEFD] p-[40px_24px] rounded-[24px_0_0_24px] flex flex-col h-full"
    >
      <div
        className="glp1-sidebar-header flex justify-between items-center mb-8"
      >
        <span className="font-medium text-[11px] tracking-[0.14em] text-[var(--text-secondary)]">
          Coverage Check
        </span>
        <span className="text-[12px] text-[#767f7c] tabular-nums">
          {totalAnswered}/{totalQuestions}
        </span>
      </div>

      {/* Mobile-only: active step label + step N of M */}
      <div className="glp1-sidebar-mobile-caption" aria-hidden>
        <span className="text-[14px] font-medium text-[#1C1917] tracking-[-0.01em] leading-[1.2]">
          {activeSection?.title}
        </span>
        <span className="text-[11px] font-medium tracking-[0.1em] text-[#767f7c]">
          Step {currentSectionIndex + 1} of {sections.length}
        </span>
      </div>

      <ol className="list-none m-0 p-0 flex flex-col gap-1">
        {sections.map((section, i) => {
          const state = sectionStates[i];
          const isClickable = i <= currentSectionIndex;
          const isCurrent = i === currentSectionIndex;

          return (
            <li
              key={section.id}
              className={`glp1-side-item${isCurrent ? " glp1-side-item--current" : ""}`}
              onClick={() => isClickable && onSectionClick(i)}
              onKeyDown={(e) => {
                if (!isClickable) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSectionClick(i);
                }
              }}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : -1}
              aria-current={isCurrent ? "step" : undefined}
              // cursor and opacity are dynamic (depend on state/isClickable)
              style={{
                cursor: isClickable ? "pointer" : "default",
                opacity: state === "pending" && !isClickable ? 0.5 : 1,
              }}
            >
              <div className="flex items-center gap-3 flex-1">
                <SectionCircle state={state} />
                <span
                  className="glp1-sidebar-label text-[14px] font-medium leading-[1.3] tracking-[-0.01em]"
                  // color is dynamic (depends on state/isCurrent)
                  style={{
                    color:
                      state === "pending" && !isCurrent
                        ? "#767f7c"
                        : "#1C1917",
                  }}
                >
                  {section.title}
                </span>
              </div>

              <span
                className="glp1-sidebar-meta text-[11px] whitespace-nowrap ml-2 tabular-nums"
                // color and fontWeight are dynamic (depend on state)
                style={{
                  color:
                    state === "in-progress"
                      ? "var(--brand-primary)"
                      : state === "completed"
                      ? "var(--text-secondary)"
                      : "var(--text-tertiary)",
                  fontWeight: state === "in-progress" ? 500 : 400,
                }}
              >
                {state === "in-progress"
                  ? "in progress"
                  : state === "completed"
                  ? `${answeredCounts[i]} of ${questionCounts[i]}`
                  : `${questionCounts[i]} questions`}
              </span>
            </li>
          );
        })}
      </ol>

      <div
        className="glp1-sidebar-footer mt-auto pt-6 border-t border-[#E8EAE8]"
      >
        <p className="m-0 text-[11px] text-[#767f7c] leading-[1.6]">
          About 5 minutes.
        </p>
        <p className="m-0 text-[11px] text-[#767f7c] leading-[1.6]">
          Your answers stay on this device.
        </p>
      </div>
    </nav>
  );
}

function SectionCircle({ state }: { state: SectionState }) {
  if (state === "completed") {
    return (
      <div className="w-5 h-5 rounded-full bg-[var(--brand-primary)] flex items-center justify-center shrink-0 text-white">
        <svg
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
        >
          <path
            d="M1.5 5.2L4 7.5L8.5 2.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  if (state === "in-progress") {
    return (
      <div className="w-5 h-5 rounded-full border-2 border-[var(--brand-primary)] flex items-center justify-center shrink-0">
        <div className="w-[6px] h-[6px] rounded-full bg-[var(--brand-primary)]" />
      </div>
    );
  }

  return (
    <div className="w-5 h-5 rounded-full border border-[#E8EAE8] shrink-0" />
  );
}
