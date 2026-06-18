"use client";

import "@/app/styles/tool-calculator.css";
import "@/app/components/tool/glp1-meal-planner/glp1-meal-planner.css";
import ToolLayout from "@/app/components/tool/shared/ToolLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ToolLayout category="calculator">{children}</ToolLayout>;
}
