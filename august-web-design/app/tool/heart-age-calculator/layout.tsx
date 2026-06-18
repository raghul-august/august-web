"use client";

import "@/app/components/tool/heart-age-calculator/heart-age-calculator.css";
import "@/app/styles/tool-calculator.css";
import ToolLayout from "@/app/components/tool/shared/ToolLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ToolLayout category="calculator">{children}</ToolLayout>;
}
