import LandingSmoothScroll from "./LandingSmoothScroll";
import ScrollToTop from "./ScrollToTop";
import "../../../landing.css";

export function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing-scope">
      {children}
      <ScrollToTop />
      <LandingSmoothScroll />
    </div>
  );
}
