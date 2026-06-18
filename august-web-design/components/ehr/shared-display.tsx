'use client';

/**
 * Shared display primitives for EHR page sections.
 *
 * Used by encounters, lab-reports, procedures, allergies, and immunizations
 * sections built on the per-page contract in `src/types/ehr.ts`. The two
 * pre-existing sections (conditions, medications) have their own inline
 * helpers and are not refactored to use these — see those files directly.
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { EhrLinkedItem, EhrNoteDisplay } from '@/types/ehr';
import { cleanClinicalText } from '@/utils/clean-text';


// ── Date formatter ─────────────────────────────────────────────

/**
 * Format a known-date string ("YYYY-MM-DD..." or full ISO timestamp) into a
 * human-readable date. Used for fields where the contract guarantees a date
 * value (e.g. `period.start`, `last_occurrence`, `recorded`).
 */
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Format a possibly-date string into human-readable form. Used for free
 * display fields like `since`, `period.display`, or `onset_or_recorded`
 * where the contract allows either a date (sourced from a FHIR dateTime) or
 * a free-text fallback (e.g. "Age 35", "Spring 2023"). Only attempts to
 * parse and format strings that match the ISO date prefix pattern; other
 * inputs pass through unchanged.
 */
export function formatPossibleDate(s?: string | null): string {
  if (!s) return '';
  if (!/^\d{4}-\d{2}-\d{2}/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function titleCase(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}


// ── Status badges ──────────────────────────────────────────────

export type BadgeVariant = 'green' | 'amber' | 'red' | 'blue' | 'gray';

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  green: { bg: 'bg-[#EAFAF2]', text: 'text-[#1D7A55]', dot: 'bg-[#1D7A55]' },
  amber: { bg: 'bg-[#FFF8EC]', text: 'text-[#B8791A]', dot: 'bg-[#B8791A]' },
  red: { bg: 'bg-[#FEF1F1]', text: 'text-[#C44040]', dot: 'bg-[#C44040]' },
  blue: { bg: 'bg-[#EEF4FF]', text: 'text-[#3B74C4]', dot: 'bg-[#3B74C4]' },
  gray: { bg: 'bg-[#F3F4F4]', text: 'text-[#6B7370]', dot: 'bg-[#6B7370]' },
};

export function StatusBadge({ label, variant }: { label: string; variant: BadgeVariant }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${VARIANT_STYLES[variant].bg} ${VARIANT_STYLES[variant].text}`}>
      <span className={`w-[5px] h-[5px] rounded-full ${VARIANT_STYLES[variant].dot}`} />
      {label}
    </span>
  );
}


// ── Detail label ───────────────────────────────────────────────

export function DetailLabel({ children }: { children: string }) {
  return <span className="text-[11px] font-semibold text-[#8A9290] uppercase tracking-wider">{children}</span>;
}


// ── Linked-item chips ──────────────────────────────────────────

/**
 * Renders a flat list of EhrLinkedItem chips. Targets are not made navigable
 * here — section components decide whether to make a chip a navigation link
 * (e.g., via the `onNavigate` callback or a chip-level wrapper component).
 */
export function LinkedChips({ items }: { items: EhrLinkedItem[] }) {
  // Collapse duplicate-named items into one chip with a count multiplier so a
  // procedure linked to e.g. 31 "Spirometry Routine" reports reads as a single
  // "Spirometry Routine ×31" chip instead of a wall of duplicates. Group on a
  // normalized key (whitespace-cleaned + case-insensitive) so backend casing
  // inconsistencies — confirmed in the data: "Spirometry Routine" vs
  // "SPIROMETRY ROUTINE" — still merge. The first-seen spelling is shown.
  // Note: merging is purely by name — distinct items that share a name
  // collapse to one chip (and one item's `target`). Fine while chips are
  // non-interactive; revisit the key if they ever become navigable links.
  const grouped: { name: string; count: number }[] = [];
  const indexByKey = new Map<string, number>();
  for (const item of items) {
    const name = cleanClinicalText(item.name);
    const key = name.toLowerCase();
    const existing = indexByKey.get(key);
    if (existing != null) {
      grouped[existing].count += 1;
    } else {
      indexByKey.set(key, grouped.length);
      grouped.push({ name, count: 1 });
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {grouped.map(({ name, count }, i) => (
        <span key={i} className="inline-flex items-center text-[12px] text-[#3B74C4] bg-[#EEF4FF] px-2 py-0.5 rounded">
          {name}
          {count > 1 && <span className="ml-1 text-[#6B7370]">×{count}</span>}
        </span>
      ))}
    </div>
  );
}


// ── Notes list ─────────────────────────────────────────────────

/**
 * Clinical notes commonly arrive as inlined markdown — the full body crammed
 * onto a single line with `# Heading`, `## Subheading`, and `- bullet` markers
 * embedded mid-stream. Insert paragraph breaks before headings and line breaks
 * before list markers so a markdown renderer can structure the content. The
 * regex requires a leading whitespace before the marker, which preserves
 * mid-word hyphens like "non-hispanic" or "year-old".
 */
function preprocessNoteText(text: string): string {
  return text
    .replace(/\s+(#{1,6}\s)/g, '\n\n$1')
    .replace(/\s+(-\s)/g, '\n$1');
}

const MARKDOWN_COMPONENTS: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  h1: ({ children }) => <h1 className="text-[14px] font-semibold mt-2 mb-1 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="text-[13px] font-semibold mt-2 mb-1 first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="text-[13px] font-medium mt-1.5 mb-0.5 first:mt-0">{children}</h3>,
  h4: ({ children }) => <h4 className="text-[13px] font-medium mt-1.5 mb-0.5 first:mt-0">{children}</h4>,
  p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-4 mb-1 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-4 mb-1 space-y-0.5">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
};

function NoteBody({ text }: { text: string }) {
  return (
    <div className="text-[13px] text-[#1A1E1C] leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
        {preprocessNoteText(text)}
      </ReactMarkdown>
    </div>
  );
}

/** Choose the most recent note from a list. Sort by `time` descending; notes
 *  with no `time` sink to the end. Returns null if the array is empty. */
export function pickLatestNote(notes: EhrNoteDisplay[]): EhrNoteDisplay | null {
  if (notes.length === 0) return null;
  const sorted = [...notes].sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return b.time.localeCompare(a.time);
  });
  return sorted[0];
}

/** Render a single note (markdown body + author/time subtitle). Used by
 *  conditions/medications, which deliberately surface only the most recent
 *  note rather than the full history. */
export function LatestNote({ note }: { note: EhrNoteDisplay }) {
  return (
    <div>
      <NoteBody text={note.text} />
      {(note.author || note.time) && (
        <p className="text-[11px] text-[#8A9290] mt-0.5">
          {note.author}{note.author && note.time ? ' · ' : ''}{note.time ? formatDate(note.time) : ''}
        </p>
      )}
    </div>
  );
}

export function NotesList({ notes }: { notes: EhrNoteDisplay[] }) {
  return (
    <div className="space-y-3">
      {notes.map((n, i) => (
        <div key={i}>
          <NoteBody text={n.text} />
          {(n.author || n.time) && (
            <p className="text-[11px] text-[#8A9290] mt-0.5">
              {n.author}{n.author && n.time ? ' · ' : ''}{n.time ? formatDate(n.time) : ''}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Group notes by their `time` (date) and render one date header per group.
 * Most recent date first; notes with no date fall to a "Date unknown" trailing
 * group. Useful for medications/allergies where a single concept accumulates
 * notes across many dates and the per-note date noise of the flat NotesList
 * gets repetitive.
 */
export function GroupedNotesList({ notes }: { notes: EhrNoteDisplay[] }) {
  const groups: Array<{ date: string | null; notes: EhrNoteDisplay[] }> = [];
  const indexByKey = new Map<string, number>();
  for (const n of notes) {
    const key = n.time ?? '__unknown__';
    let idx = indexByKey.get(key);
    if (idx === undefined) {
      idx = groups.push({ date: n.time ?? null, notes: [] }) - 1;
      indexByKey.set(key, idx);
    }
    groups[idx].notes.push(n);
  }
  // Most recent first; null dates sink to the bottom.
  groups.sort((a, b) => {
    if (a.date === null && b.date === null) return 0;
    if (a.date === null) return 1;
    if (b.date === null) return -1;
    return b.date.localeCompare(a.date);
  });

  return (
    <div className="space-y-3">
      {groups.map((g, gi) => (
        <div key={gi}>
          <p className="text-[11px] font-semibold text-[#8A9290] uppercase tracking-wider">
            {g.date ? formatDate(g.date) : 'Date unknown'}
          </p>
          <div className="mt-1 space-y-2">
            {g.notes.map((n, ni) => (
              <div key={ni}>
                <NoteBody text={n.text} />
                {n.author && (
                  <p className="text-[11px] text-[#8A9290] mt-0.5">{n.author}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}


// ── String list (bulleted) ─────────────────────────────────────

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="text-[13px] text-[#1A1E1C] list-disc pl-4 mt-1">
      {items.map((x, i) => <li key={i}>{x}</li>)}
    </ul>
  );
}


// ── Key/value pair list (used for participants, locations, etc.) ─

export function StringChips({ items, variant = 'gray' }: { items: string[]; variant?: BadgeVariant }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((x, i) => (
        <span key={i} className={`inline-flex items-center text-[12px] px-2 py-0.5 rounded ${VARIANT_STYLES[variant].bg} ${VARIANT_STYLES[variant].text}`}>
          {x}
        </span>
      ))}
    </div>
  );
}
