"use client";

import ToolLayout from "@/app/components/tool/shared/ToolLayout";

export default function DrugInteractionCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToolLayout category="quiz">{children}</ToolLayout>;
}
