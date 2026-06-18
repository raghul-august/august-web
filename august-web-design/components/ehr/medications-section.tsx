'use client';

import { useState, useEffect, useId } from 'react';
import {
  Activity,
  ClipboardList,
  HelpCircle,
  History,
  Info,
  Lightbulb,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react';
import { useEhrStore } from '@/stores/ehr-store';
import type {
  EhrMedicationPageItem,
  EhrMedicationOrder,
  EhrMedicationDosage,
  EhrMedicationStatus,
  EhrLinkedItem,
} from '@/types/ehr';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import { track } from '@/services/analytics-service';
import { formatDate, LatestNote, pickLatestNote } from './shared-display';
import { EhrPanelFactGrid, EhrPanelSection, EhrSidePanel } from './side-panel';
import { EhrSkeleton } from './ehr-skeleton';

// ── Utilities ──────────────────────────────────────────────────

function titleCase(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Pharmacy/claims feeds frequently dump the dispensed product label
 * ("ATEN 50MG TAB") into the sig field instead of real directions. A genuine
 * sig reads like a sentence (lowercase words, a verb); a product label is a
 * short, ALL-CAPS, form-coded string. Only surface the instruction when it
 * actually looks like directions.
 */
function looksLikeSig(instruction: string | undefined, name: string): boolean {
  const s = instruction?.trim();
  if (!s) return false;
  if (s.toLowerCase() === name.trim().toLowerCase()) return false;
  if (!/[a-z]/.test(s)) return false; // all-caps / SKU-style
  return s.split(/\s+/).length >= 4; // real sigs are sentence-length
}

const ACTIVE_STATUSES = new Set<EhrMedicationStatus>(['active', 'onhold']);

function isActive(m: EhrMedicationPageItem): boolean {
  // Treat unknown status as active so the user sees the row rather than
  // having it silently hidden in the inactive bucket.
  return m.status ? ACTIVE_STATUSES.has(m.status) : true;
}

/** Headline time phrase for the card. Mirrors the conditions convention:
 *  bare date for single-order (with the past-tense "Prescribed" verb so it
 *  reads naturally), and a leading bare date for multi-order — no "since"
 *  prefix because it implies ongoing-ness, which reads wrong for completed
 *  or stopped meds.
 *  - Single order → "Prescribed Mar 15, 2024"
 *  - Multi-order → "Apr 13, 2013 · 4 prescriptions, latest Mar 15, 2024" */
function timePhrase(m: EhrMedicationPageItem): string | null {
  const orderCount = m.orders?.length ?? 1;
  const hasHistory = orderCount > 1;

  if (!hasHistory) {
    return m.prescribed_on ? `Prescribed ${formatDate(m.prescribed_on)}` : null;
  }

  const first = m.prescribed_on ? formatDate(m.prescribed_on) : null;
  const latest = m.last_prescribed_on ? formatDate(m.last_prescribed_on) : null;
  const latestSuffix = latest && latest !== first ? `, latest ${latest}` : '';
  const seen = `${orderCount} prescriptions${latestSuffix}`;
  return first ? `${first} · ${seen}` : seen;
}

// ── Badges ─────────────────────────────────────────────────────

type BadgeVariant = 'green' | 'amber' | 'red' | 'blue' | 'gray';

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  green: { bg: 'bg-[#EAFAF2]', text: 'text-[#1D7A55]', dot: 'bg-[#1D7A55]' },
  amber: { bg: 'bg-[#FFF8EC]', text: 'text-[#B8791A]', dot: 'bg-[#B8791A]' },
  red: { bg: 'bg-[#FEF1F1]', text: 'text-[#C44040]', dot: 'bg-[#C44040]' },
  blue: { bg: 'bg-[#EEF4FF]', text: 'text-[#3B74C4]', dot: 'bg-[#3B74C4]' },
  gray: { bg: 'bg-[#F3F4F4]', text: 'text-[#6B7370]', dot: 'bg-[#6B7370]' },
};

function StatusBadge({ label, variant }: { label: string; variant: BadgeVariant }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${VARIANT_STYLES[variant].bg} ${VARIANT_STYLES[variant].text}`}>
      <span className={`w-[5px] h-[5px] rounded-full ${VARIANT_STYLES[variant].dot}`} />
      {label}
    </span>
  );
}

function statusVariant(status?: EhrMedicationStatus): BadgeVariant {
  if (!status) return 'gray';
  if (status === 'active') return 'green';
  if (status === 'onhold') return 'amber';
  if (status === 'stopped') return 'red';
  return 'gray'; // 'completed'
}

function statusLabel(status: EhrMedicationStatus): string {
  if (status === 'onhold') return 'On Hold';
  return titleCase(status);
}

function severityVariant(severity?: string): BadgeVariant {
  const s = severity?.toLowerCase() ?? '';
  if (/life|severe|serious|major|contraindicat/.test(s)) return 'red';
  if (/moderate/.test(s)) return 'amber';
  if (/minor|mild|low/.test(s)) return 'gray';
  return 'blue';
}

/**
 * Pill colour is not in the backend contract, so derive a stable tint from
 * the medication name — same drug always renders the same colour, giving
 * the list a recognisable visual rhythm without inventing clinical data.
 */
const PILL_TINTS = [
  { c0: '#E8EEF7', c1: '#CDDBEF', tile: '#F1F5FB' }, // blue
  { c0: '#F7EFD9', c1: '#EBD8AF', tile: '#FBF4E6' }, // amber
  { c0: '#EFE9F7', c1: '#DBCBED', tile: '#F5F0FB' }, // violet
  { c0: '#E5F1E9', c1: '#C8E1D2', tile: '#EFF6F1' }, // green
  { c0: '#F7E8EC', c1: '#EFCFD6', tile: '#FBF0F3' }, // rose
  { c0: '#E2F0F0', c1: '#C3E1E1', tile: '#EEF6F6' }, // teal
] as const;

type PillTint = (typeof PILL_TINTS)[number];

function pillTint(seed: string): PillTint {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PILL_TINTS[h % PILL_TINTS.length];
}

function PillIcon({ size = 56, tint }: { size?: number; tint?: PillTint }) {
  const shadeId = useId();
  const baseId = useId();
  const c0 = tint?.c0 ?? '#EEF3F1';
  const c1 = tint?.c1 ?? '#DCE4E1';

  return (
    <svg width={size} height={size} viewBox="0 0 56 56" role="img" aria-hidden>
      <defs>
        <radialGradient id={shadeId} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <linearGradient id={baseId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={c0} />
          <stop offset="100%" stopColor={c1} />
        </linearGradient>
      </defs>
      <circle cx={28} cy={28} r={20} fill={`url(#${baseId})`} stroke="rgba(13,17,23,0.18)" strokeWidth={1} />
      <circle cx={28} cy={28} r={20} fill={`url(#${shadeId})`} />
      <line x1={10} x2={46} y1={28} y2={28} stroke="rgba(13,17,23,0.18)" strokeWidth={0.8} />
    </svg>
  );
}


// ── Reason chip ────────────────────────────────────────────────

function ReasonChip({ reason }: { reason: EhrLinkedItem }) {
  return (
    <span className="inline-flex items-center text-[12px] text-[#3B74C4] bg-[#EEF4FF] px-2 py-0.5 rounded">
      {reason.name}
    </span>
  );
}


// ── Order history row ──────────────────────────────────────────

/** Compose a one-line dosage label including every field. Used both for
 *  diff detection (against the canonical order) and as the rendered text
 *  when an order's dosage differs. Includes route/timing/as_needed because
 *  Gatekeeper now dedupes orders by full dosage shape — two grouped orders
 *  may differ only by, say, route, and the row needs to surface that. */
function dosageSummary(d?: EhrMedicationDosage): string {
  if (!d) return '';
  const parts: string[] = [];
  if (d.dose) parts.push(d.dose);
  if (d.instruction) parts.push(d.instruction);
  if (d.timing) parts.push(d.timing);
  if (d.route) parts.push(d.route);
  if (d.as_needed) parts.push('PRN');
  return parts.join(' · ');
}

function OrderRow({
  order: o,
  parentStatus,
  parentDosage,
  parentReasonName,
}: {
  order: EhrMedicationOrder;
  parentStatus?: EhrMedicationStatus;
  parentDosage?: EhrMedicationDosage;
  parentReasonName?: string;
}) {
  const date = o.prescribed_on ? formatDate(o.prescribed_on) : null;
  const showStatus = !!o.status && o.status !== parentStatus;
  const orderDosageText = dosageSummary(o.dosage);
  const showDosage = !!orderDosageText && orderDosageText !== dosageSummary(parentDosage);
  const orderReason = o.reason?.name;
  const showReason = !!orderReason && orderReason !== parentReasonName;
  const latestNote = pickLatestNote(o.notes ?? []);

  return (
    <div className="relative py-4 first:pt-1">
      <span className="absolute -left-[19px] top-[22px] w-1.5 h-1.5 rounded-full bg-[#C8D0CD]" />
      <div className="flex items-center gap-2 flex-wrap text-[12px] text-[#4A5250]">
        {date ? (
          <span className="font-medium text-[#37413E]">{date}</span>
        ) : (
          <span className="text-[#9AA39F] italic">Undated</span>
        )}
        {showStatus && (
          <StatusBadge label={statusLabel(o.status!)} variant={statusVariant(o.status)} />
        )}
        {showDosage && <span className="text-[#6B7370]">· {orderDosageText}</span>}
        {showReason && <span className="text-[#6B7370]">· for {orderReason}</span>}
      </div>
      {latestNote && (
        <div className="mt-2.5 border-l-2 border-[#D8DEDB] pl-3.5 text-[#4A5250]">
          <LatestNote note={latestNote} />
        </div>
      )}
    </div>
  );
}


// ── Medication panel ───────────────────────────────────────────

function MedicationDetailsPanel({ medication: m }: { medication: EhrMedicationPageItem }) {
  const enrichment = m.enrichment;
  const composition = m.composition ?? [];
  const sideEffects = enrichment?.side_effects?.common ?? [];
  const safety = enrichment?.safety;
  const safetyEntries: { label: string; text: string }[] = [
    safety?.pregnancy ? { label: 'Pregnancy', text: safety.pregnancy } : null,
    safety?.alcohol ? { label: 'Alcohol', text: safety.alcohol } : null,
    safety?.breastfeeding ? { label: 'Breastfeeding', text: safety.breastfeeding } : null,
    safety?.food ? { label: 'Food', text: safety.food } : null,
    safety?.driving ? { label: 'Driving', text: safety.driving } : null,
    safety?.kidney ? { label: 'Kidney', text: safety.kidney } : null,
    safety?.liver ? { label: 'Liver', text: safety.liver } : null,
  ].filter((x): x is { label: string; text: string } => x !== null);
  const generalWarnings = safety?.general ?? [];
  const tips = enrichment?.tips ?? [];
  const interactions = enrichment?.interactions ?? [];
  const interactionGroups = ([
    { variant: 'red', label: 'Severe' },
    { variant: 'amber', label: 'Moderate' },
    { variant: 'blue', label: 'Other' },
    { variant: 'gray', label: 'Minor' },
  ] as const)
    .map(g => ({ ...g, items: interactions.filter(it => severityVariant(it.severity) === g.variant) }))
    .filter(g => g.items.length > 0);
  const faqs = enrichment?.faqs ?? [];
  const mechanism = enrichment?.mechanism;
  const orders = m.orders ?? [];
  const hasHistory = orders.length > 1;
  const notes = m.notes ?? [];
  const time = timePhrase(m);
  const hasSafetyFacts = safetyEntries.length > 0 || generalWarnings.length > 0 || safety?.habit_forming === true;

  // Composition is rendered inline (primary clinical fact). Deeper enrichment
  // — history, education, safety, interactions, FAQs, notes — sits behind the
  // View details expand.
  const hasDosage = !!m.dosage && (
    !!m.dosage.instruction ||
    !!m.dosage.dose ||
    !!m.dosage.timing ||
    !!m.dosage.route ||
    m.dosage.as_needed === true
  );

  const usedForText = enrichment?.overview?.description;
  const mechanismText = mechanism?.description;
  const classLine = (() => {
    const seen = new Set<string>();
    const parts: string[] = [];
    for (const c of [
      mechanism?.drug_class,
      mechanism?.therapeutic_class,
      mechanism?.chemical_class,
      mechanism?.action_class,
    ]) {
      const v = c?.trim();
      if (!v) continue;
      const key = v.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      parts.push(v);
    }
    return parts.join(' · ');
  })();
  const latestNote = pickLatestNote(notes);

  return (
    <article className="overflow-hidden">
      <div className="bg-[#FBFAF7] px-6 py-6 border-b border-[#E4E1DC]">
        <div className="flex items-start gap-5">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[12px] border border-[#E4E1DC]"
            style={{ backgroundColor: pillTint(m.name).tile }}
          >
            <PillIcon size={52} tint={pillTint(m.name)} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <h2 id={`medication-panel-${m.id}`} className="text-[22px] font-semibold tracking-[-0.02em] text-[#111715] leading-tight line-clamp-2">{m.name}</h2>
              {m.status && <StatusBadge label={statusLabel(m.status)} variant={statusVariant(m.status)} />}
            </div>
            {(m.brand || composition.length > 0) && (
              <p className="mt-1.5 text-[13px] text-[#66716E]">
                {m.brand && m.brand !== m.name ? `${m.brand} · ` : ''}
                {composition.length > 0 ? composition.join(' / ') : ''}
              </p>
            )}
            {m.reason && (
              <div className="mt-4 flex items-center gap-2 text-[13px] text-[#111715]">
                <span>Used for</span>
                <ReasonChip reason={m.reason} />
              </div>
            )}
            {mechanismText && (
              <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-[#37413E]">{mechanismText}</p>
            )}
            {classLine && (
              <p className="mt-3 text-[12px] font-medium uppercase tracking-[0.13em] text-[#9AA39F]">{classLine}</p>
            )}
          </div>
        </div>
      </div>

      {hasDosage && m.dosage && (
        <div className="border-b border-[#E4E1DC] px-8 py-6">
          {looksLikeSig(m.dosage.instruction, m.name) && (
            <p className="mb-3 text-[16px] font-semibold tracking-[-0.01em] text-[#111715] leading-snug">{m.dosage.instruction}</p>
          )}
          <EhrPanelFactGrid rows={[
            { label: 'Dose', value: m.dosage.dose },
            { label: 'Timing', value: m.dosage.timing },
            { label: 'Route', value: m.dosage.route },
            { label: 'As needed', value: m.dosage.as_needed ? 'Yes' : null },
            { label: 'Prescribed', value: time },
          ]} />
        </div>
      )}

      {usedForText && (
        <EhrPanelSection title="Used for" icon={<Info className="h-5 w-5" />} defaultOpen={false}>
          <p className="text-[13px] leading-relaxed text-[#37413E]">{usedForText}</p>
        </EhrPanelSection>
      )}

      {(tips.length > 0 || enrichment?.how_to_take?.storage) && (
        <EhrPanelSection title="Tips" icon={<Lightbulb className="h-5 w-5" />} defaultOpen={false}>
          <ul className="space-y-2 text-[13px] leading-relaxed text-[#37413E]">
            {tips.map((tip, i) => <li key={i} className="flex gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[#B8791A]" />{tip}</li>)}
            {enrichment?.how_to_take?.storage && <li className="flex gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[#B8791A]" />Storage: {enrichment.how_to_take.storage}</li>}
          </ul>
        </EhrPanelSection>
      )}

      {faqs.length > 0 && (
        <EhrPanelSection title="FAQs" icon={<HelpCircle className="h-5 w-5" />} defaultOpen={false}>
          <div className="-my-1">
            {faqs.map((faq, i) => (
              <details key={i} className="group/faq border-b border-[#EFEDE8] last:border-0">
                <summary className="flex cursor-pointer select-none list-none items-center gap-3 py-3.5 text-[15px] font-medium text-[#111715] hover:text-[#1F7A5A]">
                  <span className="flex-1">{faq.question}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-[#9AA39F] transition-transform group-open/faq:rotate-180" />
                </summary>
                <div className="space-y-2 pb-4 pr-7 text-[15px] leading-relaxed text-[#4A5250]">
                  {faq.answers.map((answer, j) => <p key={j}>{answer}</p>)}
                </div>
              </details>
            ))}
          </div>
        </EhrPanelSection>
      )}

      {(sideEffects.length > 0 || enrichment?.side_effects?.note || hasSafetyFacts) && (
        <EhrPanelSection title="What to watch for" icon={<ShieldAlert className="h-5 w-5" />} defaultOpen={false}>
          <div className="space-y-6">
            {sideEffects.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A9290] font-semibold mb-2">Side effects</p>
                <ul className="space-y-2.5 text-[13px] leading-relaxed text-[#37413E]">
                  {sideEffects.map((s, i) => <li key={i} className="flex gap-3"><span className="mt-3 h-1.5 w-1.5 rounded-full bg-[#6B7370]" />{s}</li>)}
                </ul>
              </div>
            )}
            {enrichment?.side_effects?.note && (
              <p className="text-[13px] leading-relaxed text-[#66716E]">{enrichment.side_effects.note}</p>
            )}
            {hasSafetyFacts && (
              <div className="border-t border-[#E4E1DC] pt-5">
                <EhrPanelFactGrid rows={[
                  ...safetyEntries.map(entry => ({ label: entry.label, value: entry.text })),
                  { label: 'Habit forming', value: safety?.habit_forming === true ? 'Yes' : null },
                  { label: 'Warnings', value: generalWarnings.length > 0 ? generalWarnings.join(' · ') : null },
                ]} />
              </div>
            )}
          </div>
        </EhrPanelSection>
      )}

      {interactions.length > 0 && (
        <EhrPanelSection title={`Drug interactions (${interactions.length})`} icon={<Activity className="h-5 w-5" />} defaultOpen={false}>
          <div className="space-y-5">
            {interactionGroups.map(group => (
              <div key={group.variant}>
                <div className="mb-1">
                  <StatusBadge label={`${group.label} · ${group.items.length}`} variant={group.variant} />
                </div>
                <div className="divide-y divide-[#EFEDE8]">
                  {group.items.map((interaction, i) => (
                    <details key={i} className="group/itx">
                      <summary className="flex cursor-pointer select-none list-none items-center gap-3 py-3 text-[15px] font-medium text-[#111715] hover:text-[#1F7A5A]">
                        <span className="flex-1">{interaction.medication}</span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-[#9AA39F] transition-transform group-open/itx:rotate-180" />
                      </summary>
                      <div className="pb-3.5 pr-7">
                        {interaction.effect && (
                          <p className="text-[14px] leading-relaxed text-[#37413E]">{interaction.effect}</p>
                        )}
                        {interaction.note && (
                          <p className="mt-1.5 text-[13px] leading-relaxed text-[#8A9290]">{interaction.note}</p>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </EhrPanelSection>
      )}

      {hasHistory && (
        <EhrPanelSection title="Prescription history" icon={<History className="h-5 w-5" />} defaultOpen={false}>
          <div className="ml-[5px] border-l border-[#E4E1DC] pl-4 divide-y divide-[#EFEDE8]">
            {orders.map(o => (
              <OrderRow
                key={o.id}
                order={o}
                parentStatus={m.status}
                parentDosage={m.dosage}
                parentReasonName={m.reason?.name}
              />
            ))}
          </div>
        </EhrPanelSection>
      )}

      {latestNote && (
        <EhrPanelSection title="Notes" icon={<ClipboardList className="h-5 w-5" />} defaultOpen={false}>
          <LatestNote note={latestNote} />
        </EhrPanelSection>
      )}
    </article>
  );
}

function MedicationRow({ medication: m, onOpen }: { medication: EhrMedicationPageItem; onOpen: () => void }) {
  const time = timePhrase(m);
  const dosage = dosageSummary(m.dosage);
  const subtitle = m.brand && m.brand !== m.name
    ? m.brand
    : (m.composition?.[0] ?? dosage);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group grid w-full grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-4 rounded-[14px] border border-[#E4E8E6] bg-white px-4 py-3.5 text-left shadow-sm transition hover:border-[#C8D8D1] hover:bg-[#FCFDFD] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#206E55]/30 focus-visible:ring-offset-2"
    >
      <span
        className="flex h-14 w-14 items-center justify-center rounded-[10px] border border-[#E4E8E6]"
        style={{ backgroundColor: pillTint(m.name).tile }}
      >
        <PillIcon size={42} tint={pillTint(m.name)} />
      </span>
      <span className="min-w-0">
        <span className="line-clamp-1 text-[15px] font-semibold text-[#1A1E1C]">{m.name}</span>
        {subtitle && <span className="mt-0.5 block truncate text-[13px] text-[#6B7370]">{subtitle}</span>}
        {time && <span className="mt-1.5 block text-[12px] text-[#8A9290]">{time}</span>}
      </span>
      <span className="flex flex-col items-end gap-2">
        {m.status && <StatusBadge label={statusLabel(m.status)} variant={statusVariant(m.status)} />}
        {dosage && dosage !== subtitle && (
          <span className="max-w-[260px] truncate text-[13px] text-[#4A5250]">{dosage}</span>
        )}
      </span>
    </button>
  );
}

// ── Main Section ───────────────────────────────────────────────

export function MedicationsPageSection({ personId }: { personId: string }) {
  const fetchMedicationsPage = useEhrStore(s => s.fetchMedicationsPage);
  const refreshSeq = useEhrStore(s => s.pageRefreshSeq[personId] ?? 0);
  const [items, setItems] = useState<EhrMedicationPageItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedPersonId, setLoadedPersonId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchMedicationsPage(personId)
      .then(res => {
        if (!cancelled) {
          setItems(res);
          setError(null);
          setLoadedPersonId(personId);
        }
      })
      .catch(err => {
        logger.error('[EHR] Medications page fetch failed', serializeError(err));
        if (!cancelled) {
          setItems(null);
          setError('Failed to load medications');
          setLoadedPersonId(personId);
        }
      });

    return () => { cancelled = true; };
  }, [personId, refreshSeq, fetchMedicationsPage]);

  const loading = loadedPersonId !== personId;
  const allMeds = items ?? [];
  const activeMeds = allMeds.filter(isActive);
  const inactiveMeds = allMeds.filter(m => !isActive(m));
  const selectedMedication = selectedId ? allMeds.find(m => m.id === selectedId) ?? null : null;

  if (loading) {
    return <EhrSkeleton />;
  }

  if (error) {
    return <p className="text-sm text-[#C44040] text-center py-4">{error}</p>;
  }

  if (allMeds.length === 0) {
    return <p className="text-sm text-[#6B7370] text-center py-4">No medications found</p>;
  }

  return (
    <div className="space-y-6">
      {activeMeds.length > 0 && (
        <section>
          <header className="flex items-baseline gap-2 mb-2.5">
            <span className="text-[12px] uppercase tracking-[0.14em] text-[#6B7370] font-semibold">
              Active
            </span>
            <span className="text-[12px] font-mono tabular-nums text-[#8A9290]">{activeMeds.length}</span>
          </header>
          <div className="space-y-2.5">
            {activeMeds.map((m, i) => (
              <MedicationRow key={m.id} medication={m} onOpen={() => {
                // PHI-safe: section/status/position only, never the drug.
                track('ehr_record_expanded', { section: 'medications', status: 'active', position: i });
                setSelectedId(m.id);
              }} />
            ))}
          </div>
        </section>
      )}

      {inactiveMeds.length > 0 && (
        <section>
          <header className="flex items-baseline gap-2 mb-2.5">
            <span className="text-[12px] uppercase tracking-[0.14em] text-[#6B7370] font-semibold">
              Completed
            </span>
            <span className="text-[12px] font-mono tabular-nums text-[#8A9290]">{inactiveMeds.length}</span>
          </header>
          <div className="space-y-2.5">
            {inactiveMeds.map((m, i) => (
              <MedicationRow key={m.id} medication={m} onOpen={() => {
                track('ehr_record_expanded', { section: 'medications', status: 'completed', position: i });
                setSelectedId(m.id);
              }} />
            ))}
          </div>
        </section>
      )}

      <EhrSidePanel
        open={!!selectedMedication}
        eyebrow="Medication"
        titleId={selectedMedication ? `medication-panel-${selectedMedication.id}` : undefined}
        onClose={() => setSelectedId(null)}
      >
        {selectedMedication && <MedicationDetailsPanel medication={selectedMedication} />}
      </EhrSidePanel>
    </div>
  );
}
