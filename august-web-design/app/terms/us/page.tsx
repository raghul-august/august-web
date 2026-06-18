import type { Metadata } from "next";
import LegalPageWrapper from "@/app/components/website/landing/LegalPageWrapper";
import TermsContentUS from "@/app/components/website/landing/TermsContentUS";

export const metadata: Metadata = {
  title: "Terms of Service - August AI",
  description:
    "Terms of Service governing your use of August AI's digital health platform and access to telehealth services provided by MDI clinicians.",
};

export default function TermsUSPage() {
  return (
    <LegalPageWrapper>
      <TermsContentUS />
    </LegalPageWrapper>
  );
}
