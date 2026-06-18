"use client";

import ToolLayout from "@/app/components/tool/shared/ToolLayout";

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <ToolLayout category="quiz">{children}</ToolLayout>;
}
