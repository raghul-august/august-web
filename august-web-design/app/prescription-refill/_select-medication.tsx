'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, MagnifyingGlass, X } from '@phosphor-icons/react';
import { COLORS } from './_palette';
import { PrimaryButton } from './_primary-button';
import { MEDICATIONS, type Medication } from './_medications';
import { readPatientInfo, writePatientInfo } from './_patient-info';

export type { Medication };

/*
 * Catalog is ~190 entries — a plain dropdown is unusable. We render a text
 * input that filters the list as the user types (matches name, dose,
 * conditions, and drug class). Results appear in a popover styled like the
 * old dropdown panel so the rest of the page chrome stays consistent.
 *
 * Only FEATURED medications (mirroring the backend whitelist) are selectable
 * — every other catalog entry is shown greyed-out and disabled so the demo
 * stays on rails while still proving the catalog is real.
 */

const MAX_RESULTS = 50;
// Mirrors the backend's VALID_MEDICATION_IDS. Anything outside this set is
// shown greyed-out and disabled; entries here float to the top of the list.
const FEATURED_IDS = new Set([
  'acetaminophen',
  'apixaban',
  'aspirin',
  'atenolol',
  'atorvastatin',
  'bimatoprost',
  'bisacodyl',
  'bisoprolol',
  'bupropion',
  'carvedilol',
  'celecoxib',
  'cetirizine',
  'chlorhexidine',
  'dicyclomine',
  'docusate',
  'famotidine',
  'folic_acid',
  'ibuprofen',
  'indomethacin',
  'irbesartan',
  'labetalol',
  'lactulose',
  'latanoprost',
  'levocetirizine',
  'lidocaine_patch',
  'linaclotide',
  'linagliptin',
  'loperamide',
  'loratadine',
  'losartan',
  'lovastatin',
  'meclizine',
  'metformin',
  'metoclopramide',
  'metoprolol',
  'mometasone',
  'montelukast',
  'nebivolol',
  'olmesartan',
  'pravastatin',
  'propranolol',
  'rosuvastatin',
  'simvastatin',
  'telmisartan',
  'timolol',
  'valsartan',
]);

function matches(medication: Medication, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  if (medication.name.toLowerCase().includes(q)) return true;
  if (medication.drugClass?.toLowerCase().includes(q)) return true;
  if (medication.conditions?.some((c) => c.toLowerCase().includes(q))) return true;
  return false;
}

function secondaryLabel(medication: Medication): string {
  // Conditions read "what is this for" — most useful in a search list, and
  // every catalog entry has them. Dose is part of the prescription block
  // and only revealed after DoseSpot retrieval, so it doesn't belong here.
  if (medication.conditions?.length) return medication.conditions.join(' · ');
  if (medication.drugClass) return medication.drugClass;
  return '';
}

