'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type {
  EhrCondition,
  EhrMedication,
  EhrAllergy,
  EhrProcedure,
  EhrObservation,
  EhrImmunization,
  EhrEncounter,
  EhrDiagnosticReport,
  EhrCarePlan,
  EhrClinicalNote,
} from '@/types/ehr';

// ─── Utilities ───

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatShortDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`;
}

function hasMeaningfulText(value?: string | null): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 && normalized !== 'unknown' && normalized !== 'none';
}

// ─── Status Badge ───

type BadgeVariant = 'green' | 'amber' | 'red' | 'blue' | 'gray';

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  green: { bg: 'bg-[#EAFAF2]', text: 'text-[#1D7A55]', dot: 'bg-[#1D7A55]' },
  amber: { bg: 'bg-[#FFF8EC]', text: 'text-[#B8791A]', dot: 'bg-[#B8791A]' },
  red: { bg: 'bg-[#FEF1F1]', text: 'text-[#C44040]', dot: 'bg-[#C44040]' },
  blue: { bg: 'bg-[#EEF4FF]', text: 'text-[#3B74C4]', dot: 'bg-[#3B74C4]' },
  gray: { bg: 'bg-[#F3F4F4]', text: 'text-[#6B7370]', dot: 'bg-[#6B7370]' },
};

const STATUS_VARIANT_MAP: Record<string, BadgeVariant> = {
  active: 'green',
  inactive: 'gray',
  resolved: 'gray',
  completed: 'green',
  finished: 'green',
  'in-progress': 'blue',
  stopped: 'red',
  cancelled: 'gray',
  high: 'red',
  low: 'blue',
  H: 'red',
  L: 'blue',
  N: 'green',
};

function resolveVariant(status: string): BadgeVariant {
  return STATUS_VARIANT_MAP[status.toLowerCase()] ?? 'gray';
}

function StatusBadge({ label, variant }: { label: string; variant?: BadgeVariant }) {
  const normalized = label.trim().toLowerCase();
  if (!normalized || normalized === 'unknown') return null;

  const resolved = variant ?? resolveVariant(label);
  const colors = VARIANT_STYLES[resolved];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${colors.bg} ${colors.text}`}>
      <span className={`w-[5px] h-[5px] rounded-full ${colors.dot}`} />
      {label}
    </span>
  );
}

// ─── Timeline Item ───

