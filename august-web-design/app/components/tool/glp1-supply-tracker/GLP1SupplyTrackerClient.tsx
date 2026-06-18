"use client";

import { type ReactNode, useState, useEffect, useRef, useCallback, useMemo } from "react";
import ToolLandingLayout from "../shared/ToolLandingLayout";
import SegmentedControl from "../shared/SegmentedControl";
import ProviderCard from "./ProviderCard";
import { track, trackToolEvent } from "@/app/utils/analytics";
import {
  MEDICATION_OPTIONS,
  US_STATES,
} from "@/app/data/tools/glp1-supply-tracker-config";
import type { GLP1Medication } from "@/app/data/tools/glp1-supply-tracker-config";
import { ToolAuthGate } from "@/components/auth";

type SortBy = "match" | "price-asc" | "price-desc";

interface APIProvider {
  id: string;
  name: string;
  badge: string | null;
  url: string;
  activePricing: { dose: string; price: number }[];
  lowestPrice: number | null;
}

export default function GLP1SupplyTrackerClient({ afterContent }: { afterContent?: ReactNode }) {
  const [phase, setPhase] = useState<"select" | "results">("select");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [medication, setMedication] = useState<GLP1Medication>("semaglutide");
  const [sortBy, setSortBy] = useState<SortBy>("match");
  const [results, setResults] = useState<APIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackToolEvent("glp1-supply-tracker", "viewed");
  }, []);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        medication,
        sort: sortBy,
      });
      if (selectedState) params.set("state", selectedState);
      const res = await fetch(`/api/glp1-supply-tracker/providers?${params}`);
      if (!res.ok) throw new Error("Failed to load providers");
      const data = await res.json();
      setResults(data.providers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [medication, selectedState, sortBy]);

  // Refetch when filters/sort change, but only in results phase
  useEffect(() => {
    if (phase !== "results") return;
    fetchProviders();
  }, [phase, fetchProviders]);

  const priceBounds = useMemo(() => {
    if (results.length === 0) return [0, 1000] as [number, number];
    const prices = results.flatMap(p => p.activePricing.map(t => t.price)).filter(Boolean);
    if (prices.length === 0) return [0, 1000] as [number, number];
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))] as [number, number];
  }, [results]);

  useEffect(() => {
    setPriceRange(priceBounds);
  }, [priceBounds]);

  const filteredResults = useMemo(() => {
    return results.filter(p => {
      if (p.lowestPrice === null) return true;
      return p.lowestPrice >= priceRange[0] && p.lowestPrice <= priceRange[1];
    });
  }, [results, priceRange]);

  const isFiltered = selectedState !== null || medication !== "semaglutide" || sortBy !== "match" || priceRange[0] !== priceBounds[0] || priceRange[1] !== priceBounds[1];

  const clearFilters = () => {
    setSelectedState(null);
    setMedication("semaglutide");
    setSortBy("match");
    setPriceRange(priceBounds);
  };

  const handleVisit = (providerId: string) => {
    track("tool_cta_clicked", { tool: "glp1-supply-tracker", provider: providerId });
    trackToolEvent("glp1-supply-tracker", "cta_clicked", { provider: providerId });
  };

  const handleShowResults = () => {
    if(typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    trackToolEvent("glp1-supply-tracker", "started", {
      state: selectedState,
      medication,
    });
    setPhase("results");
    
  };

  const canProceed = selectedState !== null;

  return (
    <>
    <ToolLandingLayout
      hero={{
        title: (
          <>
            <span className="accent-gradient">GLP-1</span> Supply Tracker
          </>
        ),
        tagline: "Compare providers based on price, service, and more.",
      }}
      afterContent={afterContent}
      beforeContent={
        phase === "select" ? (
          <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 24px 48px" }}>
            <div className="tool-card gm-select-card">
              <h2 className="gm-select-heading">Find your provider</h2>
              <p className="gm-select-subtitle">
                Tell us your state and preferred medication to see matched providers.
              </p>

              <div className="gm-select-step">
                <label className="gm-filter-label" htmlFor="gm-state-initial">
                  Your State
                </label>
                <select
                  id="gm-state-initial"
                  className=" gm-pill-select"
                  value={selectedState ?? ""}
                  onChange={(e) => setSelectedState(e.target.value || null)}
                  style={{ width: "100%" }}
                >
                  <option value="">Select your state</option>
                  {US_STATES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="gm-select-step">
                <span className="gm-filter-label">Medication</span>
                <SegmentedControl
                  options={[...MEDICATION_OPTIONS]}
                  value={medication}
                  onChange={(v) => setMedication(v as GLP1Medication)}
                  ariaLabel="Select medication type"
                  className="gm-med-toggle"
                />
              </div>

                <div className="flex justify-end">
                  <button
                    className="tool-btn tool-btn--primary gm-submit-btn "
                    disabled={!canProceed}
                    onClick={handleShowResults}
                    >
                    See Results
                  </button>
                </div>
            </div>
          </div>
        ) : (
          <div ref={resultsRef} style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 48px" }}>
            <div className="gm-filter-bar">
              <div className="gm-filter-group">
                <label className="tool-form-label" htmlFor="gm-state-filter">State</label>
                <select
                  id="gm-state-filter"
                  className="gm-pill-select"
                  value={selectedState ?? ""}
                  onChange={(e) => setSelectedState(e.target.value || null)}
                >
                  <option value="">All States</option>
                  {US_STATES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="gm-filter-group">
                <label className="tool-form-label" htmlFor="gm-sort-filter">Sort by</label>
                <select
                  id="gm-sort-filter"
                  className="gm-pill-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                >
                  <option value="match">Best Match</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              <div className="gm-filter-group">
                <span className="tool-form-label">Medication</span>
                <SegmentedControl
                  options={[...MEDICATION_OPTIONS]}
                  value={medication}
                  onChange={(v) => setMedication(v as GLP1Medication)}
                  ariaLabel="Select medication type"
                  className="gm-med-toggle"
                />
              </div>

              <div className="gm-filter-group gm-filter-group--price">
                <span className="tool-form-label">Price range</span>
                <div className="gm-price-range">
                  <span className="gm-price-bound">${priceRange[0]}</span>
                  <div className="gm-price-slider-wrap">
                    <div className="gm-price-track-bg" />
                    <div
                      className="gm-price-track-fill"
                      style={{
                        left: `${priceBounds[1] > priceBounds[0] ? ((priceRange[0] - priceBounds[0]) / (priceBounds[1] - priceBounds[0])) * 100 : 0}%`,
                        right: `${priceBounds[1] > priceBounds[0] ? ((priceBounds[1] - priceRange[1]) / (priceBounds[1] - priceBounds[0])) * 100 : 0}%`,
                      }}
                    />
                    <input
                      type="range"
                      min={priceBounds[0]}
                      max={priceBounds[1]}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Math.min(+e.target.value, priceRange[1]), priceRange[1]])}
                      className="gm-price-thumb"
                      aria-label="Minimum price"
                    />
                    <input
                      type="range"
                      min={priceBounds[0]}
                      max={priceBounds[1]}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Math.max(+e.target.value, priceRange[0])])}
                      className="gm-price-thumb"
                      aria-label="Maximum price"
                    />
                  </div>
                  <span className="gm-price-bound">${priceRange[1]}</span>
                </div>
              </div>
            </div>

            <div className="gm-results-status">
              <span className="gm-results-count">{filteredResults.length} provider{filteredResults.length !== 1 ? "s" : ""} found</span>
              <span className="gm-results-meta">
                {medication === "semaglutide" ? "Semaglutide" : "Tirzepatide"}
                {selectedState ? ` in ${US_STATES.find(s => s.value === selectedState)?.label ?? selectedState}` : ""}
              </span>
              {isFiltered && (
                <button className="gm-clear-btn" onClick={clearFilters} type="button">
                  Clear filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="gm-results-grid">
                <p>Loading providers...</p>
              </div>
            ) : error ? (
              <div className="gm-empty-state">
                <p>{error}</p>
                <button
                  className="tool-btn tool-btn--primary"
                  onClick={fetchProviders}
                >
                  Retry
                </button>
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="gm-results-grid">
                {filteredResults.map((provider, i) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    medication={medication}
                    onVisit={handleVisit}
                    isTopPick={i === 0}
                  />
                ))}
              </div>
            ) : (
              <div className="gm-empty-state">
                <p>Nothing here for those filters. Try a different state or medication.</p>
              </div>
            )}

          </div>
        )
      }
    />
    <ToolAuthGate active={phase === "results"} />
    </>
  );
}
