import type { Metadata } from "next";
import LegalPageWrapper from "@/app/components/website/landing/LegalPageWrapper";
import PrivacyContentUS from "@/app/components/website/landing/PrivacyContentUS";

export const metadata: Metadata = {
  title: "Privacy Policy - August AI",
  description:
    "How August Labs Inc. collects, uses, and protects your personal information.",
};

export default function PrivacyUSPage() {
  return (
    <LegalPageWrapper>
      <PrivacyContentUS />
    </LegalPageWrapper>
  );
}
