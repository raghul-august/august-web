"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import VideoPlayer from "./VideoPlayer";
import "./import-memory.css";

const EXPORT_PROMPT = `I'm moving to a new health service and need to export my health data. List every memory and chat you have about me and anyone I've discussed (family members, dependents, etc.), as well as any health context you've learned from our recent and past conversations/chats. Output everything in a single code block so I can easily copy it.

Format each entry as: [date saved, if available] - [person: self/relation, if available] - memory content.

Make sure to cover all of the following - preserve my words verbatim where possible:

- Personal health profile: age, sex, height, weight, blood type, allergies.
- Medical history: diagnosed conditions, surgeries, hospitalizations, chronic issues.
- Current medications, supplements, and dosages.
- Symptoms I've reported, including frequency, severity, and duration.
- Lab results, vitals, or test values I've shared (e.g. HbA1c, BP, cholesterol).
- Lifestyle details: diet, exercise habits, sleep patterns, smoking/alcohol use.
- Mental health: mood patterns, stress, anxiety, or psychological conditions mentioned.
- Menstrual or reproductive health details.
- Family members or dependents I've discussed, and their health conditions.
- Health goals I've mentioned (weight loss, fitness, managing a condition, etc.).
- Instructions I've given about how to respond to me (tone, format, reminders, 'always do X', 'never do Y').
- Any other stored health context not covered above.

Do not summarize, group, or omit any entries. After the code block, confirm whether that is the complete set or if any remain.

Only include information that is health-related. Ignore and do not export any entries unrelated to health.`;

