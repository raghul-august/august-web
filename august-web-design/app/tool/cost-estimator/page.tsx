"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AutocompleteInput from "./components/AutocompleteInput";
import { useWebviewBack } from "./hooks/useWebviewBack";
import { track } from "@/services/analytics-service";
import "./cost-estimator.css";

declare global { interface Window { ReactNativeWebView?: { postMessage(msg: string): void } } }

const words = ["biopsies", "MRIs", "surgery", "therapy", "lab work"];

interface Service { [key: string]: unknown; id: string; service_name: string }
interface Location { [key: string]: unknown; zip_code: string; label: string; city: string; state: string }
interface Plan { [key: string]: unknown; plan_id: string; plan_name: string }

const POPULAR_LOCATIONS: Location[] = [
  { zip_code: "10001", label: "New York, NY 10001", city: "New York", state: "NY" },
  { zip_code: "90001", label: "Los Angeles, CA 90001", city: "Los Angeles", state: "CA" },
  { zip_code: "60601", label: "Chicago, IL 60601", city: "Chicago", state: "IL" },
  { zip_code: "77001", label: "Houston, TX 77001", city: "Houston", state: "TX" },
  { zip_code: "85001", label: "Phoenix, AZ 85001", city: "Phoenix", state: "AZ" },
  { zip_code: "19101", label: "Philadelphia, PA 19101", city: "Philadelphia", state: "PA" },
  { zip_code: "78201", label: "San Antonio, TX 78201", city: "San Antonio", state: "TX" },
  { zip_code: "92101", label: "San Diego, CA 92101", city: "San Diego", state: "CA" },
  { zip_code: "75201", label: "Dallas, TX 75201", city: "Dallas", state: "TX" },
  { zip_code: "33101", label: "Miami, FL 33101", city: "Miami", state: "FL" },
];

const POPULAR_PILLS = ["MRI", "Colonoscopy", "CT", "X-Ray", "Mammogram", "Knee Repair", "Ultrasound"];

