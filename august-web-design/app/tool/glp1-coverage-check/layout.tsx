"use client";

import "@/app/components/tool/glp1-coverage-check/glp1-coverage-check.css";
import ToolLayout from "@/app/components/tool/shared/ToolLayout";

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <ToolLayout category="quiz">{children}</ToolLayout>;
}
