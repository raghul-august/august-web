"use client";

import "@/app/styles/tool-calculator.css";
import "@/app/components/tool/heart-age-calculator/heart-age-calculator.css";
import ToolLayout from "@/app/components/tool/shared/ToolLayout";

export default function TDEECalculatorLayout({ children }: { children: React.ReactNode }) {
  return <ToolLayout category="calculator">{children}</ToolLayout>;
}
