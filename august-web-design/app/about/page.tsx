import { WebsiteLayout } from "@/app/components/website/WebsiteLayout";
import { Navbar } from "@/app/components/website/Navbar";
import { Footer } from "@/app/components/website/Footer";
import { 
  AboutHero, 
  AboutStory, 
  AboutValues, 
  AboutBenchmark, 
  AboutTeam, 
} from "@/app/components/website/AboutComponents";

export const metadata = {
  title: "About August AI | Putting you at the centre of healthcare",
  description: "Learn about the mission, values, and the team behind August, the #1 Health AI trusted by millions.",
};

export default function AboutPage() {
  return (
    <WebsiteLayout>
      <Navbar />
      <main>
        <AboutHero />
        <AboutStory />
        <AboutValues />
        <AboutBenchmark />
        <AboutTeam /> 
      </main>
      <Footer />
    </WebsiteLayout>
  );
}
