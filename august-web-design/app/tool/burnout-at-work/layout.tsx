"use client";

import ToolLayout from "@/app/components/tool/shared/ToolLayout";
import "@/app/components/tool/burnout-at-work/burnout.css"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ToolLayout category="quiz">{children}</ToolLayout>;
}
