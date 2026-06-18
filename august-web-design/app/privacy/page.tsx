import type { Metadata } from "next";
import LegalPageWrapper from "@/app/components/website/landing/LegalPageWrapper";
import PrivacyContent from "@/app/components/website/landing/PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy - August Health",
  description:
    "How August Health collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPageWrapper>
      <PrivacyContent />
    </LegalPageWrapper>
  );
}
