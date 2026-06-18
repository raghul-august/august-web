import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";

const COLUMNS = [
  {
    title: "QUICK LINKS",
    links: [
      { label: "Home", href: "/" },
      { label: "Stories", href: "/#stories" },
      { label: "Use Cases", href: "/#usecases" },
      { label: "Benchmarks", href: "/benchmarks" },
      { label: "About", href: "/about" },
      { label: "Health Library", href: "/en/library" },
    ],
  },
  {
    title: "HEALTH LIBRARY",
    links: [
      { label: "Articles", href: "/en/articles" },
      { label: "Symptoms", href: "/en/symptoms" },
      { label: "Diseases & Conditions", href: "/en/diseases-conditions" },
      { label: "Medications", href: "/en/medications" },
      { label: "Mental Health", href: "/en/mental-health" },
      { label: "Tests & Procedures", href: "/en/tests-procedures" },
      { label: "Prevention & Wellness", href: "/en/prevention-wellness" },
    ],
  },
  {
    title: "RESOURCES",
    links: [
      { label: "Tools", href: "/tool" },
      { label: "Blog", href: "/blog" },
      { label: "Benchmarks", href: "/benchmarks" },
    ],
  },
  {
    title: "LEGAL",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

interface LandingFooterProps {
  initialCountry?: string;
}

export default function LandingFooter({ initialCountry }: LandingFooterProps) {
  return (
    <footer
      style={{ background: "#1C1917" }}
      className="text-white"
    >
      <div
        className="mx-auto max-w-[960px] px-6 md:px-10"
        style={{ paddingTop: "100px", paddingBottom: "72px" }}
      >
        {/* Link columns */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-0 md:justify-between">
          {COLUMNS.map((col, i) => (
            <div key={i}>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {col.title}
              </p>

              <ul className="mt-5 flex flex-col gap-3">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <Link
                      href={link.href}
                      className="transition-opacity duration-200 hover:opacity-70"
                      style={{
                        fontSize: "16px",
                        fontWeight: 400,
                        color: "rgba(255,255,255,0.75)",
                        display: "inline-flex",
                        alignItems: "center",
                        minHeight: "44px",
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          className="my-12"
          style={{ height: "1px", background: "rgba(255,255,255,0.08)" }}
        />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo */}
          <Image
            src="/images/august-logo.svg"
            alt="August"
            width={80}
            height={24}
            unoptimized
            className="brightness-0 invert opacity-50"
          />

          {/* Social + Language */}
          <div className="flex items-center gap-3">
            <a
              href="https://x.com/meetaugustai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="flex items-center justify-center transition-opacity duration-200 hover:opacity-70"
              style={{ width: "44px", height: "44px" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://in.linkedin.com/company/meetaugust"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex items-center justify-center transition-opacity duration-200 hover:opacity-70"
              style={{ width: "44px", height: "44px" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/meetaugustai/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex items-center justify-center transition-opacity duration-200 hover:opacity-70"
              style={{ width: "44px", height: "44px" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <LanguageSwitcher />
          </div>

          {/* Copyright */}
          <p
            style={{
              fontSize: "14px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            &copy; Copyright {new Date().getFullYear()}. All rights&nbsp;reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
