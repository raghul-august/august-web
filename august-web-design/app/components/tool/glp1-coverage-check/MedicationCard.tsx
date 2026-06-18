"use client";

import type { MedicationCoverage } from "@/app/utils/tools/glp1-coverage-scoring";

interface MedicationCardProps {
  medication: MedicationCoverage;
}

const STATUS_LABEL: Record<string, string> = {
  likely: "Likely covered",
  possible: "Possible",
  unlikely: "Unlikely",
  not_recommended: "Not recommended",
};

const STATUS_BADGE: Record<string, string> = {
  likely: "glp1-badge-likely",
  possible: "glp1-badge-possible",
  unlikely: "glp1-badge-unlikely",
  not_recommended: "glp1-badge-not-recommended",
};

export default function MedicationCard({ medication }: MedicationCardProps) {
  return (
    <div className="glp1-med-row">
      <div className="glp1-med-row-main">
        <span className="glp1-med-row-name">{medication.name}</span>
        <span className="glp1-med-row-meta">
          {medication.genericName} · {medication.type} · {medication.approvedFor}
        </span>
      </div>
      <span className={`glp1-badge ${STATUS_BADGE[medication.coverageStatus]}`}>
        {STATUS_LABEL[medication.coverageStatus]}
      </span>
      <span className="glp1-med-row-pa">
        <span
          className="glp1-med-row-pa-dot"
          style={{
            background: medication.priorAuthLikely
              ? "var(--glp1-caution)"
              : "var(--glp1-accent)",
          }}
          aria-hidden
        />
        {medication.priorAuthLikely
          ? "Prior authorization likely required"
          : "Prior authorization unlikely"}
      </span>
    </div>
  );
}
