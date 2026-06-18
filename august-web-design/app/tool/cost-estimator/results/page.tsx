"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toBlob, getFontEmbedCSS } from "html-to-image";
import AutocompleteInput from "../components/AutocompleteInput";
import { useWebviewBack } from "../hooks/useWebviewBack";
import { track } from "@/services/analytics-service";
import { ChatEntrySection } from "@/components/chat-entry-section";
import { useAuthStore } from "@/stores/auth-store";
import { SignUpModal, ToolLoginModal } from "@/components/auth";
import "../cost-estimator.css";
import { useLoginModalStore } from "@/stores/login-modal-store";

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

interface Provider {
  provider_id: string;
  provider_name: string;
  provider_type: string;
  city: string;
  state: string;
  phone: string | null;
  distance_miles: number;
  price: number;
  price_type: string | null;
  quality_rating: number | null;
}

interface PriceComponent {
  fee_type: string;
  component_name: string;
}

interface ProviderDetail {
  provider: {
    phone: string | null;
    address: string | null;
    zip_code: string | null;
    website_url: string | null;
  };
  price_components: PriceComponent[];
}

interface SearchResponse {
  center: { zip: string; city: string; state: string };
  radius_miles: number;
  total_results: number;
  results: Provider[];
  procedure: { id: string; service_name: string; cpt_code: string | null } | null;
  plan: { plan_id: string; plan_name: string } | null;
}

function getBadge(price: number, median: number) {
  const ratio = price / median;
  if (ratio <= 0.5) return { label: "Significantly lower", color: "#4a9e80", dir: "down" };
  if (ratio <= 0.8) return { label: "Lower", color: "#4a9e80", dir: "down" };
  if (ratio >= 2.0) return { label: "Significantly higher", color: "#c0756b", dir: "up" };
  if (ratio >= 1.3) return { label: "Above average", color: "#d4a853", dir: "up" };
  return null;
}

