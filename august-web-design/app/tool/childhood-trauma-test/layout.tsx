"use client";

import "@/app/components/tool/childhood-trauma-test/childhood-trauma-test.css";
import ToolLayout from "@/app/components/tool/shared/ToolLayout";

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <ToolLayout category="quiz">{children}</ToolLayout>;
}
