"use client";

import "@/app/components/tool/pregnancy-weight-gain-calculator/pregnancy-weight-gain-calculator.css";
import ToolLayout from "@/app/components/tool/shared/ToolLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ToolLayout category="calculator">{children}</ToolLayout>;
}
