import type { Metadata } from "next";
import LegalPageWrapper from "@/app/components/website/landing/LegalPageWrapper";
import TermsContent from "@/app/components/website/landing/TermsContent";

export const metadata: Metadata = {
  title: "Terms & Conditions - August Health",
  description:
    "Terms and conditions governing your use of August Health services.",
};

export default function TermsPage() {
  return (
    <LegalPageWrapper>
      <TermsContent />
    </LegalPageWrapper>
  );
}