function CostEstimatorContent() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [wordIdx, setWordIdx] = useState(0);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    track('cost_estimator_page_viewed');
  }, []);

  const triggerCircleDraw = useCallback(() => {
    pathRefs.current.forEach((p) => {
      if (!p) return;
      p.classList.remove("ce-animating");
      p.style.strokeDashoffset = "600";
      void (p as unknown as HTMLElement).offsetWidth;
      p.style.strokeDashoffset = "";
      p.classList.add("ce-animating");
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(triggerCircleDraw, 700);
    return () => clearTimeout(t);
  }, [triggerCircleDraw]);

  useEffect(() => {
    const interval = setInterval(() => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      wrapper.style.transition = "opacity 0.35s ease, transform 0.35s ease";
      wrapper.style.opacity = "0";
      wrapper.style.transform = "translateY(5px)";
      pathRefs.current.forEach((p) => {
        if (!p) return;
        p.classList.remove("ce-animating");
        p.style.strokeDashoffset = "600";
      });
      setTimeout(() => {
        setWordIdx((prev) => (prev + 1) % words.length);
        wrapper.style.opacity = "1";
        wrapper.style.transform = "translateY(0)";
        setTimeout(triggerCircleDraw, 400);
      }, 400);
    }, 4200);
    return () => clearInterval(interval);
  }, [triggerCircleDraw]);

  const postBackToApp = useCallback(() => {
    window.ReactNativeWebView?.postMessage(JSON.stringify({
      source: typeof window !== "undefined" ? window.location.origin : "",
      type: "NAVIGATION",
      action: "BACK"
    }));
  }, []);

  const isWebview = useWebviewBack(postBackToApp);

  const [pillQuery, setPillQuery] = useState("");

  const canSearch = selectedService && selectedLocation && selectedPlan;

  const handleSearch = () => {
    if (!canSearch) return;
    track('cost_estimator_search', { service: selectedService.service_name, zip: selectedLocation.zip_code });
    const params = new URLSearchParams({
      procedure: selectedService.id,
      zip: selectedLocation.zip_code,
      plan: selectedPlan.plan_id,
    });
    if (isWebview) params.set("source", "webview");
    router.push(`/tool/cost-estimator/results?${params.toString()}`);
  };

  const handlePillClick = (pill: string) => {
    track('cost_estimator_popular_search', { pill });
    setPillQuery("");
    setTimeout(() => setPillQuery(pill), 0);
  };

  return (
    <div className="ce-wrapper">
      <svg className="ce-global-svg-defs" aria-hidden="true">
        <defs>
          <filter id="ce-chalk">
            <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={3} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={2} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <section className="ce-hero">
        <h1>
          <span className="ce-line1">See what you&apos;ll pay,</span>
          for{" "}
          <span className="ce-circle-word" ref={wrapperRef} style={{ marginLeft: 16 }}>
            <span className="ce-word-text">{words[wordIdx]}</span>
            <svg className="ce-circle-svg" viewBox="0 0 220 110" preserveAspectRatio="none">
              <path ref={(el) => { pathRefs.current[0] = el; }} d="M 28 58 C 22 28, 75 6, 160 16 C 205 24, 215 52, 195 68 C 175 86, 105 98, 38 88 C 12 83, 6 66, 22 52" opacity="0.7" />
              <path ref={(el) => { pathRefs.current[1] = el; }} d="M 22 52 C 28 32, 85 12, 165 20 C 210 28, 218 58, 190 74 C 165 90, 98 100, 32 86 C 8 80, 2 60, 20 48" opacity="0.45" />
            </svg>
          </span>
        </h1>
        <p className="ce-subtitle">Compare real prices from providers near you. See your actual cost before you book.</p>
      </section>

      <div className="ce-hero-block">
        <div className="ce-search-bar">
          <AutocompleteInput<Service>
            placeholder="Search for care"
            fetchUrl="/api/cost-estimator/services"
            queryParam="q"
            displayKey="service_name"
            valueKey="id"
            value={selectedService}
            onChange={setSelectedService}
            prefetchAll
            externalQuery={pillQuery}
            label="Treatment"
            icon={<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></svg>}
          />
          <AutocompleteInput<Location>
            placeholder="02143, MA"
            fetchUrl="/api/cost-estimator/locations"
            queryParam="q"
            displayKey="label"
            valueKey="zip_code"
            value={selectedLocation}
            onChange={setSelectedLocation}
            label="Location"
            icon={<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>}
            autoSelectOnBlur
            defaultSuggestions={POPULAR_LOCATIONS}
            errorMessage="Enter a valid zip code"
          />
          <AutocompleteInput<Plan>
            placeholder="Your provider"
            fetchUrl="/api/cost-estimator/plans"
            queryParam="q"
            displayKey="plan_name"
            valueKey="plan_id"
            value={selectedPlan}
            onChange={setSelectedPlan}
            prefetchAll
            label="Insurance"
            icon={<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
            topOption={{ plan_id: "specified-no-plan", plan_name: "I don't have insurance" } as Plan}
          />
          <button className="ce-search-go" onClick={handleSearch} disabled={!canSearch}>
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></svg>
            Compare prices
          </button>
        </div>
        <div className="ce-hero-bg">
          <Image src="/cost-estimator-bg.png" alt="" width={430} height={280} sizes="(max-width: 430px) 100vw, 430px" quality={100} priority />
        </div>
      </div>

      <div className="ce-suggested-care">
        <div className="ce-sc-label">Popular searches</div>
        <div className="ce-sc-pills">
          {POPULAR_PILLS.map((pill) => (
            <button key={pill} className="ce-sc-pill" onClick={() => handlePillClick(pill)}>
              {pill}
            </button>
          ))}
        </div>
      </div>

      <div className="ce-features">
        <div className="ce-feature-item">
          <div className="ce-fi-icon">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
          </div>
          <div className="ce-fi-text">
            <h2>Compare costs</h2>
            <p>Transparent prices from providers in your network</p>
          </div>
        </div>
        <div className="ce-feature-item">
          <div className="ce-fi-icon">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
          <div className="ce-fi-text">
            <h2>No hidden fees</h2>
            <p>The price you see is the price you pay</p>
          </div>
        </div>
        <div className="ce-feature-item">
          <div className="ce-fi-icon">
            <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <div className="ce-fi-text">
            <h2>Verified insurance</h2>
            <p>We check your coverage to calculate your exact copay</p>
          </div>
        </div>
      </div>

      <section className="ce-about-section">
        <div className="ce-about-tag">About august</div>
        <p>August is an AI Health Companion that helps you understand your health, navigate care, and make informed decisions on symptoms, medications, and lab reports.</p>
      </section>

      <footer className="ce-footer">&copy; 2026 August AI. All rights reserved.</footer>
    </div>
  );
}

export default function CostEstimatorPage() {
  return (
    <Suspense>
      <CostEstimatorContent />
    </Suspense>
  );
}