function computeMedian(prices: number[]): number {
  const sorted = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function formatPrice(price: number | null | undefined): string {
  if (price == null) return "N/A";
  return "$" + price.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function buildDensityCurve(prices: number[], svgWidth: number, svgHeight: number, padding: number): { curvePath: string; fillPath: string; densityAt: (x: number) => number } {
  if (prices.length === 0) return { curvePath: "", fillPath: "", densityAt: () => 0 };

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;

  // KDE in log-space for skewed price distributions (matches Turquoise Health approach)
  const logPrices = prices.map((p) => Math.log(Math.max(p, 1)));
  const logMin = Math.min(...logPrices);
  const logMax = Math.max(...logPrices);
  const logRange = logMax - logMin || 1;

  // IQR-based bandwidth in log-space
  const logSorted = [...logPrices].sort((a, b) => a - b);
  const q1 = logSorted[Math.floor(logSorted.length * 0.25)];
  const q3 = logSorted[Math.floor(logSorted.length * 0.75)];
  const iqr = q3 - q1;
  const logMean = logPrices.reduce((a, b) => a + b, 0) / logPrices.length;
  const logStd = Math.sqrt(logPrices.reduce((s, p) => s + (p - logMean) ** 2, 0) / logPrices.length) || logRange * 0.1;
  const spread = Math.min(logStd, (iqr || logStd) / 1.34);
  const bandwidth = 0.6 * spread * Math.pow(logPrices.length, -0.2);

  // Evaluate density at points spaced evenly in log-space, mapped back to linear price axis
  const extLogMin = logMin - logRange * 0.05;
  const extLogMax = logMax + logRange * 0.05;
  const extLogRange = extLogMax - extLogMin;
  const steps = 200;
  const densities: number[] = [];
  const pricePoints: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const logX = extLogMin + (i / steps) * extLogRange;
    let density = 0;
    for (const lp of logPrices) {
      const z = (logX - lp) / bandwidth;
      density += Math.exp(-0.5 * z * z) / (bandwidth * Math.sqrt(2 * Math.PI));
    }
    density /= logPrices.length;
    // Transform density back: f(x) = f_log(log(x)) / x
    const x = Math.exp(logX);
    density /= x;
    densities.push(density);
    pricePoints.push(x);
  }

  const maxDensity = Math.max(...densities);
  const usableHeight = svgHeight - 6;

  // Map price points to SVG x using linear price scale for display
  const displayMin = minPrice - range * 0.05;
  const displayMax = maxPrice + range * 0.05;
  const displayRange = displayMax - displayMin || 1;

  const points: [number, number][] = densities.map((d, i) => {
    const x = padding + ((pricePoints[i] - displayMin) / displayRange) * (svgWidth - 2 * padding);
    const minVisibleHeight = 2;
    const y = svgHeight - Math.max((d / maxDensity) * usableHeight, minVisibleHeight);
    return [x, y];
  });

  let curvePath = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const cx = (points[i - 1][0] + points[i][0]) / 2;
    const cy = (points[i - 1][1] + points[i][1]) / 2;
    curvePath += ` Q${points[i - 1][0]} ${points[i - 1][1]}, ${cx} ${cy}`;
  }
  curvePath += ` L${points[points.length - 1][0]} ${points[points.length - 1][1]}`;

  const fillPath = curvePath + ` L${points[points.length - 1][0]} ${svgHeight} L${points[0][0]} ${svgHeight} Z`;

  const densityAt = (price: number): number => {
    // Find closest price point
    let closest = 0;
    let closestDist = Infinity;
    for (let i = 0; i <= steps; i++) {
      const dist = Math.abs(pricePoints[i] - price);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    }
    const d = densities[closest];
    return svgHeight - Math.max((d / maxDensity) * usableHeight, 2);
  };

  return { curvePath, fillPath, densityAt };
}

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const procedure = searchParams.get("procedure") || "";
  const plan = searchParams.get("plan") || "";
  const zip = searchParams.get("zip") || "";

  const isWebview = useWebviewBack();
  const isExternalDomain = typeof window !== "undefined" && (window.location.hostname === "medicalcostestimator.com" || window.location.hostname === "bankruptcyavoider.com");
  const shareUrl = isExternalDomain ? window.location.hostname : "www.meetaugust.ai/tool/cost-estimator";

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAnonymous = useAuthStore((s) => s.isAnonymous);
  const [sortBy, setSortBy] = useState<"price" | "distance">("price");
  const [page, setPage] = useState(1);
  const [radius, setRadius] = useState(50);
  const [showRadiusMenu, setShowRadiusMenu] = useState(false);
  const radiusRef = useRef<HTMLDivElement>(null);

  const logoRef = useRef<HTMLImageElement | null>(null);
  const greenLogoRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const loadViaBlob = async (path: string) => {
      const res = await fetch(path);
      const blob = await res.blob();
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
      });
    };
    const loadDirect = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    const loadLogo = async (path: string) => {
      try { return await loadViaBlob(path); } catch {}
      try { return await loadDirect(`${window.location.origin}${path}`); } catch {}
      try { return await loadDirect(path); } catch {}
      return null;
    };
    (async () => {
      logoRef.current = await loadLogo("/august-logo-white.png");
      greenLogoRef.current = await loadLogo("/august-logo.svg");
    })();
  }, []);

  useEffect(() => {
    track('cost_estimator_results_viewed', { procedure, zip });
  }, [procedure, zip]);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<Record<string, ProviderDetail>>({});
  const modalCardRef = useRef<HTMLDivElement>(null);
  const graphCardRef = useRef<HTMLDivElement>(null);
  const shareBlobRef = useRef<Blob | null>(null);
  const [shareStatus, setShareStatus] = useState<"idle" | "sharing" | "done">("idle");
  const [graphShareStatus, setGraphShareStatus] = useState<"idle" | "sharing" | "done">("idle");

  const [editing, setEditing] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [editLocation, setEditLocation] = useState<Location | null>(null);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);

  const openEdit = () => {
    track('cost_estimator_edit_search');
    if (data) {
      setEditService(data.procedure ? { id: data.procedure.id, service_name: data.procedure.service_name } : null);
      setEditLocation({ zip_code: data.center.zip, label: `${data.center.zip} – ${data.center.city}, ${data.center.state}`, city: data.center.city, state: data.center.state });
      setEditPlan(data.plan ? { plan_id: data.plan.plan_id, plan_name: data.plan.plan_name } : (plan === "specified-no-plan" ? { plan_id: "specified-no-plan", plan_name: "I don't have insurance" } : null));
    }
    setEditing(true);
  };

  const handleEditSearch = () => {
    if (!editService || !editLocation || !editPlan) return;
    track('cost_estimator_search', { service: editService.service_name, zip: editLocation.zip_code });
    const params = new URLSearchParams({
      procedure: editService.id,
      zip: editLocation.zip_code,
      plan: editPlan.plan_id,
    });
    if (isWebview) params.set("source", "webview");
    setEditing(false);
    router.replace(`/tool/cost-estimator/results?${params.toString()}`);
  };

  const cancelEdit = () => setEditing(false);
  const canEditSearch = editService && editLocation && editPlan;

  const toggleProvider = (providerId: string) => {
    if (expandedId === providerId) {
      setExpandedId(null);
      return;
    }
    track('cost_estimator_provider_expanded', { provider_id: providerId });
    setExpandedId(providerId);
    if (!detailData[providerId]) {
      setDetailLoading(true);
      fetch(`/api/cost-estimator/provider?provider=${providerId}&service=${procedure}&plan=${plan}`, { headers: { "X-CE-Request": "1" } })
        .then((r) => {
          if (!r.ok) { console.error("Provider detail failed:", r.status); return null; }
          return r.json();
        })
        .then((d: ProviderDetail | null) => {
          if (d) setDetailData((prev) => ({ ...prev, [providerId]: d }));
          setDetailLoading(false);
        })
        .catch((err) => { console.error("Provider detail error:", err); setDetailLoading(false); });
    }
  };

  const formatPhone = (phone: string) => {
    const d = phone.replace(/\D/g, "");
    if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
    return phone;
  };
  const radiusOptions = [5, 10, 25, 50];

  useEffect(() => {
    if (!showRadiusMenu) return;
    const handler = (e: MouseEvent) => {
      if (radiusRef.current && !radiusRef.current.contains(e.target as Node)) setShowRadiusMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showRadiusMenu]);

  // Pre-capture share image when modal opens so share click has blob ready immediately (no DOM flash)
  useEffect(() => {
    shareBlobRef.current = null;
    if (!expandedId || !modalCardRef.current) return;
    const timer = setTimeout(async () => {
      const card = modalCardRef.current;
      if (!card) return;
      try {
        const clone = card.cloneNode(true) as HTMLElement;
        const hideEls = clone.querySelectorAll<HTMLElement>(".ce-modal-close, .ce-modal-share");
        hideEls.forEach((el) => { el.style.display = "none"; });
        clone.classList.add("ce-share-capture");
        const nameEl = clone.querySelector<HTMLElement>(".ce-modal-name");
        if (nameEl && nameEl.textContent && nameEl.textContent.length > 30) nameEl.style.fontSize = "22px";
        clone.style.setProperty("--font-sans", "'DM Sans', sans-serif");
        clone.style.setProperty("--font-serif", "'Crimson Pro', Georgia, serif");
        clone.style.fontFamily = "'DM Sans', sans-serif";
        const wrapper = document.createElement("div");
        wrapper.style.cssText = "position:fixed;top:0;left:0;width:500px;z-index:-9999;pointer-events:none;";
        wrapper.appendChild(clone);
        document.body.appendChild(wrapper);
        const fontEmbedCSS = await getFontEmbedCSS(document.body);
        const cardBlob = await toBlob(clone, { backgroundColor: "#f5f1e8", pixelRatio: 3, fontEmbedCSS });
        document.body.removeChild(wrapper);
        if (!cardBlob) return;
        const cardImg = await createImageBitmap(cardBlob);
        const logoImg = logoRef.current;
        const SCALE = 3, PAD_X = 32 * SCALE, PAD_TOP = 90 * SCALE, PAD_BOTTOM = 50 * SCALE;
        const ZIGZAG_H = 8 * SCALE, NOTCH_R = 12 * SCALE;
        const ticketW = cardImg.width + PAD_X * 2;
        const ticketH = cardImg.height + PAD_TOP + PAD_BOTTOM + ZIGZAG_H * 2;
        const canvas = document.createElement("canvas");
        canvas.width = ticketW; canvas.height = ticketH;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#206e55"; ctx.fillRect(0, 0, ticketW, ticketH);
        if (logoImg) {
          const logoH = 40 * SCALE, logoW = (logoImg.naturalWidth / logoImg.naturalHeight) * logoH;
          const logoY = (PAD_TOP - ZIGZAG_H - logoH) / 2 + 12 * SCALE;
          ctx.drawImage(logoImg, (ticketW - logoW) / 2, logoY, logoW, logoH);
        }
        const bodyY = PAD_TOP, bodyH = cardImg.height + ZIGZAG_H * 2;
        ctx.fillStyle = "#f5f1e8"; ctx.fillRect(PAD_X, bodyY, cardImg.width, bodyH);
        const zigTarget = 16 * SCALE;
        const zigCount = Math.round(cardImg.width / zigTarget);
        const zigSize = cardImg.width / zigCount;
        ctx.fillStyle = "#206e55";
        ctx.beginPath(); ctx.moveTo(PAD_X, bodyY);
        for (let i = 0; i < zigCount; i++) { const x = PAD_X + i * zigSize; ctx.lineTo(x + zigSize / 2, bodyY + ZIGZAG_H); ctx.lineTo(x + zigSize, bodyY); }
        ctx.lineTo(PAD_X + cardImg.width, bodyY); ctx.lineTo(PAD_X, bodyY); ctx.fill();
        const botY = bodyY + bodyH;
        ctx.beginPath(); ctx.moveTo(PAD_X, botY);
        for (let i = 0; i < zigCount; i++) { const x = PAD_X + i * zigSize; ctx.lineTo(x + zigSize / 2, botY - ZIGZAG_H); ctx.lineTo(x + zigSize, botY); }
        ctx.lineTo(PAD_X + cardImg.width, botY); ctx.lineTo(PAD_X, botY); ctx.fill();
        ctx.drawImage(cardImg, PAD_X, bodyY + ZIGZAG_H);
        const notchY = bodyY + bodyH / 2;
        ctx.fillStyle = "#206e55";
        ctx.beginPath(); ctx.arc(PAD_X, notchY, NOTCH_R, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(PAD_X + cardImg.width, notchY, NOTCH_R, 0, Math.PI * 2); ctx.fill();
        const footerSize = 13 * SCALE, footerY = botY + PAD_BOTTOM / 2 + footerSize / 3;
        ctx.font = `${footerSize}px sans-serif`; ctx.textAlign = "left";
        const prefix = "powered by ", link = "meetaugust.ai";
        const prefixW = ctx.measureText(prefix).width, linkW = ctx.measureText(link).width;
        const startX = ticketW / 2 - (prefixW + linkW) / 2;
        ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.fillText(prefix, startX, footerY);
        ctx.fillStyle = "#ffffff"; ctx.fillText(link, startX + prefixW, footerY);
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1 * SCALE;
        ctx.beginPath(); ctx.moveTo(startX + prefixW, footerY + 3 * SCALE); ctx.lineTo(startX + prefixW + linkW, footerY + 3 * SCALE); ctx.stroke();
        shareBlobRef.current = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
      } catch { /* silently fail */ }
    }, 300);
    return () => clearTimeout(timer);
  }, [expandedId, detailData]);

  useEffect(() => {
    if (!procedure || !plan || !zip) {
      router.replace(isWebview ? "/cost-estimator?source=webview" : "/cost-estimator");
      return;
    }

    setLoading(true);
    const url = `/api/cost-estimator/search?procedure=${encodeURIComponent(procedure)}&plan=${encodeURIComponent(plan)}&zip=${encodeURIComponent(zip)}&radius=${radius}`;
    fetch(url, { headers: { "X-CE-Request": "1" } })
      .then((res) => {
        if (!res.ok) throw new Error(`Search failed (${res.status})`);
        return res.json();
      })
      .then((d: SearchResponse) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Search error:", err);
        setError("Something went wrong. Please try again.");
        setLoading(false);
      });
  }, [procedure, plan, zip, radius, router]);

  if (loading) {
    return (
      <div className="ce-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <span style={{ color: "#a09a8e" }}>Searching providers...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="ce-wrapper" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16 }}>
        <span style={{ color: "#c0756b", fontSize: 15 }}>{error || "Something went wrong."}</span>
        <button className="ce-back-btn" style={{ width: "auto", padding: "8px 20px", borderRadius: 10, background: "rgba(74,158,128,0.08)", border: "none", color: "#4a9e80", fontWeight: 500, cursor: "pointer" }} onClick={() => router.push(isWebview ? "/tool/cost-estimator?source=webview" : "/tool/cost-estimator")}>
          Go back
        </button>
      </div>
    );
  }

  const prices = data.results.map((r) => r.price).filter((p) => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const median = prices.length > 0 ? computeMedian(prices) : 0;

  const SVG_W = 300, SVG_H = 80, SVG_PAD = 10;
  const { curvePath, fillPath, densityAt } = buildDensityCurve(prices, SVG_W, SVG_H, SVG_PAD);
  const priceRange = maxPrice - minPrice || 1;
  const displayMin = minPrice - priceRange * 0.05;
  const displayMax = maxPrice + priceRange * 0.05;
  const medianX = prices.length > 0 && maxPrice > minPrice
    ? SVG_PAD + ((median - displayMin) / (displayMax - displayMin)) * (SVG_W - 2 * SVG_PAD)
    : SVG_W / 2;

  const sorted = [...data.results].sort((a, b) =>
    sortBy === "price" ? a.price - b.price : a.distance_miles - b.distance_miles
  );

  const PER_PAGE = 10;
  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const paged = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const serviceName = data.procedure?.service_name || "This procedure";
  const planName = data.plan?.plan_name || "your plan";
  const locationLabel = `${data.center.zip} · ${planName}`;

  const handleGraphShare = async () => {
    track('cost_estimator_graph_shared');
    setGraphShareStatus("sharing");
    let blob: Blob | null = null;
    if (graphCardRef.current) {
      try {
        const card = graphCardRef.current;
        const shareBtn = card.querySelector<HTMLElement>(".ce-graph-share-btn");
        const graphFooter = card.querySelector<HTMLElement>(".ce-graph-footer");
        if (shareBtn) shareBtn.style.display = "none";
        if (graphFooter) graphFooter.style.display = "none";

        // Temporarily style for capture
        const origStyle = card.style.cssText;
        card.style.cssText += ";width:500px;max-width:500px;margin:0;background:#fff;backdrop-filter:none;-webkit-backdrop-filter:none;border:none;box-shadow:none;border-radius:16px;";

        const cardBlob = await toBlob(card, { backgroundColor: "#ffffff", pixelRatio: 3 });

        card.style.cssText = origStyle;
        if (shareBtn) shareBtn.style.display = "";
        if (graphFooter) graphFooter.style.display = "";

        // Composite: white header with green logo + card below
        if (cardBlob) {
          const cardImg = await createImageBitmap(cardBlob);
          const SCALE = 3;
          const HEADER_H = 48 * SCALE;
          const PAD_BOTTOM = 24 * SCALE;
          const canvasW = cardImg.width;
          const canvasH = cardImg.height + HEADER_H + PAD_BOTTOM;
          const canvas = document.createElement("canvas");
          canvas.width = canvasW;
          canvas.height = canvasH;
          const ctx = canvas.getContext("2d")!;

          // White background
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvasW, canvasH);

          // Green header strip with white logo centered
          ctx.fillStyle = "#206e55";
          ctx.fillRect(0, 0, canvasW, HEADER_H);
          const whiteLogoImg = logoRef.current;
          if (whiteLogoImg) {
            const logoH = 18 * SCALE;
            const logoW = (whiteLogoImg.naturalWidth / whiteLogoImg.naturalHeight) * logoH;
            const logoX = (canvasW - logoW) / 2;
            const logoY = (HEADER_H - logoH) / 2;
            ctx.drawImage(whiteLogoImg, logoX, logoY, logoW, logoH);
          }

          // Card image below header
          ctx.drawImage(cardImg, 0, HEADER_H);

          // "powered by meetaugust.ai" footer with underline on meetaugust.ai
          const fontSize = 11 * SCALE;
          ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
          ctx.fillStyle = "#9e9a90";
          ctx.textAlign = "center";
          const prefix = "powered by ";
          const link = "meetaugust.ai";
          const fullText = prefix + link;
          const fullW = ctx.measureText(fullText).width;
          const prefixW = ctx.measureText(prefix).width;
          const linkW = ctx.measureText(link).width;
          const textX = (canvasW - fullW) / 2;
          const textY = canvasH - 10 * SCALE;
          ctx.textAlign = "left";
          ctx.fillText(prefix, textX, textY);
          ctx.fillText(link, textX + prefixW, textY);
          // Underline meetaugust.ai
          ctx.strokeStyle = "#9e9a90";
          ctx.lineWidth = 1 * SCALE;
          const underY = textY + 3 * SCALE;
          ctx.beginPath();
          ctx.moveTo(textX + prefixW, underY);
          ctx.lineTo(textX + prefixW + linkW, underY);
          ctx.stroke();

          blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
        }
      } catch { /* continue without image */ }
    }

    const text = `${serviceName} — Midpoint price: ${formatPrice(median)}\nRange: ${formatPrice(minPrice)} – ${formatPrice(maxPrice)}\n${isWebview ? `Chat with August to learn more \u{1F4AC} https://join.meetaugust.ai/?c=vopMcC` : `Check your costs on ${shareUrl}`}`;

    if (navigator.share) {
      const shareData: ShareData = { text };
      if (blob) {
        const file = new File([blob], "price-chart.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) shareData.files = [file];
      }
      try { await navigator.share(shareData); } catch {}
      setGraphShareStatus("done");
      setTimeout(() => setGraphShareStatus("idle"), 2000);
      return;
    }

    // WebView fallback: send image to native app via postMessage
    if (window.ReactNativeWebView) {
      if (blob) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          window.ReactNativeWebView!.postMessage(JSON.stringify({
            type: "SHARE_IMAGE",
            base64,
            text,
          }));
        };
        reader.readAsDataURL(blob);
      } else {
        // No image — share text only via native share
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "SHARE_IMAGE",
          base64: null,
          text,
        }));
      }
      setGraphShareStatus("done");
      setTimeout(() => setGraphShareStatus("idle"), 2000);
      return;
    }

    if (blob && location.hostname === "localhost") {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "price-chart.png"; a.click();
      URL.revokeObjectURL(url);
      setGraphShareStatus("done");
      setTimeout(() => setGraphShareStatus("idle"), 2000);
      return;
    }

    try {
      if (blob && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "price-chart.png"; a.click();
        URL.revokeObjectURL(url);
      } else {
        try { await navigator.clipboard?.writeText(text); } catch {}
      }
    }
    setGraphShareStatus("done");
    setTimeout(() => setGraphShareStatus("idle"), 2000);
  };

  return (
    <div className="ce-wrapper">
      {/* STICKY HEADER — un-stick when editing so form expands downward */}
      <div className={`ce-header ${editing ? "ce-header-editing" : ""}`}>
        <div className="ce-header-top">
          {!isWebview && (
            <button className="ce-back-btn" onClick={() => router.push("/tool/cost-estimator")}>
              <svg viewBox="0 0 7 12" xmlns="http://www.w3.org/2000/svg"><path d="M6 1L1 6l5 5" fill="none" stroke="#141515" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>
        {!editing ? (
          <div className="ce-compact-search">
            <div className="ce-cs-icon">
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></svg>
            </div>
            <div className="ce-cs-text">
              <div className="ce-cs-primary">{serviceName}</div>
              <div className="ce-cs-secondary">{locationLabel}</div>
            </div>
            <button className="ce-cs-edit" onClick={openEdit}>
              <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </button>
          </div>
        ) : (
          <div className="ce-edit-search">
            <AutocompleteInput<Service>
              placeholder="Search for care"
              fetchUrl="/api/cost-estimator/services"
              queryParam="q"
              displayKey="service_name"
              valueKey="id"
              value={editService}
              onChange={setEditService}
              prefetchAll
              label="Treatment"
              icon={<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></svg>}
            />
            <AutocompleteInput<Location>
              placeholder="02143, MA"
              fetchUrl="/api/cost-estimator/locations"
              queryParam="q"
              displayKey="label"
              valueKey="zip_code"
              value={editLocation}
              onChange={setEditLocation}
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
              value={editPlan}
              onChange={setEditPlan}
              prefetchAll
              label="Insurance"
              icon={<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
              topOption={{ plan_id: "specified-no-plan", plan_name: "I don't have insurance" } as Plan}
            />
            <div className="ce-edit-actions">
              <button className="ce-edit-cancel" onClick={cancelEdit}>Cancel</button>
              <button className="ce-edit-submit" onClick={handleEditSearch} disabled={!canEditSearch}>
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></svg>
                Update search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FILTER CHIPS */}
      <div className="ce-filters">
        <div ref={radiusRef} style={{ position: "relative" }}>
          <button className="ce-filter-chip active" onClick={() => setShowRadiusMenu(!showRadiusMenu)}>
            Within {radius} mi <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {showRadiusMenu && (
            <div className="ce-radius-menu">
              {radiusOptions.map((r) => (
                <button key={r} className={`ce-radius-option ${r === radius ? "active" : ""}`} onClick={() => { track('cost_estimator_radius_changed', { radius: r }); setRadius(r); setShowRadiusMenu(false); }}>
                  {r} mi
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PROCEDURE INFO + PRICE CHART */}
      {prices.length > 0 && (
        <div className="ce-procedure-card" ref={graphCardRef}>
          <button className="ce-graph-share-btn" onClick={handleGraphShare} disabled={graphShareStatus === "sharing"}>
            {graphShareStatus === "done" ? (
              <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
            ) : graphShareStatus === "sharing" ? (
              <svg viewBox="0 0 24 24" className="ce-spin"><path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93" /></svg>
            ) : (
              <svg viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
            )}
          </button>
          <div className="ce-proc-info">
            <div className="ce-proc-header">
              <h2>{serviceName}</h2>
            </div>
            <p className="ce-proc-desc">
              Showing negotiated rates for {serviceName} with {planName} near {data.center.city}, {data.center.state}. Prices represent the maximum estimated amount before insurance adjustments.
            </p>
          </div>
          <div className="ce-price-chart">
            <div className="ce-price-main">{formatPrice(median)}</div>
            <div className="ce-price-label">Midpoint price for {serviceName}<br />in your area</div>
            <div className="ce-chart-visual">
              <div className="ce-chart-curve">
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4a9e80" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#4a9e80" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <path d={fillPath} fill="url(#curveGrad)" />
                  <path d={curvePath} fill="none" stroke="#4a9e80" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                </svg>
                <div className="ce-chart-median-line" style={{ left: `${(medianX / SVG_W) * 100}%` }} />
                <div className="ce-chart-median-dot" style={{ left: `${(medianX / SVG_W) * 100}%`, top: `${(densityAt(median) / SVG_H) * 100}%` }} />
              </div>
            </div>
            <div className="ce-price-range">
              <div><span className="ce-range-label">min.</span><br /><span className="ce-range-val">{formatPrice(minPrice)}</span></div>
              <div style={{ textAlign: "center" }}><span className="ce-range-label">price</span></div>
              <div style={{ textAlign: "right" }}><span className="ce-range-label">max.</span><br /><span className="ce-range-val">{formatPrice(maxPrice)}</span></div>
            </div>
          </div>
          <div className="ce-graph-footer">powered by <span>meetaugust.ai</span></div>
        </div>
      )}

      {/* RESULTS HEADER */}
      <div className="ce-results-header">
        <div className="ce-results-title">{data.total_results} result{data.total_results !== 1 ? "s" : ""} for {serviceName}</div>
        <div className="ce-results-subtitle">Results show the max estimated amount you&apos;d pay without insurance.</div>
        <div className="ce-results-sort">
          <button
            className="ce-sort-btn"
            onClick={() => { const next = sortBy === "price" ? "distance" : "price"; track('cost_estimator_sort_changed', { sort_by: next }); setSortBy(next); setPage(1); }}
          >
            {sortBy === "price" ? "Lowest price" : "Nearest"} <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
        </div>
      </div>

      {/* PROVIDER CARDS */}
      <div className="ce-results-list">
        {paged.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "#7a756a" }}>
            No providers found for this search. Try expanding your radius or changing the procedure.
          </div>
        )}
        {paged.map((prov) => {
          const badge = median > 0 ? getBadge(prov.price, median) : null;
          return (
            <div key={prov.provider_id} className="ce-provider-card" data-testid="provider-card" onClick={() => toggleProvider(prov.provider_id)}>
              <div className="ce-prov-top">
                <div>
                  <div className="ce-prov-name">{prov.provider_name}</div>
                  <div className="ce-prov-type">{prov.provider_type}</div>
                </div>
                <div className="ce-prov-price-block">
                  <div className="ce-prov-price-label">up to</div>
                  <div className="ce-prov-price">{formatPrice(prov.price)}</div>
                  {badge && (
                    <div className="ce-prov-badge" style={{ color: badge.color }}>
                      <svg viewBox="0 0 24 24" style={{ stroke: badge.color }}>
                        {badge.dir === "up" ? (
                          <><polyline points="4 16 8 12 12 15 20 7" fill="none" /><polyline points="15 7 20 7 20 12" fill="none" /></>
                        ) : (
                          <><polyline points="4 8 8 12 12 9 20 17" fill="none" /><polyline points="15 17 20 17 20 12" fill="none" /></>
                        )}
                      </svg>
                      {badge.label}
                    </div>
                  )}
                  <div className="ce-prov-location-inline">
                    <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {prov.city}, {prov.state} · {prov.distance_miles} mi
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="ce-pagination">
          <button className="ce-page-btn" disabled={page <= 1} onClick={() => { setPage(page - 1); setExpandedId(null); }}>
            <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <span className="ce-page-info">{page} of {totalPages}</span>
          <button className="ce-page-btn" disabled={page >= totalPages} onClick={() => { setPage(page + 1); setExpandedId(null); }}>
            <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      )}

      {/* PROVIDER DETAIL MODAL */}
      {expandedId && (() => {
        const prov = data.results.find((r) => r.provider_id === expandedId);
        if (!prov) return null;
        const detail = detailData[expandedId];
        const phone = prov.phone || detail?.provider?.phone;
        const badge = median > 0 ? getBadge(prov.price, median) : null;
        const handleShare = async () => {
          track('cost_estimator_provider_shared', { provider_id: prov.provider_id });
          setShareStatus("sharing");
          const text = [
            `${prov.provider_name} — ${formatPrice(prov.price)}`,
            serviceName,
            detail?.provider?.address || `${prov.city}, ${prov.state}`,
            phone ? formatPhone(phone) : "",
            isWebview
              ? `Chat with August to learn more 💬 https://join.meetaugust.ai/?c=vopMcC`
              : `Check your costs on ${shareUrl}`,
          ].filter(Boolean).join("\n");

          // Use pre-captured blob — built silently when modal opened, no DOM flash
          const blob = shareBlobRef.current;

          // WebView: send image to native app via postMessage (must come before navigator.share)
          if (window.ReactNativeWebView && blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = (reader.result as string).split(",")[1];
              window.ReactNativeWebView!.postMessage(JSON.stringify({ type: "SHARE_IMAGE", base64, text }));
            };
            reader.readAsDataURL(blob);
            setShareStatus("done");
            setTimeout(() => setShareStatus("idle"), 2000);
            return;
          }

          // Mobile: native share with image
          if (navigator.share) {
            const shareData: ShareData = { text };
            if (blob) {
              const file = new File([blob], "provider-cost.png", { type: "image/png" });
              if (navigator.canShare?.({ files: [file] })) shareData.files = [file];
            }
            try { await navigator.share(shareData); } catch {}
            setShareStatus("done");
            setTimeout(() => setShareStatus("idle"), 2000);
            return;
          }

          // Localhost: download image for preview
          if (blob && location.hostname === "localhost") {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "provider-cost.png";
            a.click();
            URL.revokeObjectURL(url);
            setShareStatus("done");
            setTimeout(() => setShareStatus("idle"), 2000);
            return;
          }

          // Desktop: copy image to clipboard
          try {
            if (blob && navigator.clipboard?.write) {
              await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
            } else if (navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(text);
            }
          } catch {
            // last resort: copy text
            try { await navigator.clipboard?.writeText(text); } catch {}
          }
          setShareStatus("done");
          setTimeout(() => setShareStatus("idle"), 2000);
        };
        return (
          <div className="ce-modal-overlay" onClick={() => setExpandedId(null)}>
            <div className="ce-modal-card" ref={modalCardRef} onClick={(e) => e.stopPropagation()}>
              <button className="ce-modal-close" onClick={() => setExpandedId(null)}>
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
              <div className="ce-modal-header">
                <div className="ce-modal-header-left">
                  <div className="ce-modal-name">{prov.provider_name}</div>
                  <div className="ce-modal-type">{prov.provider_type}</div>
                </div>
                {prov.quality_rating != null && (
                  <div className="ce-modal-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} viewBox="0 0 24 24" className={s <= Math.round(prov.quality_rating!) ? "ce-star-filled" : "ce-star-empty"}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                )}
              </div>
              <div className="ce-modal-price-row">
                <div>
                  <div className="ce-prov-price-label">up to</div>
                  <div className="ce-modal-price">{formatPrice(prov.price)}</div>
                </div>
                {badge && (
                  <div className="ce-prov-badge ce-modal-badge" style={{ color: badge.color }}>
                    <svg viewBox="0 0 24 24" style={{ stroke: badge.color }}>
                      {badge.dir === "up" ? <><polyline points="4 16 8 12 12 15 20 7" fill="none" /><polyline points="15 7 20 7 20 12" fill="none" /></> : <><polyline points="4 8 8 12 12 9 20 17" fill="none" /><polyline points="15 17 20 17 20 12" fill="none" /></>}
                    </svg>
                    {badge.label}
                  </div>
                )}
              </div>
              <div className="ce-modal-tags">
                <span className="ce-proc-cpt">{serviceName}</span>
                {prov.price_type && <span className="ce-proc-cpt">{prov.price_type}</span>}
                <span className="ce-proc-cpt">{planName}</span>
              </div>
              <div className="ce-modal-details">
                <div className="ce-modal-detail-row">
                  <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  <span>{detail?.provider?.address || `${prov.city}, ${prov.state}`}</span>
                </div>
                <div className="ce-modal-detail-row">
                  <svg viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
                  <span>{prov.distance_miles} mi away</span>
                </div>
                {phone && (
                  <div className="ce-modal-detail-row">
                    <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    <a href={`tel:${phone.replace(/\D/g, "")}`} onClick={() => track('cost_estimator_phone_clicked', { provider_id: prov.provider_id })}>{formatPhone(phone)}</a>
                  </div>
                )}
                {detail?.provider?.website_url && (
                  <div className="ce-modal-detail-row">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                    <a href={detail.provider.website_url} target="_blank" rel="noopener noreferrer" onClick={() => track('cost_estimator_website_clicked', { provider_id: prov.provider_id })}>{(() => { try { return new URL(detail.provider.website_url).hostname.replace(/^www\./, ""); } catch { return "Visit website"; } })()}</a>
                  </div>
                )}
                  {detail && detail.price_components.length > 0 && (
                    <div className="ce-modal-components">
                      <div className="ce-prov-components-title">Fee breakdown</div>
                      {detail.price_components.map((comp, i) => (
                        <div key={i} className="ce-prov-component-row">
                          <span className="ce-prov-component-name">{comp.component_name}</span>
                          {comp.fee_type && <span className="ce-prov-component-type">{comp.fee_type}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              <button className="ce-modal-share" onClick={handleShare} disabled={shareStatus === "sharing"}>
                {shareStatus === "done" ? (
                  <>
                    <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                    Copied!
                  </>
                ) : shareStatus === "sharing" ? (
                  "Capturing..."
                ) : (
                  <>
                    <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                    Share
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })()}

      {!isWebview && (
        <ChatEntrySection source="cost-estimator" />
      )}

      {isAnonymous && !isWebview && (
        // <ToolLoginModal
        //   title="Your price comparison is ready"
        //   description="Enter your name and email to view and save your results."
        //   onSuccess={() => { /* auth store update at verifyOtp() call at the auth-service will unmount modal */ }}
        // />

        <SignUpModal 
        // dismissible={!isAnonymous || isWebview}
        onDismiss={() => useLoginModalStore.getState().close()}
        />
      )}

      <footer className="ce-results-footer">&copy; 2026 August AI. All rights reserved.</footer>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="ce-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}><span style={{ color: "#a09a8e" }}>Loading...</span></div>}>
      <ResultsContent />
    </Suspense>
  );
}
