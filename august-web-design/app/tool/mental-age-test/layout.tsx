"use client";

import ToolLayout from "@/app/components/tool/shared/ToolLayout";
import "@/app/components/tool/mental-age-test/mental-age.css"
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ToolLayout category="quiz">{children}</ToolLayout>;
}
