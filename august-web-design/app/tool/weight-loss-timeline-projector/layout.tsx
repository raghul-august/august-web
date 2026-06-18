"use client";

import "@/app/components/tool/weight-loss-timeline-projector/weight-loss-timeline-projector.css";
import ToolLayout from "@/app/components/tool/shared/ToolLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ToolLayout category="calculator">{children}</ToolLayout>;
}