export function SelectMedication({
  onContinue,
}: {
  onContinue: (medication: Medication) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down'>('down');
  const inputRef = useRef<HTMLInputElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Demographic fields. Prefilled from localStorage so a return visit
  // shows what the user typed last time, and mirrored back on every
  // change so create-incognito-user (called later from DoseSpotRetrieval)
  // sees the latest values without an explicit save step.
  const [firstName, setFirstName] = useState(() => readPatientInfo().firstName);
  const [lastName, setLastName] = useState(() => readPatientInfo().lastName);
  const [age, setAge] = useState(() => readPatientInfo().age);
  const [gender, setGender] = useState(() => readPatientInfo().gender);

  useEffect(() => {
    writePatientInfo({ firstName, lastName, age, gender });
  }, [firstName, lastName, age, gender]);

  const selected = MEDICATIONS.find((m) => m.id === selectedId) ?? null;

  const { results, totalMatches } = useMemo(() => {
    const filtered = MEDICATIONS.filter((m) => matches(m, query));
    // Featured rows float to the top so they're always visible — even when
    // the catalog is locked, the 5 demo picks remain in reach.
    const sorted = [
      ...filtered.filter((m) => FEATURED_IDS.has(m.id)),
      ...filtered.filter((m) => !FEATURED_IDS.has(m.id)),
    ];
    return { results: sorted.slice(0, MAX_RESULTS), totalMatches: sorted.length };
  }, [query]);

  const showPopover = open;

  // Popover max-height is 340 — if the input has at least that much (plus
  // a 12px breathing margin) below it before the viewport edge, open
  // downward. Otherwise flip upward so the list isn't clipped.
  const POPOVER_MAX_HEIGHT = 340;
  function pickDirection() {
    const el = searchBarRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    if (spaceBelow >= POPOVER_MAX_HEIGHT + 12 || spaceBelow >= spaceAbove) {
      setDirection('down');
    } else {
      setDirection('up');
    }
  }

  function openPopover() {
    pickDirection();
    setOpen(true);
  }

  return (
    <div>
      <h1
        style={{
          color: COLORS.textOnBg,
          fontSize: '30px',
          fontWeight: 500,
          lineHeight: '36px',
          letterSpacing: '-1.3px',
          textAlign: 'center',
          margin: 0,
        }}
      >
        Refill details
      </h1>
      <p
        style={{
          color: COLORS.textOnBg,
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '23px',
          letterSpacing: '-0.2px',
          textAlign: 'center',
          margin: '8px 0 0',
        }}
      >
        A few quick details, then the medication you&apos;re refilling.
      </p>

      {/* Demographic block — name + age + gender. Sits above the
          medication search; doesn't gate Continue today, but the
          information travels with the refill submission later. */}
      <div
        style={{
          marginTop: '32px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
        }}
      >
        <TextField
          label="First name"
          value={firstName}
          onChange={setFirstName}
          autoComplete="given-name"
        />
        <TextField
          label="Last name"
          value={lastName}
          onChange={setLastName}
          autoComplete="family-name"
        />
        <TextField
          label="Age"
          value={age}
          onChange={(v) => setAge(v.replace(/[^0-9]/g, '').slice(0, 3))}
          inputMode="numeric"
          autoComplete="off"
        />
        <SelectField
          label="Sex"
          value={gender}
          onChange={setGender}
          placeholder="Select"
          options={['Female', 'Male', 'Non-binary', 'Prefer not to say']}
        />
      </div>

      <div style={{ marginTop: '24px' }}>
        <label
          style={{
            display: 'block',
            color: COLORS.textOnBg,
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '18px',
            marginBottom: '8px',
            marginLeft: '4px',
          }}
        >
          Medication
        </label>

        <div style={{ position: 'relative' }}>
          <div
            ref={searchBarRef}
            style={{
              width: '100%',
              height: '52px',
              borderRadius: '10px',
              border: open
                ? `1px solid ${COLORS.textOnSurface}`
                : '1px solid rgba(4, 5, 5, 0.18)',
              background: COLORS.surface,
              padding: '0 12px 0 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'border 0.2s ease-in-out',
            }}
          >
            <MagnifyingGlass
              size={18}
              color={COLORS.textOnSurface}
              weight="bold"
              style={{ opacity: 0.55, flexShrink: 0 }}
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              placeholder={
                selected
                  ? selected.name
                  : 'Search by name, condition, or class'
              }
              onChange={(e) => {
                setQuery(e.target.value);
                openPopover();
                if (selectedId) setSelectedId(null);
              }}
              onFocus={() => openPopover()}
              aria-autocomplete="list"
              aria-expanded={showPopover}
              aria-controls="medication-search-results"
              style={{
                flex: 1,
                minWidth: 0,
                height: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '16px',
                color: COLORS.textOnSurface,
                fontWeight: selected && !query ? 500 : 400,
              }}
            />
            {(query || selected) && (
              <button
                type="button"
                aria-label="Clear"
                onClick={() => {
                  setQuery('');
                  setSelectedId(null);
                  openPopover();
                  inputRef.current?.focus();
                }}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: 'none',
                  background: COLORS.surfaceMuted,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  padding: 0,
                }}
              >
                <X size={12} color={COLORS.textOnSurface} weight="bold" />
              </button>
            )}
          </div>

          {showPopover && (
            <>
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 10,
                }}
              />
              <div
                id="medication-search-results"
                role="listbox"
                style={{
                  position: 'absolute',
                  ...(direction === 'down'
                    ? { top: 'calc(100% + 6px)' }
                    : { bottom: 'calc(100% + 6px)' }),
                  left: 0,
                  right: 0,
                  maxHeight: '340px',
                  overflowY: 'auto',
                  background: COLORS.surface,
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow:
                    '0 24px 56px rgba(13, 39, 64, 0.18), 0 6px 14px rgba(13, 39, 64, 0.1), 0 0 0 1px rgba(13, 39, 64, 0.08)',
                  zIndex: 20,
                  padding: '6px',
                }}
              >
                {results.length === 0 ? (
                  <div
                    style={{
                      padding: '14px 12px',
                      fontSize: '14px',
                      color: COLORS.textOnSurface,
                      opacity: 0.6,
                    }}
                  >
                    No medications match &ldquo;{query}&rdquo;.
                  </div>
                ) : (
                  <>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {results.map((m) => {
                        const isSelected = m.id === selectedId;
                        const isClickable = FEATURED_IDS.has(m.id);
                        const secondary = secondaryLabel(m);
                        return (
                          <li key={m.id} role="option" aria-selected={isSelected}>
                            <button
                              type="button"
                              disabled={!isClickable}
                              onClick={() => {
                                if (!isClickable) return;
                                setSelectedId(m.id);
                                setQuery('');
                                setOpen(false);
                              }}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                background: isSelected ? COLORS.surfaceMuted : 'transparent',
                                border: 'none',
                                textAlign: 'left',
                                cursor: isClickable ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                fontSize: '15px',
                                color: COLORS.textOnSurface,
                                opacity: isClickable ? 1 : 0.38,
                                transition: 'background 0.15s ease-in-out',
                              }}
                              onMouseEnter={(e) => {
                                if (isClickable && !isSelected)
                                  e.currentTarget.style.background = COLORS.surfaceMuted;
                              }}
                              onMouseLeave={(e) => {
                                if (isClickable && !isSelected)
                                  e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <span style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ fontWeight: 500 }}>{m.name}</span>
                                {secondary && (
                                  <span
                                    style={{
                                      display: 'block',
                                      marginTop: '2px',
                                      fontSize: '13px',
                                      fontWeight: 400,
                                      opacity: 0.65,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {secondary}
                                  </span>
                                )}
                              </span>
                              {isSelected && (
                                <Check size={16} color={COLORS.textOnSurface} weight="bold" />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    {totalMatches > results.length && (
                      <div
                        style={{
                          padding: '8px 12px 4px',
                          fontSize: '12px',
                          color: COLORS.textOnSurface,
                          opacity: 0.5,
                        }}
                      >
                        Showing {results.length} of {totalMatches} matches — keep typing to narrow.
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <PrimaryButton
          disabled={!selected}
          onClick={() => {
            if (selected) onContinue(selected);
          }}
        >
          Continue
        </PrimaryButton>
      </div>
    </div>
  );
}

/*
 * Field primitives styled to match the medication search input above —
 * 52px tall, 10px radius, light surface with a muted border that darkens
 * on focus. Kept local to this file because they're only used here.
 */
function TextField({
  label,
  value,
  onChange,
  autoComplete,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  const [focused, setFocused] = useState(false);
  return (
    <label style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={fieldLabelStyle}>{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        style={fieldInputStyle(focused)}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <span style={fieldLabelStyle}>{label}</span>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          ...fieldInputStyle(open),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          textAlign: 'left',
          cursor: 'pointer',
          color: value ? COLORS.textOnSurface : 'rgba(4, 5, 5, 0.45)',
        }}
      >
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || placeholder}
        </span>
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          style={{
            flexShrink: 0,
            transition: 'transform 0.2s ease-in-out',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="#040505"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <>
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 10 }}
          />
          <ul
            role="listbox"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              margin: 0,
              padding: '6px',
              listStyle: 'none',
              background: COLORS.surface,
              borderRadius: '12px',
              boxShadow:
                '0 24px 56px rgba(13, 39, 64, 0.18), 0 6px 14px rgba(13, 39, 64, 0.1), 0 0 0 1px rgba(13, 39, 64, 0.08)',
              zIndex: 20,
              maxHeight: '260px',
              overflowY: 'auto',
            }}
          >
            {options.map((o) => {
              const isSelected = o === value;
              return (
                <li key={o} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o);
                      setOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: isSelected ? COLORS.surfaceMuted : 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      fontSize: '15px',
                      color: COLORS.textOnSurface,
                      fontWeight: isSelected ? 500 : 400,
                      transition: 'background 0.15s ease-in-out',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = COLORS.surfaceMuted;
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span>{o}</span>
                    {isSelected && (
                      <Check size={16} color={COLORS.textOnSurface} weight="bold" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

const fieldLabelStyle: React.CSSProperties = {
  display: 'block',
  color: COLORS.textOnBg,
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '18px',
  marginBottom: '8px',
  marginLeft: '4px',
};

function fieldInputStyle(focused: boolean): React.CSSProperties {
  return {
    width: '100%',
    height: '52px',
    borderRadius: '10px',
    border: focused
      ? `1px solid ${COLORS.textOnSurface}`
      : '1px solid rgba(4, 5, 5, 0.18)',
    background: COLORS.surface,
    padding: '0 14px',
    fontSize: '16px',
    color: COLORS.textOnSurface,
    outline: 'none',
    transition: 'border 0.2s ease-in-out',
    fontFamily: 'inherit',
  };
}
