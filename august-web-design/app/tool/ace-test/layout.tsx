"use client";

import ToolLayout from "@/app/components/tool/shared/ToolLayout";
import "@/app/components/tool/ace-test/ace-test.css"
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ToolLayout category="quiz">{children}</ToolLayout>;
}
