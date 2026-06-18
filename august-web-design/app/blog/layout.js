import { Navbar } from '@/app/components/website/Navbar';
import { Footer } from '@/app/components/website/Footer';
import '@/app/landing.css';

export default function BlogLayout({ children }) {
  return (
    <div className="landing-scope">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
