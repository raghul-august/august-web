'use client';

import { useState, useCallback, useEffect } from 'react';
import { Navbar } from "@/app/components/website/Navbar";
import { Footer } from "@/app/components/website/Footer";
import AIChatWidget from "@/app/components/AIChatWidget";
import QRFloatingBanner from "@/app/components/QRFloatingBanner";
import "./benchmark-article.css";

const IMAGE_SRC = "https://assets.getbeyondhealth.com/health-lib/safety-benchmark.png";
const IMAGE_ALT = "Structured Test of Triage Recommendations, confusion matrices comparing ChatGPT Health and August AI performance. August AI correctly triaged all 64 ED-now emergencies compared to ChatGPT Health's 31 of 64.";

function ImageModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const toggleZoom = useCallback(() => {
    setScale((s) => (s === 1 ? 2 : 1));
  }, []);

  return (
    <div
      className="bnm-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <button
        className="bnm-modal-close"
        onClick={onClose}
        aria-label="Close image viewer"
      >
        &#x2715;
      </button>
      <div
        className="bnm-modal-img-wrap"
        onClick={(e) => {
          e.stopPropagation();
          toggleZoom();
        }}
        style={{ cursor: scale === 1 ? 'zoom-in' : 'zoom-out' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="bnm-modal-img"
          style={{ transform: `scale(${scale})` }}
          draggable={false}
        />
      </div>
    </div>
  );
}

export default function NatureMedicineBenchmarkClient() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="benchmark-nature-medicine">
      <Navbar />

      {/* Hero */}
      <header className="hero">
        <div className="hero-tag fade-in">Safety Benchmark</div>
        <h1 className="fade-in">
          A Nature Medicine Study Found AI Misses Half of Medical Emergencies. We Ran the Same Test.
        </h1>
        <p className="hero-subtitle fade-in">
          August correctly triaged every emergency case when evaluated against the peer-reviewed benchmark that exposed critical safety gaps in consumer health AI.
        </p>
        <div className="hero-meta fade-in">
          <span className="author">Anuruddh Mishra</span>
          <span className="separator" />
          <span>Founder &amp; CEO, August AI</span>
          <span className="separator" />
          <span>March 2026</span>
          <span className="separator" />
          <span>8 min read</span>
        </div>
      </header>

      {/* Article */}
      <article className="article">
        <p>
          Last week, researchers at Mount Sinai&apos;s Icahn School of Medicine published a finding in{" "}
          <em>Nature Medicine</em> that should concern anyone who has ever asked an AI chatbot about their health.
        </p>

        <p>
          ChatGPT Health, used by approximately <strong>40 million people daily</strong>, was stress-tested across 960 triage scenarios built from 60 clinician-authored vignettes spanning 21 clinical domains. The question was straightforward: when a patient describes symptoms that require emergency care, does the AI tell them to go to the emergency room?
        </p>

        <p>The answer, in more than half of the most critical cases, was no.</p>

        {/* Stats */}
        <div className="stat-row" role="group" aria-label="Emergency triage comparison">
          <div
            className="stat-card danger"
            role="figure"
            aria-label="ChatGPT Health under-triaged 52% of true emergencies, missing 31 of 64 cases"
          >
            <div className="stat-label">ChatGPT Health</div>
            <div className="stat-number">52%</div>
            <div className="stat-detail">
              of true emergencies under-triaged
              <br />
              <em>31 of 64 missed</em>
            </div>
          </div>
          <div
            className="stat-card success"
            role="figure"
            aria-label="August AI correctly triaged all 64 of 64 emergencies"
          >
            <div className="stat-label">August AI</div>
            <div className="stat-number">64/64</div>
            <div className="stat-detail">
              emergencies correctly triaged
              <br />
              <em>Every case identified</em>
            </div>
          </div>
        </div>

        <h2>What the Study Found</h2>

        <p>
          The researchers tested ChatGPT Health under 16 different conditions, varying patient demographics, social contexts, and clinical presentations. Performance followed what the authors describe as an inverted U-shaped pattern: the system performed worst at the clinical extremes, precisely where accuracy matters most.
        </p>

        <p>
          Among gold-standard emergencies, cases where physicians unanimously agreed the patient needed the emergency department immediately,{" "}
          <strong>ChatGPT Health under-triaged 52% of them.</strong> Patients presenting with diabetic ketoacidosis, a condition that can be fatal within hours, were directed to schedule follow-up appointments within 24 to 48 hours. Patients showing early signs of respiratory failure were reassured.
        </p>

        <p>
          Perhaps most striking: the system often recognized the warning signs in its own reasoning, then talked itself out of acting on them.
        </p>

        <p>
          ECRI, the independent patient safety organization, has ranked AI chatbot misuse as the{" "}
          <strong>number one health technology hazard for 2026.</strong>
        </p>

        <h2>We Ran The Same Test</h2>

        <p>
          When we saw the paper, we did what we believe every company deploying consumer health AI should do: we ran the same test on our own system.
        </p>

        <p>
          Using the same benchmark methodology, we tested August across the triage scenarios described in the study. Among the 64 gold-standard emergency cases,{" "}
          <strong>August correctly triaged every one.</strong> No emergency under-triage.
        </p>

        {/* Confusion Matrix Image — clickable to open modal */}
        <figure className="figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={IMAGE_SRC}
            alt={IMAGE_ALT}
            loading="lazy"
            onClick={() => setModalOpen(true)}
            style={{ cursor: 'zoom-in' }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setModalOpen(true); } }}
          />
          <figcaption>
            Confusion matrices comparing triage recommendations against physician gold standard. Evaluating against Ramaswamy et al.,{" "}
            <em>Nature Medicine</em> (2026).{" "}
            <a href="https://doi.org/10.1038/s41591-026-04297-7" target="_blank" rel="noopener noreferrer">
              doi.org/10.1038/s41591-026-04297-7
            </a>
          </figcaption>
        </figure>

        {/* Key findings box */}
        <div className="findings-box">
          <h3>Reading the Confusion Matrices</h3>
          <div className="finding-item">
            <div className="finding-icon cross" aria-hidden="true">
              &#x2715;
            </div>
            <div className="finding-text">
              <strong>ChatGPT Health:</strong> Of 64 cases requiring immediate emergency care, only 31 were correctly triaged as &ldquo;ED now.&rdquo; The remaining 33 were under-triaged. Patients were told their situation was less urgent than it was.
            </div>
          </div>
          <div className="finding-item">
            <div className="finding-icon check" aria-hidden="true">
              &#x2713;
            </div>
            <div className="finding-text">
              <strong>August AI:</strong> All 64 emergency cases were correctly triaged as &ldquo;ED now.&rdquo; Zero patients with true emergencies were told to wait.
            </div>
          </div>
          <div className="finding-item">
            <div className="finding-icon check" aria-hidden="true">
              &#x2713;
            </div>
            <div className="finding-text">
              <strong>Across all urgency levels,</strong> August demonstrated higher rates of correct triage (green) and lower rates of under-triage (red) compared to ChatGPT Health.
            </div>
          </div>
        </div>

        <h2>Why This Gap Exists</h2>

        <p>
          The difference is not intelligence. General-purpose AI models are extraordinarily capable. But clinical reasoning at the edges requires something no foundation model ships with out of the box. A rising pCO<sub>2</sub> represents a trajectory toward respiratory failure, not just an abnormal lab value. Diabetic ketoacidosis is by definition an emergency, not a variant of hyperglycemia.
        </p>

        <p>
          It requires thousands of clinical rules, built specialty by specialty, guideline by guideline, failure mode by failure mode.
        </p>

        <p>
          We have been building these systems at August for years, long before health AI became a category. And every time we thought we were close to done, another edge case humbled us. That process of discovering what we didn&apos;t know, and encoding what we learned, is what separates a health chatbot from a clinical reasoning system.
        </p>

        <div className="pullquote">
          <p>
            Anyone can build a health chatbot. The market has made that clear. Building something a patient can take seriously when the stakes are real is a different problem entirely. It&apos;s slower and harder in the short term. But it&apos;s the only version that matters.
          </p>
        </div>

        <h2>Why I Built This</h2>

        <p>
          In 2022, I went through a four-month misdiagnosis. A chat-based consultation confidently told me I had rheumatoid arthritis. It was actually a nutritional deficiency. A closer reading of my own lab results would have caught it. The information was there. The system never connected it for me.
        </p>

        <p>
          That experience became the founding insight behind August. Today, 6 million people across 160 countries use our platform. We have analyzed more than 6 million medical reports and exchanged over 70 million messages. We scored 100% on the U.S. Medical Licensing Examination. Every one of those interactions has made our clinical reasoning sharper: every edge case identified, every failure mode encoded, every guideline refined.
        </p>

        <h2>What Needs to Happen Next</h2>

        <p>
          There is currently no requirement for consumer health AI to undergo independent safety evaluation before it reaches the public. No premarket testing. No minimum benchmark. Forty million people are asking an AI whether they should go to the emergency room, and no one is checking whether the answer is safe.
        </p>

        <p>
          The Mount Sinai paper calls for premarket safety evaluation of consumer health AI.{" "}
          <strong>We agree, and we believe that should be the floor, not the ceiling.</strong>
        </p>

        <p>
          We didn&apos;t build a better AI that answers health questions. We built a health AI that doesn&apos;t get the critical ones wrong. In health AI, safety and accuracy aren&apos;t features. They&apos;re the foundation.
        </p>

        {/* Methodology note */}
        <div className="methodology-note">
          <h3>A Note on Methodology</h3>
          <p>
            This is one benchmark measuring triage recommendations across a specific set of clinical scenarios. It is not a comprehensive evaluation of all health AI capabilities, and we do not present it as such. Triage accuracy (how urgently should I seek care) is one dimension of health AI safety, but not the only one. We chose to evaluate against this particular study because triage is arguably the highest-stakes question a consumer health AI must answer: when the answer is wrong, people can die.
          </p>
        </div>

        {/* References */}
        <div className="references">
          <h2>References</h2>
          <p>
            Ramaswamy, A., Tyagi, A., Hugo, H. et al. ChatGPT Health performance in a structured test of triage recommendations.{" "}
            <em>Nat Med</em> (2026).{" "}
            <a href="https://doi.org/10.1038/s41591-026-04297-7" target="_blank" rel="noopener noreferrer">
              https://doi.org/10.1038/s41591-026-04297-7
            </a>
          </p>
        </div>
      </article>

      {/* Chat widget with article-consistent header */}
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '0 clamp(20px, 5vw, 40px)',
        }}
      >
        <div
          style={{
            marginTop: 64,
            paddingTop: 40,
            borderTop: '1px solid #e5e3de',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 500,
              color: '#0a5c42',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 16,
              padding: '6px 14px',
              background: '#e8f5ef',
              borderRadius: 4,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: '#0a5c42',
                borderRadius: '50%',
                display: 'inline-block',
              }}
            />
            Ask August
          </div>
          <h2
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: 'clamp(22px, 4vw, 30px)',
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: '-0.025em',
              color: '#1a1a2e',
              margin: '0 0 8px 0',
            }}
          >
            Have a health question?
          </h2>
          <p
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: 16,
              lineHeight: 1.6,
              color: '#555566',
              margin: '0 0 4px 0',
            }}
          >
            Get clear guidance on symptoms, medications, and lab reports.
          </p>
          <p
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: 13,
              color: '#555566',
              margin: '0 0 28px 0',
            }}
          >
            Trusted by <span style={{ fontWeight: 700, color: '#0a5c42' }}>6M</span> people worldwide
          </p>
        </div>
      </div>
      <div className="bnm-chat-widget">
        <AIChatWidget />
      </div>
      <Footer />
      <QRFloatingBanner />

      {/* Image zoom modal */}
      {modalOpen && (
        <ImageModal
          src={IMAGE_SRC}
          alt={IMAGE_ALT}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
