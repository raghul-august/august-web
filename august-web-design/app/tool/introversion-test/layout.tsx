"use client";

import ToolLayout from "@/app/components/tool/shared/ToolLayout";
import "@/app/components/tool/introversion-test/introversion-test.css"
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ToolLayout category="quiz">{children}</ToolLayout>;
}
