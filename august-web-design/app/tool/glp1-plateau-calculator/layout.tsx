"use client";

import "@/app/components/tool/glp1-plateau-calculator/glp1-plateau-calculator.css";
import ToolLayout from "@/app/components/tool/shared/ToolLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ToolLayout category="calculator">{children}</ToolLayout>;
}