function TimelineItem({
  date,
  title,
  subtitle,
  badge,
  isLast,
}: {
  date?: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className="flex">
      {/* Date column */}
      <div className="w-14 text-right pr-2.5 pt-3 shrink-0">
        <span className="text-[11px] font-semibold text-[#8A9290] tracking-wide">
          {formatShortDate(date)}
        </span>
      </div>

      {/* Spine */}
      <div className="w-7 flex flex-col items-center shrink-0 relative">
        {/* Dot - aligned with date text and card title (both have ~12px padding + ~8px to center of text) */}
        <div className="w-3 h-3 rounded-full bg-[rgba(105,117,112,0.1)] flex items-center justify-center mt-[15px] z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-[#697570]" />
        </div>
        {/* Vertical line */}
        {!isLast && (
          <div className="absolute top-[27px] bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] bg-[rgba(105,117,112,0.08)]" />
        )}
      </div>

      {/* Content card */}
      <div className={`flex-1 bg-[#FBFBFB] rounded-xl p-3 ml-1.5 border border-black/[0.03] ${isLast ? 'mb-0' : 'mb-2'}`}>
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium text-[#1A1E1C] flex-1 leading-5">{title}</span>
          {badge}
        </div>
        {subtitle && <p className="text-xs text-[#6B7370] mt-1 line-clamp-2">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Toggle Button ───

function ToggleButton({
  label,
  expanded,
  onClick
}: {
  label: string;
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 py-3 mt-1 border-t border-black/[0.04] w-full"
    >
      <span className="text-[13px] font-medium text-[#8A9290]">{label}</span>
      {expanded ? (
        <ChevronUp className="w-3.5 h-3.5 text-[#8A9290]" />
      ) : (
        <ChevronDown className="w-3.5 h-3.5 text-[#8A9290]" />
      )}
    </button>
  );
}

// ─── Expandable Details Button ───

function DetailsToggle({ expanded, onClick }: { expanded: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 mt-2.5 px-2.5 py-1.5 rounded-full bg-[#8A929014] text-[12px] font-medium text-[#6B7370]"
    >
      {expanded ? 'Hide details' : 'Details'}
      {expanded ? (
        <ChevronUp className="w-3 h-3 text-[#8A9290]" />
      ) : (
        <ChevronDown className="w-3 h-3 text-[#8A9290]" />
      )}
    </button>
  );
}

// ─── Conditions Renderer ───

function ConditionCard({ condition }: { condition: EhrCondition }) {
  const [expanded, setExpanded] = useState(false);
  const info = condition.condition_data?.[0];
  const isActive = condition.clinical_status_code === 'active';

  const symptoms = info?.symptoms?.filter((s) => hasMeaningfulText(s.name)) ?? [];
  const bodySites = info?.body_site?.filter((site) => hasMeaningfulText(site)) ?? [];
  const causes = info?.causes?.filter((cause) => hasMeaningfulText(cause)) ?? [];

  const hasDetails =
    hasMeaningfulText(condition.verification_status_code) ||
    hasMeaningfulText(condition.severity_display) ||
    !!condition.abatement_at ||
    !!condition.recorded_at ||
    hasMeaningfulText(condition.note_text) ||
    hasMeaningfulText(info?.description) ||
    bodySites.length > 0 ||
    symptoms.length > 0 ||
    causes.length > 0;

  return (
    <div className={`bg-white rounded-[14px] overflow-hidden shadow-sm relative ${isActive ? '' : ''}`}>
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-[3.5px] bg-[#8A9290] rounded-l-[14px]" />
      )}
      <div className="px-4 py-3.5">
        <div className="flex justify-between items-start gap-2.5">
          <span className="text-[15px] font-medium text-[#1A1E1C] flex-1 leading-[21px]">
            {condition.code_display}
          </span>
          {condition.clinical_status_code && (
            <StatusBadge label={condition.clinical_status_code} variant={resolveVariant(condition.clinical_status_code)} />
          )}
        </div>
        {condition.category_display && (
          <p className="text-[13px] text-[#6B7370] mt-1">{condition.category_display}</p>
        )}
        {condition.onset_at && (
          <p className="text-xs text-[#8A9290] mt-1">Onset: {formatDate(condition.onset_at)}</p>
        )}

        {hasDetails && (
          <DetailsToggle expanded={expanded} onClick={() => setExpanded(!expanded)} />
        )}

        {expanded && hasDetails && (
          <div className="mt-2.5 pl-3 border-l-[2.5px] border-black/[0.06] space-y-3">
            {hasMeaningfulText(condition.verification_status_code) && (
              <div>
                <p className="text-[10px] font-bold text-[#8A9290] uppercase tracking-wider">Verification</p>
                <p className="text-[13px] text-[#1A1E1C]">{condition.verification_status_code}</p>
              </div>
            )}
            {hasMeaningfulText(condition.severity_display) && (
              <div>
                <p className="text-[10px] font-bold text-[#8A9290] uppercase tracking-wider">Severity</p>
                <p className="text-[13px] text-[#1A1E1C]">{condition.severity_display}</p>
              </div>
            )}
            {condition.abatement_at && (
              <div>
                <p className="text-[10px] font-bold text-[#8A9290] uppercase tracking-wider">Resolved</p>
                <p className="text-[13px] text-[#1A1E1C]">{formatDate(condition.abatement_at)}</p>
              </div>
            )}
            {condition.recorded_at && (
              <div>
                <p className="text-[10px] font-bold text-[#8A9290] uppercase tracking-wider">Recorded</p>
                <p className="text-[13px] text-[#1A1E1C]">{formatDate(condition.recorded_at)}</p>
              </div>
            )}
            {hasMeaningfulText(condition.note_text) && (
              <div>
                <p className="text-[10px] font-bold text-[#8A9290] uppercase tracking-wider">Note</p>
                <p className="text-[13px] text-[#1A1E1C] line-clamp-3">{condition.note_text}</p>
              </div>
            )}
            {hasMeaningfulText(info?.description) && (
              <div>
                <p className="text-[10px] font-bold text-[#8A9290] uppercase tracking-wider">Description</p>
                <p className="text-[13px] text-[#1A1E1C] line-clamp-3">{info!.description}</p>
              </div>
            )}
            {bodySites.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-[#8A9290] uppercase tracking-wider">Body Site</p>
                <p className="text-[13px] text-[#1A1E1C]">{bodySites.join(', ')}</p>
              </div>
            )}
            {symptoms.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-[#8A9290] uppercase tracking-wider">Symptoms</p>
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {symptoms.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-[#8A929014] rounded-md text-xs text-[#6B7370]">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {causes.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-[#8A9290] uppercase tracking-wider">Causes</p>
                <p className="text-[13px] text-[#1A1E1C]">{causes.join(', ')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConditionsRenderer({ conditions }: { conditions: EhrCondition[] }) {
  const [showResolved, setShowResolved] = useState(false);

  const { active, resolved } = useMemo(() => {
    const act: EhrCondition[] = [];
    const res: EhrCondition[] = [];
    const byDate = (a: EhrCondition, b: EhrCondition) =>
      new Date(b.onset_at || 0).getTime() - new Date(a.onset_at || 0).getTime();

    for (const c of conditions) {
      if (c.clinical_status_code === 'active') act.push(c);
      else res.push(c);
    }
    act.sort(byDate);
    res.sort(byDate);
    return { active: act, resolved: res };
  }, [conditions]);

  if (!conditions.length) return null;

  // If no active items, show all resolved directly without toggle
  if (active.length === 0) {
    return (
      <div className="space-y-2.5">
        {resolved.map((c, i) => (
          <ConditionCard key={c.resource_id || i} condition={c} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {active.map((c, i) => (
        <ConditionCard key={c.resource_id || i} condition={c} />
      ))}
      {resolved.length > 0 && (
        <>
          <ToggleButton
            label={showResolved ? 'Hide resolved' : `Show resolved (${resolved.length})`}
            expanded={showResolved}
            onClick={() => setShowResolved(!showResolved)}
          />
          {showResolved && resolved.map((c, i) => (
            <ConditionCard key={c.resource_id || i} condition={c} />
          ))}
        </>
      )}
    </div>
  );
}

// ─── Medications Renderer ───

function MedicationCard({ medication }: { medication: EhrMedication }) {
  const [expanded, setExpanded] = useState(false);
  const drugInfo = medication.medication_data?.[0];
  const hasDrugInfo = !!drugInfo && (drugInfo.description || drugInfo.indication || drugInfo.mechanism_of_action);

  return (
    <div className="bg-white rounded-[14px] px-4 py-3.5 shadow-sm">
      <span className="text-[15px] font-medium text-[#1A1E1C] leading-[21px] line-clamp-2">
        {medication.code_display}
      </span>

      {hasDrugInfo && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 mt-2.5 px-2.5 py-1.5 rounded-full bg-[#69757010] text-[12px] font-medium text-[#697570]"
          >
            {expanded ? 'Hide info' : 'Drug info'}
            {expanded ? (
              <ChevronUp className="w-3 h-3 text-[#697570]" />
            ) : (
              <ChevronDown className="w-3 h-3 text-[#697570]" />
            )}
          </button>

          {expanded && (
            <div className="mt-2.5 pl-3 border-l-[2.5px] border-[#6975700f] space-y-3">
              {drugInfo.description && (
                <div>
                  <p className="text-[10px] font-bold text-[#8A9290] uppercase tracking-wider">Description</p>
                  <p className="text-[13px] text-[#1A1E1C] line-clamp-3">{drugInfo.description}</p>
                </div>
              )}
              {drugInfo.indication && (
                <div>
                  <p className="text-[10px] font-bold text-[#8A9290] uppercase tracking-wider">Indication</p>
                  <p className="text-[13px] text-[#1A1E1C] line-clamp-3">{drugInfo.indication}</p>
                </div>
              )}
              {drugInfo.mechanism_of_action && (
                <div>
                  <p className="text-[10px] font-bold text-[#8A9290] uppercase tracking-wider">Mechanism</p>
                  <p className="text-[13px] text-[#1A1E1C] line-clamp-3">{drugInfo.mechanism_of_action}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function MedicationsRenderer({ medications }: { medications: EhrMedication[] }) {
  if (!medications.length) return null;

  return (
    <div className="space-y-2.5">
      {medications.map((m, i) => (
        <MedicationCard key={m.resource_id || i} medication={m} />
      ))}
    </div>
  );
}

// ─── Allergies Renderer ───

export function AllergiesRenderer({ allergies }: { allergies: EhrAllergy[] }) {
  if (!allergies.length) return null;

  return (
    <div className="space-y-2.5">
      {allergies.map((allergy, idx) => (
        <div key={allergy.resource_id || idx} className="bg-white rounded-[14px] px-4 py-3.5 shadow-sm">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex-1">
              <span className="text-[15px] font-medium text-[#1A1E1C]">{allergy.code_display}</span>
              {allergy.category && (
                <p className="text-[13px] text-[#6B7370] mt-0.5 capitalize">{allergy.category}</p>
              )}
            </div>
            {allergy.criticality && (
              <StatusBadge
                label={allergy.criticality}
                variant={allergy.criticality === 'high' ? 'red' : 'amber'}
              />
            )}
          </div>
          {allergy.reaction_summary && (
            <p className="text-xs text-[#6B7370] mt-2">{allergy.reaction_summary}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Procedures Renderer ───

export function ProceduresRenderer({ procedures }: { procedures: EhrProcedure[] }) {
  const [showCompleted, setShowCompleted] = useState(false);

  const { active, completed } = useMemo(() => {
    const act: EhrProcedure[] = [];
    const comp: EhrProcedure[] = [];
    const byDate = (a: EhrProcedure, b: EhrProcedure) =>
      new Date(b.performed_start_at || 0).getTime() - new Date(a.performed_start_at || 0).getTime();

    for (const p of procedures) {
      if (p.status === 'completed') comp.push(p);
      else act.push(p);
    }
    act.sort(byDate);
    comp.sort(byDate);
    return { active: act, completed: comp };
  }, [procedures]);

  if (!procedures.length) return null;

  // If no active items, show all completed directly without toggle
  if (active.length === 0) {
    return (
      <div className="pt-1">
        {completed.map((p, i) => (
          <TimelineItem
            key={p.resource_id || i}
            date={p.performed_start_at}
            title={p.code_display}
            subtitle={p.reason_display || undefined}
            isLast={i === completed.length - 1}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="pt-1">
      {active.map((p, i) => (
        <TimelineItem
          key={p.resource_id || i}
          date={p.performed_start_at}
          title={p.code_display}
          subtitle={p.reason_display || undefined}
          isLast={i === active.length - 1 && completed.length === 0}
        />
      ))}

      {completed.length > 0 && (
        <>
          <ToggleButton
            label={showCompleted ? 'Hide completed' : `Completed (${completed.length})`}
            expanded={showCompleted}
            onClick={() => setShowCompleted(!showCompleted)}
          />
          {showCompleted && completed.map((p, i) => (
            <TimelineItem
              key={p.resource_id || i}
              date={p.performed_start_at}
              title={p.code_display}
              subtitle={p.reason_display || undefined}
              isLast={i === completed.length - 1}
            />
          ))}
        </>
      )}
    </div>
  );
}

// ─── Observations Renderer ───

function formatObsValue(obs: { value_num: number | null; value_text: string; value_unit: string; value_display?: string }): string {
  if (obs.value_num != null) {
    const unit = obs.value_unit && !/^\{.*\}$/.test(obs.value_unit.trim()) ? obs.value_unit : '';
    return `${obs.value_num}${unit ? ` ${unit}` : ''}`;
  }
  return obs.value_display || obs.value_text || '';
}

export function ObservationsRenderer({ observations }: { observations: EhrObservation[] }) {
  if (!observations.length) return null;

  return (
    <div className="space-y-2.5">
      {observations.map((obs, idx) => (
        <div key={obs.resource_id || idx} className="bg-white rounded-[14px] px-4 py-3.5 shadow-sm">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex-1">
              <span className="text-[15px] font-medium text-[#1A1E1C] line-clamp-2">{obs.code_display}</span>
              {obs.effective_at && (
                <p className="text-xs text-[#8A9290] mt-1">{formatDate(obs.effective_at)}</p>
              )}
            </div>
            {obs.interpretation_display && (
              <StatusBadge label={obs.interpretation_display} variant={resolveVariant(obs.interpretation_display)} />
            )}
          </div>
          {(obs.value_display || obs.value_text || obs.value_num != null) && (
            <p className="text-sm text-[#1A1E1C] mt-1.5">{formatObsValue(obs)}</p>
          )}
          {obs.ref_range_text && (
            <p className="text-xs text-[#8A9290] mt-1">Ref: {obs.ref_range_text}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Immunizations Renderer ───

export function ImmunizationsRenderer({ immunizations }: { immunizations: EhrImmunization[] }) {
  const { active, completed } = useMemo(() => {
    const act: EhrImmunization[] = [];
    const comp: EhrImmunization[] = [];
    const byDate = (a: EhrImmunization, b: EhrImmunization) =>
      new Date(b.occurrence_at || 0).getTime() - new Date(a.occurrence_at || 0).getTime();

    for (const imm of immunizations) {
      if (imm.status === 'completed') comp.push(imm);
      else act.push(imm);
    }
    act.sort(byDate);
    comp.sort(byDate);
    return { active: act, completed: comp };
  }, [immunizations]);

  if (!immunizations.length) return null;

  // If no active items, show all completed directly without header
  if (active.length === 0) {
    return (
      <div className="pt-1">
        {completed.map((imm, i) => (
          <TimelineItem
            key={imm.resource_id || i}
            date={imm.occurrence_at}
            title={imm.vaccine_display}
            isLast={i === completed.length - 1}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="pt-1">
      {active.map((imm, i) => (
        <TimelineItem
          key={imm.resource_id || i}
          date={imm.occurrence_at}
          title={imm.vaccine_display}
          isLast={i === active.length - 1 && completed.length === 0}
        />
      ))}

      {completed.length > 0 && (
        <>
          <div className="flex items-center justify-center py-3 mt-1 border-t border-black/[0.04]">
            <span className="text-[13px] font-medium text-[#8A9290]">Completed ({completed.length})</span>
          </div>
          {completed.map((imm, i) => (
            <TimelineItem
              key={imm.resource_id || i}
              date={imm.occurrence_at}
              title={imm.vaccine_display}
              isLast={i === completed.length - 1}
            />
          ))}
        </>
      )}
    </div>
  );
}

// ─── Encounters Renderer ───

const INITIAL_COUNT = 10;
const LOAD_MORE_COUNT = 10;

export function EncountersRenderer({ encounters }: { encounters: EhrEncounter[] }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const sorted = useMemo(() => {
    const seen = new Set<string>();
    const deduped = encounters.filter((enc) => {
      const key = `${enc.type_display}|${enc.start_at}|${enc.facility_name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return deduped.sort((a, b) => new Date(b.start_at || 0).getTime() - new Date(a.start_at || 0).getTime());
  }, [encounters]);

  if (!encounters.length) return null;

  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  return (
    <div className="pt-1">
      {visible.map((enc, i) => {
        const subtitle = [enc.class_display, enc.facility_name, enc.provider_name]
          .filter(Boolean)
          .join(' · ');

        return (
          <TimelineItem
            key={enc.resource_id || i}
            date={enc.start_at}
            title={enc.type_display || 'Visit'}
            subtitle={subtitle || undefined}
            isLast={!hasMore && i === visible.length - 1}
          />
        );
      })}
      {hasMore && (
        <button
          onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_COUNT)}
          className="w-full py-4 text-center"
        >
          <span className="text-[13px] font-medium text-[#697570]">
            Show more ({sorted.length - visibleCount} remaining)
          </span>
        </button>
      )}
    </div>
  );
}

// ─── Diagnostic Reports Renderer ───

export function DiagnosticReportsRenderer({ reports }: { reports: EhrDiagnosticReport[] }) {
  if (!reports.length) return null;

  return (
    <div className="space-y-2.5">
      {reports.map((report, idx) => (
        <div key={report.resource_id || idx} className="bg-white rounded-[14px] px-4 py-3.5 shadow-sm">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex-1">
              <span className="text-[15px] font-medium text-[#1A1E1C]">{report.code_display}</span>
              {report.effective_at && (
                <p className="text-xs text-[#8A9290] mt-1">{formatDate(report.effective_at)}</p>
              )}
            </div>
            {report.status && <StatusBadge label={report.status} />}
          </div>
          {report.conclusion_text && (
            <p className="text-xs text-[#6B7370] mt-2 line-clamp-3">{report.conclusion_text}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Care Plans Renderer ───

export function CarePlansRenderer({ carePlans }: { carePlans: EhrCarePlan[] }) {
  if (!carePlans.length) return null;

  return (
    <div className="space-y-2.5">
      {carePlans.map((plan, idx) => (
        <div key={plan.resource_id || idx} className="bg-white rounded-[14px] px-4 py-3.5 shadow-sm">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex-1">
              <span className="text-[15px] font-medium text-[#1A1E1C]">{plan.title || plan.category_display}</span>
              {plan.period_start_at && (
                <p className="text-xs text-[#8A9290] mt-1">Started: {formatDate(plan.period_start_at)}</p>
              )}
            </div>
            {plan.status && <StatusBadge label={plan.status} />}
          </div>
          {plan.description && (
            <p className="text-xs text-[#6B7370] mt-2 line-clamp-2">{plan.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Clinical Notes Renderer ───

export function ClinicalNotesRenderer({ notes }: { notes: EhrClinicalNote[] }) {
  if (!notes.length) return null;

  return (
    <div className="space-y-2.5">
      {notes.map((note, idx) => (
        <div key={note.resource_id || idx} className="bg-white rounded-[14px] px-4 py-3.5 shadow-sm">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex-1">
              <span className="text-[15px] font-medium text-[#1A1E1C]">{note.title || note.type_display}</span>
              {note.date_at && (
                <p className="text-xs text-[#8A9290] mt-1">{formatDate(note.date_at)}</p>
              )}
              {note.author_display && (
                <p className="text-xs text-[#6B7370] mt-1">By: {note.author_display}</p>
              )}
            </div>
            {note.status && <StatusBadge label={note.status} />}
          </div>
        </div>
      ))}
    </div>
  );
}