export default function ImportMemoryClient() {
  const [promptCopied, setPromptCopied] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setPastHero(window.scrollY > window.innerHeight - 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleCopyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(EXPORT_PROMPT);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = EXPORT_PROMPT;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2500);
    }
  }, []);

  const handleImport = useCallback(() => {
    if (!pastedText.trim()) return;
    const memory = pastedText.trim();
    window.open(`/chat?memory=${encodeURIComponent(memory)}`, "_self");
  }, [pastedText]);

  const scrollToSteps = useCallback(() => {
    const el = document.getElementById("import-steps");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <>
      {/* ─── TRANSLUCENT NAVBAR ─── */}
      <nav className={`im-navbar ${scrolled ? "im-navbar--scrolled" : ""} ${pastHero ? "im-navbar--past-hero" : ""}`}>
        <div className="im-navbar-inner">
          <a href="/" target="_blank" rel="noopener noreferrer" className="im-navbar-logo">
            <Image
              src="/import-memory/logo.png"
              alt="August"
              width={110}
              height={28}
              priority
              className={`im-navbar-logo-white ${pastHero ? "im-navbar-logo--hidden" : ""}`}
            />
            <Image
              src="https://res.cloudinary.com/dpgnd3ad7/image/upload/v1738557729/august_logo_green_nd4fn9.svg"
              alt="August"
              width={110}
              height={28}
              className={`im-navbar-logo-green ${pastHero ? "" : "im-navbar-logo--hidden"}`}
            />
          </a>
        </div>
      </nav>

      <div className="im-page">
        {/* ─── HERO ─── */}
        <section className="im-hero">
          <div className="im-hero-inner">
          <h1>
            Switch to august
            <br />
            without starting over
          </h1>

            <p className="im-hero-tagline">
              Import your health context from any AI into August. Start where you left off.
            </p>

            <button className="im-hero-cta" onClick={scrollToSteps}>
              Get Your Health Memory Into August
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <div className="im-hero-trust">
              <span className="im-hero-trust-item">HIPAA Secure</span>
              <span className="im-hero-trust-sep" />
              <span className="im-hero-trust-item">Built by Doctors</span>
              <span className="im-hero-trust-sep" />
              <span className="im-hero-trust-item">HIPAA Compliant</span>
            </div>
          </div>
        </section>

        {/* ─── INSTRUCTION VIDEO ─── */}
        <section className="im-video-section">
          <VideoPlayer src="https://assets.getbeyondhealth.com/health-lib/import-memory/instruction-video.mp4" poster="https://assets.getbeyondhealth.com/health-lib/import-memory/instruction-video-thumbnail.png" />
        </section>

        {/* ─── WHY IMPORT ─── */}
        <section className="im-content">
          <div className="im-content-inner">
            <div className="im-why-section">
              <p className="im-section-label">Why Import Your Health History?</p>
              <h2 className="im-section-title">
                Context Makes All the Difference
              </h2>
              <p className="im-section-desc">
                You&apos;ve already shared details about your health with another AI. August can use that context to deliver personalized, more relevant health support right from day one
              </p>

              <div className="im-why-grid">
                <div className="im-why-card">
                  <div className="im-why-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1d644d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 4 15 12 5 20" />
                      <line x1="19" y1="5" x2="19" y2="19" />
                    </svg>
                  </div>
                  <h3>Skip the repetition</h3>
                  <p>
                    No need to re-explain your conditions, medications, or
                    history. August picks up right where you left off.
                  </p>
                </div>

                <div className="im-why-card">
                  <div className="im-why-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1d644d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <h3>Better & Faster answers </h3>
                  <p>
                    When August knows your health background, every response is tailored to your specific situation and needs.
                  </p>
                </div>

                <div className="im-why-card">
                  <div className="im-why-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1d644d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <h3>Private and secure</h3>
                  <p>
                    Your data is encrypted and never shared. You control what gets imported and can delete it anytime.
                  </p>
                </div>
              </div>
            </div>

            {/* ─── STEPS ─── */}
            <div className="im-steps-section" id="import-steps">
              <p className="im-section-label">How it works</p>
              <h2 className="im-section-title">
                Import in Two Simple Steps
              </h2>
              <p className="im-section-desc">
                It takes less than two minutes. No technical setup, no account linking, and no data sharing with third parties.
              </p>

              <div className="im-steps-container">
                {/* Step 1: Copy Prompt */}
                <div className="im-step">
                  <div className="im-step-number">1</div>
                  <div className="im-step-body">
                    <h3 className="im-step-title">
                      Export from your current AI
                    </h3>
                    <p className="im-step-desc">
                      Copy the prompt below into the AI assistant where you’ve had health conversations. Send it to get a structured summary of your health data.
                    </p>

                    <div className="im-step-action">
                      <div className="im-prompt-box">
                        <div className="im-prompt-header">
                          <span className="im-prompt-header-label">
                            prompt
                          </span>
                          <button
                            className={`im-prompt-copy-btn ${
                              promptCopied ? "im-prompt-copy-btn--copied" : ""
                            }`}
                            onClick={handleCopyPrompt}
                          >
                            {promptCopied ? (
                              <>
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                                COPIED
                              </>
                            ) : (
                              <>
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <rect
                                    x="9"
                                    y="9"
                                    width="13"
                                    height="13"
                                    rx="2"
                                  />
                                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                </svg>
                                COPY
                              </>
                            )}
                          </button>
                        </div>
                        <div className="im-prompt-body">{EXPORT_PROMPT}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Paste Response & Import */}
                <div className="im-step">
                  <div className="im-step-number">2</div>
                  <div className="im-step-body">
                    <h3 className="im-step-title">
                      Paste and import
                    </h3>
                    <p className="im-step-desc">
                      After your AI provides the health summary, copy the entire response, paste it below, and hit Import to August.
                    </p>

                    <div className="im-step-action im-paste-area">
                      <textarea
                        className={`im-paste-textarea ${
                          pastedText ? "im-paste-textarea--filled" : ""
                        }`}
                        placeholder="Paste your health summary here..."
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                      />
                      {pastedText && (
                        <p className="im-paste-charcount">
                          {pastedText.length.toLocaleString()} characters
                        </p>
                      )}

                      <div className="im-import-cta-container">
                        <button
                          className="im-import-btn"
                          onClick={handleImport}
                          disabled={!pastedText.trim()}
                        >
                          Import to August
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── PRIVACY ─── */}
            <div className="im-privacy">
              <p className="im-section-label">Your data, your rules</p>
              <h2 className="im-section-title">
                Your Privacy Is Non-Negotiable
              </h2>
              <p className="im-section-desc">
                Your health data is encrypted end-to-end. We never sell your personal information or share identifiable health data with advertisers, insurers, or employers. You&#39;re in full control. Access, correct, or delete your data at any time. Read our <a href="/privacy" target="_blank" rel="noopener noreferrer" className="im-privacy-link">Privacy Policy</a>.
              </p>
              <div className="im-privacy-features">
                <div className="im-privacy-feature">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d644d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <path d="M22 4L12 14.01l-3-3" />
                  </svg>
                  <span>End-to-end encrypted</span>
                </div>
                <div className="im-privacy-feature">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d644d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <path d="M22 4L12 14.01l-3-3" />
                  </svg>
                  <span>HIPAA secure</span>
                </div>
                <div className="im-privacy-feature">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d644d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <path d="M22 4L12 14.01l-3-3" />
                  </svg>
                  <span>Delete anytime</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ─── FOOTER CTA ─── */}
        <section className="im-footer-cta">
          <p className="im-footer-label">GET STARTED</p>
          <h2 className="im-footer-title">
            The future<br />
            isn&apos;t <em>far</em> away
          </h2>
          <p className="im-footer-desc">
            Medical help when you need it, right away. Import your health context<br />
            and make your first conversation feel like your hundredth.
          </p>
          <div className="im-footer-buttons">
            <button className="im-footer-btn-primary" onClick={scrollToSteps}>
              Import your memory
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <a href="/" target="_blank" rel="noopener noreferrer" className="im-footer-btn-secondary">
              Learn more about August
            </a>
          </div>
          <div className="im-footer-divider" />
          <div className="im-footer-bar">
            <div className="im-footer-bar-left">
              <a href="/" target="_blank" rel="noopener noreferrer" className="im-footer-logo-link">
                <Image
                  src="https://res.cloudinary.com/dpgnd3ad7/image/upload/v1738557729/august_logo_green_nd4fn9.svg"
                  alt="August"
                  width={90}
                  height={22}
                />
              </a>
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="im-footer-link">Terms</a>
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="im-footer-link">Privacy</a>
              <a href="/about" target="_blank" rel="noopener noreferrer" className="im-footer-link">About</a>
              <a href="/en/library" target="_blank" rel="noopener noreferrer" className="im-footer-link">Health Library</a>
            </div>
            <p className="im-footer-copyright">&copy; 2026 August AI. All Rights Reserved.</p>
          </div>
        </section>

      </div>
    </>
  );
}
