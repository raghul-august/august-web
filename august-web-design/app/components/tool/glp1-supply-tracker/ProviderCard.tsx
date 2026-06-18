"use client";

import type { GLP1Medication } from "@/app/data/tools/glp1-supply-tracker-config";

interface APIProvider {
  id: string;
  name: string;
  badge: string | null;
  url: string;
  activePricing: { dose: string; price: number }[];
  lowestPrice: number | null;
}

interface Props {
  provider: APIProvider;
  medication: GLP1Medication;
  onVisit: (providerId: string) => void;
  isTopPick?: boolean;
}

export default function ProviderCard({ provider, onVisit, isTopPick }: Props) {
  return (
    <div className={`tool-card gm-provider-card${isTopPick ? " gm-top-pick" : ""}`}>
      {isTopPick && <span className="gm-top-pick-label">Top Pick</span>}
      <div className="gm-card-header">
        <h3 className="gm-provider-name">{provider.name}</h3>
        {provider.badge && (
          <span className="gm-badge-text">{provider.badge}</span>
        )}
      </div>

      {provider.lowestPrice !== null && (
        <div className="gm-lowest-price">
          Starting at <strong>${provider.lowestPrice}</strong>/mo
        </div>
      )}

      <div className="gm-card-body">
        <div className="gm-card-pricing">
          {provider.activePricing.length > 0 ? (
            <div className="gm-pricing-grid">
              {provider.activePricing.map((tier) => (
                <div key={tier.dose} className="gm-dose-item">
                  <span className="gm-dose-label">{tier.dose}</span>
                  <span className="gm-dose-price">${tier.price}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="gm-no-pricing">Check provider for current pricing</p>
          )}
        </div>
      </div>

      <div className="gm-card-actions flex justify-center">
        <a
          href={provider.url}
          target="_blank"
          rel="noopener noreferrer"
          className="tool-btn tool-btn--primary mb-0"
          onClick={() => onVisit(provider.id)}
        >
          Visit Provider
        </a>
      </div>
    </div>
  );
}
