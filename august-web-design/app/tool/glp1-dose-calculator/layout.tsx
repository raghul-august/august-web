"use client";

import "@/app/styles/tool-calculator.css";
import "@/app/components/tool/glp1-dose-calculator/glp1-dose-calculator.css";
import ToolLayout from "@/app/components/tool/shared/ToolLayout";

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <ToolLayout category="calculator">{children}</ToolLayout>;
}
