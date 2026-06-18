"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  StethoscopeIcon,
  LockIcon,
  CaretRightIcon,
  ClipboardTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  MapPinIcon,
} from "@phosphor-icons/react/ssr";

import { CONSULT_PRICE_LABEL } from "@/lib/config";
import { prewarmTurnstileToken } from "@/utils/turnstile";

// Whatever the visitor types in the composer is forwarded to the chat as the
// `msg` query param; chat-container.tsx auto-sends it (stashing through login
// for anonymous telehealth users).
function chatHref(symptom: string): string {
  const text = symptom.trim();
  return text
    ? `/chat?anon_telehealth=true&msg=${encodeURIComponent(text)}`
    : "/chat?anon_telehealth=true";
}

export default function Hero() {
  const [symptom, setSymptom] = useState("");
  const href = chatHref(symptom);
  const prewarmedRef = useRef(false);

  // Mint a Turnstile token on first composer interaction so createAnonymousSession
  // on /chat can reuse it (see utils/turnstile.ts). The helper guards against
  // duplicate/stale mints, so the ref is just an optimization.
  function prewarm() {
    if (prewarmedRef.current) return;
    prewarmedRef.current = true;
    prewarmTurnstileToken("anonymous_session");
  }

  function go() {
    window.location.href = href;
  }

  return (
    <section className="hero" id="hero" style={{ overflow: "hidden" }}>
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <span className="hero-pill"><StethoscopeIcon className="ph" aria-hidden /> Virtual Urgent Care</span>
          <h1>Get Online Urgent Care,<span className="lighter">Right Now</span></h1>
          <p className="hero-explainer">Review symptoms with August,<br className="m-break" /> then consult a doctor for {CONSULT_PRICE_LABEL} if needed.</p>

          <form
            className="composer"
            aria-label="Describe your symptoms"
            onSubmit={(e) => {
              e.preventDefault();
              go();
            }}
          >
            <textarea
              id="symptomInput"
              rows={3}
              placeholder="Describe your symptoms…"
              aria-label="Describe your symptoms"
              value={symptom}
              onFocus={prewarm}
              onChange={(e) => {
                prewarm();
                setSymptom(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  go();
                }
              }}
            ></textarea>
            <div className="composer-bar">
              <span className="composer-secure"><LockIcon className="ph" aria-hidden /> HIPAA secure</span>
              <a href={href} className="composer-cta">Get started <CaretRightIcon className="ph" aria-hidden /></a>
            </div>
          </form>
          <div className="composer-mobile">
            <a href={href} className="composer-cta composer-cta-m">Get started <CaretRightIcon className="ph" aria-hidden /></a>
            <span className="composer-secure composer-secure-m"><LockIcon className="ph" aria-hidden /> HIPAA secure</span>
          </div>
        </div>

        <div className="hero-mock-col">
          <div className="float-card">
            <div className="float-avatars">
              <Image src="/urgent-care/doctor-1.webp" alt="Licensed doctor" width={62} height={62} priority />
              <Image className="mid" src="/urgent-care/doctor-2.webp" alt="Licensed doctor" width={74} height={74} priority />
              <Image src="/urgent-care/doctor-3.webp" alt="Licensed doctor" width={62} height={62} priority />
            </div>
            <p className="float-title">Talk to a licensed doctor</p>
            <span className="cs-text"><MapPinIcon className="ph" aria-hidden /> Urgent Care Doctors available in 50 states+DC</span>
              
            <div className="float-how">
              <p className="float-how-label">How it works</p>
              <ul>
                <li><span className="float-step-ic"><ClipboardTextIcon className="ph" aria-hidden /></span> August reviews your symptoms</li>
                <li><span className="float-step-ic"><CurrencyDollarIcon className="ph" aria-hidden /></span> Only pay if a doctor visit is needed</li>
                <li><span className="float-step-ic"><StethoscopeIcon className="ph" aria-hidden /></span> Get your diagnosis and prescription</li>
                <li><span className="float-step-ic"><ClockIcon className="ph" aria-hidden /></span> Follow-up with your doctor anytime</li>
              </ul>
            </div>
            <p className="float-states">
              <a href="#conditions" className="cs-link">See what we can help with <CaretRightIcon className="ph" aria-hidden /></a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
