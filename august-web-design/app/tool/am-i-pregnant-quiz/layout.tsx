"use client";

import "@/app/components/tool/am-i-pregnant-quiz/am-i-pregnant-quiz.css";
import ToolLayout from "@/app/components/tool/shared/ToolLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ToolLayout category="quiz">{children}</ToolLayout>;
}
