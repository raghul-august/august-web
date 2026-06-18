"use client";

import "@/app/components/tool/chronotype-test/chronotype-test.css";
import ToolLayout from "@/app/components/tool/shared/ToolLayout";

export default function ChronotypeLayout({ children }: { children: React.ReactNode }) {
  return <ToolLayout category="quiz">{children}</ToolLayout>;
}
