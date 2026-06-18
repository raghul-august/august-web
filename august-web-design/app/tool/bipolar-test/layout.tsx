"use client";

import "@/app/components/tool/bipolar-test/bipolar-test.css";
import ToolLayout from "@/app/components/tool/shared/ToolLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ToolLayout category="quiz">{children}</ToolLayout>;
}
