"use client";

import { useRef, useState } from "react";
import { CheckCircleIcon, InfoIcon, QuestionIcon } from "@phosphor-icons/react/ssr";

import UsCoverageMap from "./UsCoverageMap";

const NAMES: Record<string, string> = { AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "Washington, D.C.", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming" };

const ZIP: Array<[number, number, string]> = [[5, 5, "NY"], [6, 9, "PR"], [10, 27, "MA"], [28, 29, "RI"], [30, 38, "NH"], [39, 49, "ME"], [50, 59, "VT"], [60, 69, "CT"], [70, 89, "NJ"], [100, 149, "NY"], [150, 196, "PA"], [197, 199, "DE"], [200, 205, "DC"], [206, 219, "MD"], [220, 246, "VA"], [247, 268, "WV"], [270, 289, "NC"], [290, 299, "SC"], [300, 319, "GA"], [320, 349, "FL"], [350, 369, "AL"], [370, 385, "TN"], [386, 397, "MS"], [398, 399, "GA"], [400, 427, "KY"], [430, 459, "OH"], [460, 479, "IN"], [480, 499, "MI"], [500, 528, "IA"], [530, 549, "WI"], [550, 567, "MN"], [569, 569, "DC"], [570, 577, "SD"], [580, 588, "ND"], [590, 599, "MT"], [600, 629, "IL"], [630, 658, "MO"], [660, 679, "KS"], [680, 693, "NE"], [700, 714, "LA"], [716, 729, "AR"], [730, 749, "OK"], [750, 799, "TX"], [800, 816, "CO"], [820, 831, "WY"], [832, 838, "ID"], [840, 847, "UT"], [850, 865, "AZ"], [870, 884, "NM"], [889, 898, "NV"], [900, 961, "CA"], [967, 968, "HI"], [970, 979, "OR"], [980, 994, "WA"], [995, 999, "AK"]];

function resolve(v: string): string | null {
  v = (v || "").trim();
  if (!v) return null;
  const digits = v.replace(/\D/g, "");
  if (/^\d/.test(v) && digits.length >= 3) {
    const p = parseInt(digits.slice(0, 3), 10);
    for (let i = 0; i < ZIP.length; i++) {
      if (p >= ZIP[i][0] && p <= ZIP[i][1]) return ZIP[i][2];
    }
    return "??";
  }
  const up = v.toUpperCase().replace(/\./g, "");
  if (NAMES[up]) return up;
  const lc = v.toLowerCase().replace(/[.,]/g, "").replace(/\s+/g, " ").trim();
  if (lc === "washington dc" || lc === "district of columbia") return "DC";
  for (const k in NAMES) {
    if (NAMES[k].toLowerCase().replace(/[.,]/g, "") === lc) return k;
  }
  return null;
}

type Result =
  | { kind: "ok"; name: string }
  | { kind: "all" }
  | { kind: "error" }
  | null;

export default function CoverageChecker() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Result>(null);

  function clearMap(svg: Element) {
    svg.querySelectorAll(".us-state.active").forEach((p) => p.classList.remove("active"));
    const tick = svg.querySelector("#mapTick") as SVGGraphicsElement | null;
    if (tick) tick.style.display = "none";
  }

  function highlight(st: string) {
    const svg = mapRef.current?.querySelector("svg");
    if (!svg) return;
    clearMap(svg);
    const path = svg.querySelector(`.us-state[data-st="${st}"]`) as SVGGraphicsElement | null;
    if (!path) return;
    path.classList.add("active");
    const tick = svg.querySelector("#mapTick") as SVGGraphicsElement | null;
    if (tick) {
      try {
        const bb = path.getBBox();
        tick.setAttribute("transform", `translate(${bb.x + bb.width / 2},${bb.y + bb.height / 2})`);
        tick.style.display = "";
      } catch {
        /* getBBox can throw if not rendered */
      }
    }
  }

  function clearHighlight() {
    const svg = mapRef.current?.querySelector("svg");
    if (svg) clearMap(svg);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const st = resolve(value);
    if (st && NAMES[st]) {
      highlight(st);
      setResult({ kind: "ok", name: NAMES[st] });
    } else if (st === "PR" || (st && !NAMES[st] && st !== "??")) {
      clearHighlight();
      setResult({ kind: "all" });
    } else {
      clearHighlight();
      setResult({ kind: "error" });
    }
  }

  return (
    <section className="checker-sec" aria-label="Coverage checker">
      <div className="wrap">
        <div className="checker-wrap">
          <div className="checker-card" data-anim="scale-in" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h2>See if August is available in <span>your state</span></h2>
            <p>Enter your state or ZIP code to confirm August&apos;s virtual urgent care reaches your area.</p>
            <form className="checker-form" id="checkerForm" aria-label="Check availability" onSubmit={onSubmit}>
              <label htmlFor="zipInput" className="visually-hidden" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>State or ZIP code</label>
              <input type="text" id="zipInput" placeholder="Enter state or ZIP code" inputMode="text" autoComplete="postal-code" value={value} onChange={(e) => setValue(e.target.value)} />
              <button type="submit" className="btn btn-primary" style={{ minWidth: "auto", padding: "16px 28px", minHeight: "56px", borderRadius: "var(--radius-md)", background: "#1A1A1A", borderColor: "#1A1A1A" }}>Check availability</button>
            </form>
            <p className={`checker-result${result && result.kind !== "ok" ? " miss" : ""}`} id="checkerResult" role="status" aria-live="polite">
              {result?.kind === "ok" && (<><CheckCircleIcon className="ph" aria-hidden /> Yes, August is available in {result.name}.</>)}
              {result?.kind === "all" && (<><InfoIcon className="ph" aria-hidden /> August is available across all 50 states + DC.</>)}
              {result?.kind === "error" && (<><QuestionIcon className="ph" aria-hidden /> Enter a valid US state or ZIP code.</>)}
            </p>
          </div>
          <div className="checker-map" ref={mapRef}>
            <UsCoverageMap />
          </div>
        </div>
      </div>
    </section>
  );
}
