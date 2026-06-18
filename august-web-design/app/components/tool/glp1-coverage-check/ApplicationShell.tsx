"use client";

import type { GLP1Section } from "@/app/data/tools/glp1-coverage-questions";
import SidebarNav from "./SidebarNav";

export type SectionState = "pending" | "in-progress" | "completed";

interface ApplicationShellProps {
  sections: GLP1Section[];
  currentSectionIndex: number;
  currentQuestionIndexInSection: number;
  totalQuestionsInSection: number;
  sectionStates: SectionState[];
  questionCounts: number[];
  answeredCounts: number[];
  onSectionClick: (sectionIndex: number) => void;
  children: React.ReactNode;
}

export default function ApplicationShell({
  sections,
  currentSectionIndex,
  sectionStates,
  questionCounts,
  answeredCounts,
  onSectionClick,
  children,
}: ApplicationShellProps) {
  return (
    <div
      className="glp1-shell min-h-screen flex items-center justify-center p-6 bg-[var(--surface-page)]"
    >
      <div
        className="glp1-shell-card max-w-[1120px] w-full min-h-[640px] bg-[#FEFEFD] rounded-[24px] border border-[#E8EAE8] shadow-[var(--lib-shadow-card)] grid grid-cols-[280px_1px_1fr]"
      >
        <div className="glp1-shell-sidebar">
          <SidebarNav
            sections={sections.map((s) => ({
              id: s.id,
              title: s.title,
              subtitle: s.subtitle,
            }))}
            sectionStates={sectionStates}
            currentSectionIndex={currentSectionIndex}
            questionCounts={questionCounts}
            answeredCounts={answeredCounts}
            onSectionClick={onSectionClick}
          />
        </div>

        <div
          className="glp1-shell-divider bg-[#E8EAE8]"
        />

        <main
          className="glp1-shell-main flex flex-col overflow-y-auto p-[56px_64px]"
          aria-label="GLP-1 coverage check"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
