import { WebsiteLayout } from "@/app/components/website/WebsiteLayout";
import { Navbar } from "@/app/components/website/Navbar";
import { Footer } from "@/app/components/website/Footer";
import {
  PrescriptionHero,
  PrescriptionEmbed,
  PrescriptionContent,
  PrescriptionCTA,
  PrescriptionFAQs,
} from "@/app/components/website/PrescriptionReaderComponents";

export const metadata = {
  title: "Doctor Prescription Reader by August AI",
  description:
    "August AI's online doctor prescription reader offers an easy way to read handwritten doctor prescriptions. Just upload an image and get clear results in seconds.",
  keywords: [
    "prescription reader",
    "doctor prescription reader",
    "handwriting reader",
    "AI prescription reader",
    "medical prescription reader",
    "prescription reader online free",
    "August AI",
  ],
};

export default function PrescriptionReaderPage() {
  return (
    <WebsiteLayout>
      <Navbar />
      <main>
        <PrescriptionHero />
        <PrescriptionEmbed />
        <PrescriptionContent />
        <PrescriptionCTA />
        <PrescriptionFAQs />
      </main>
      <Footer />
    </WebsiteLayout>
  );
}
