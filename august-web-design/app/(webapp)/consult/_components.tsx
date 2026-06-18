'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarBlank, CaretDown, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export const GENDER_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
];

export const TOTAL_STEPS = 5;

// USPS-recognized states, federal district, and territories. The 2-letter
// codes are what we POST to the backend (matches the address.state_name
// shape MDI expects).
export const US_STATES: { code: string; name: string }[] = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'AS', name: 'American Samoa' },
  { code: 'GU', name: 'Guam' },
  { code: 'MP', name: 'Northern Mariana Islands' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'VI', name: 'U.S. Virgin Islands' },
];

const STATE_BY_CODE: Record<string, string> = US_STATES.reduce(
  (acc, s) => {
    acc[s.code] = s.name;
    return acc;
  },
  {} as Record<string, string>,
);

const STATE_CODE_BY_NAME: Record<string, string> = US_STATES.reduce(
  (acc, s) => {
    acc[s.name.toLowerCase()] = s.code;
    return acc;
  },
  {} as Record<string, string>,
);

// Resolve free-text input into a canonical 2-letter code if possible.
// Accepts a 2-letter code ("ca", "CA") or full state name ("california").
export function resolveStateCode(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const upper = trimmed.toUpperCase();
  if (upper.length === 2 && STATE_BY_CODE[upper]) return upper;
  const byName = STATE_CODE_BY_NAME[trimmed.toLowerCase()];
  return byName || null;
}

export function BeautifulLoader({ label, fullScreen, small }: { label?: string; fullScreen?: boolean; small?: boolean }) {
  const size = small ? "h-8 w-8" : "h-14 w-14";
  const gap = small ? "gap-3" : "gap-6";
  const padding = small ? "py-6" : "py-12";

  return (
    <div className={cn(
      "flex flex-col items-center justify-center",
      gap, padding,
      fullScreen && "min-h-[60vh]"
    )}>
      <div
        className={cn(
          "rounded-full border-2 border-[#206E55]/20 border-t-[#206E55] animate-spin",
          size,
        )}
      />
      {label && (
        <p
          style={{
            color: '#5A554A',
            fontSize: small ? '13px' : '15px',
            fontWeight: '500',
            letterSpacing: '-0.2px',
          }}
        >
          {label}
        </p>
      )}
    </div>
  );
}

// USPS ZIP — 5 digits.
export function isValidUSZip(zip: string): boolean {
  return /^\d{5}$/.test(zip.trim());
}

// Pragmatic email check — MDI rejects creates with malformed addresses
// (e.g. "deep]@host.com"), so we gate on standard local-part characters
// and a TLD of 2+ letters before round-tripping to the server.
export function isValidEmail(email: string): boolean {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email.trim());
}

// MDI rejects single-character names — require 2+ non-whitespace chars.
export function isValidName(name: string): boolean {
  return name.trim().length >= 2;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function parseMMDDYYYY(v: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
  if (!m) return null;
  const d = new Date(parseInt(m[3]), parseInt(m[1]) - 1, parseInt(m[2]));
  return isNaN(d.getTime()) ? null : d;
}

export function formatMMDDYYYY(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}/${d.getFullYear()}`;
}

export function mmddyyyyToISO(v: string): string | null {
  const d = parseMMDDYYYY(v);
  if (!d) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  const mm = digits.slice(0, 2);
  const dd = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  if (digits.length <= 2) return mm;
  if (digits.length <= 4) return `${mm}/${dd}`;
  return `${mm}/${dd}/${yyyy}`;
}

export function formatUSPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/* ── ProgressBar ── */
export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100;
  return (
    <div
      className="relative w-full h-1.5 rounded-full bg-surface-subtle overflow-hidden"
      aria-label={`Step ${current} of ${total}`}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      <div
        className="absolute inset-y-0 left-0 bg-brand-primary"
        style={{ width: `${pct}%`, transition: 'width 240ms ease' }}
      />
      {Array.from({ length: total - 1 }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute inset-y-0 w-px bg-surface-page"
          style={{ left: `${((i + 1) / total) * 100}%` }}
        />
      ))}
    </div>
  );
}

/* ── Field (composite controls) ── */
export function Field({
  label,
  optional,
  hideOptional,
  children,
}: {
  label: string;
  optional?: boolean;
  hideOptional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span 
        className="flex items-center mb-2 ml-1"
        style={{
          color: '#5A554A',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: '500',
          lineHeight: '18px',
        }}
      >
        {label}
        {optional ? (
          !hideOptional && <span className="ml-1 opacity-60" style={{ fontWeight: 400 }}>(optional)</span>
        ) : (
          <span className="ml-1 inline-flex" aria-hidden>
            <svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.90101 4.90911L1.98198 3.11082L0.464933 4.08667L0.000443876 3.27701L1.61124 2.45457L0.000443876 1.63212L0.464933 0.822465L1.98198 1.79832L1.90101 2.19345e-05H2.82573L2.74476 1.79832L4.26181 0.822465L4.7263 1.63212L3.1155 2.45457L4.7263 3.27701L4.26181 4.08667L2.74476 3.11082L2.82573 4.90911H1.90101Z" fill="#B8453C"/>
            </svg>
          </span>
        )}
      </span>
      {children}
    </div>
  );
}

type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  optional?: boolean;
};

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps & { hideOptional?: boolean }>(
  ({ label, optional, hideOptional, className, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
      <Field label={label} optional={optional} hideOptional={hideOptional}>
        <input
          ref={ref}
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          style={{
            display: 'flex',
            padding: '12px 16px',
            alignItems: 'center',
            alignSelf: 'stretch',
            borderRadius: '10px',
            border: isFocused
              ? '1px solid var(--color-text-primary, #141515)'
              : '0.5px solid var(--color-border-default, #D1CDC2)',
            background: 'var(--color-surface-elevated, #FFF)',
            transition: 'border 0.2s ease-in-out',
            outline: 'none',
            fontSize: 16,
          }}
          className={cn(
            'w-full appearance-none',
            'text-text-primary t-paragraph-md',
            className
          )}
        />
      </Field>
    );
  }
);
TextField.displayName = 'TextField';

/* ── PillGroup ── */
export function PillGroup({
  value,
  onChange,
  options,
  firstButtonRef,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  firstButtonRef?: React.MutableRefObject<HTMLButtonElement | null>;
}) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-2">
      {options.map((opt, i) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            ref={i === 0 ? firstButtonRef : undefined}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            style={{
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
              width: '80px',
              height: '48px',
              borderRadius: '6px',
              border: active 
                ? '1px solid var(--color-brand-primary, #206E55)' 
                : '0.5px solid var(--color-border-default, #D1CDC2)',
              background: active 
                ? '#E8F2ED' 
                : '#F3F1EB',
              color: active 
                ? 'var(--color-brand-primary, #206E55)' 
                : '#5A554A',
              // fontFamily: 'Inter',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '18px',
              transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            className={cn(
              'inline-flex items-center justify-center',
              'active:scale-[0.97]'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── StateCombobox ──
   Typeable + selectable list of US states & territories. The committed value
   (passed up via `onChange`) is always a 2-letter code; the input shows the
   full state name once committed. Filters by both code and name as the user
   types so "ca" or "cali" both surface California. */
export const StateCombobox = React.forwardRef<
  HTMLInputElement,
  {
    value: string;
    onChange: (code: string) => void;
    invalid?: boolean;
    onBlur?: () => void;
    autoComplete?: string;
    enterKeyHint?: React.HTMLAttributes<HTMLInputElement>['enterKeyHint'];
    onEnterAdvance?: () => void;
  }
>(function StateCombobox(
  { value, onChange, invalid, onBlur, autoComplete = 'address-level1', enterKeyHint, onEnterAdvance },
  ref,
) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  // Free-text the user has typed. Empty string while showing committed value.
  const [query, setQuery] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (typeof ref === 'function') ref(inputRef.current);
    else if (ref) ref.current = inputRef.current;
  });

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const target = e.target as Node;
      // The dropdown is portaled to <body>, so it's outside wrapRef — exclude
      // the list explicitly or a click on an option would close before it picks.
      const inWrap = wrapRef.current?.contains(target);
      const inList = listRef.current?.contains(target);
      if (!inWrap && !inList) {
        commitFreeText();
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, query, value]);

  // Measure the input box so the portaled dropdown can be positioned (fixed)
  // directly under it. Re-measure on scroll/resize while open.
  const [menuRect, setMenuRect] = useState<{ left: number; top: number; width: number } | null>(null);
  useEffect(() => {
    if (!open) {
      setMenuRect(null);
      return;
    }
    const measure = () => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setMenuRect({ left: r.left, top: r.bottom + 8, width: r.width });
    };
    measure();
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const displayValue = query ?? (value ? STATE_BY_CODE[value] || value : '');

  const filtered = useMemo(() => {
    const q = (query ?? '').trim().toLowerCase();
    if (!q) return US_STATES;
    return US_STATES.filter(
      (s) => s.code.toLowerCase().startsWith(q) || s.name.toLowerCase().includes(q),
    );
  }, [query]);

  // Keep activeIndex in range when list changes.
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Scroll active option into view as user arrows through.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLLIElement>(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  function commitFreeText() {
    if (query == null) return;
    const code = resolveStateCode(query);
    if (code) {
      onChange(code);
      setQuery(null);
    } else if (query.trim() === '') {
      onChange('');
      setQuery(null);
    } else {
      // Leave query as-is so the form-level validator can flag it. Treat
      // unresolved input as cleared so we don't POST garbage.
      onChange('');
    }
  }

  function pick(code: string) {
    onChange(code);
    setQuery(null);
    setOpen(false);
    onEnterAdvance?.();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (open && filtered[activeIndex]) {
        pick(filtered[activeIndex].code);
      } else {
        commitFreeText();
        setOpen(false);
        onEnterAdvance?.();
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setQuery(null);
    }
    if (e.key === 'Tab') {
      commitFreeText();
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <div
        style={{
          borderRadius: '10px',
          border: open 
            ? '1px solid var(--color-text-primary, #141515)' 
            : '0.5px solid var(--color-border-default, #D1CDC2)',
          background: 'var(--color-surface-elevated, #FFF)',
          transition: 'border 0.2s ease-in-out',
        }}
        className={cn(
          'w-full h-12 pl-5 pr-2 appearance-none flex items-center gap-1 outline-none',
          invalid && 'ring-1 ring-inset ring-red-400',
        )}
      >
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="state-listbox"
          aria-activedescendant={open ? `state-opt-${activeIndex}` : undefined}
          autoComplete={autoComplete}
          autoCapitalize="words"
          enterKeyHint={enterKeyHint}
          placeholder="Start typing…"
          value={displayValue}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Defer so a click on a list item lands before we close.
            setTimeout(() => {
              if (!wrapRef.current?.contains(document.activeElement)) {
                commitFreeText();
                setOpen(false);
                onBlur?.();
              }
            }, 0);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          // 16px prevents iOS Safari focus-zoom (t-paragraph-md is 15px).
          style={{ fontSize: 16 }}
          className="flex-1  min-w-0 h-full bg-transparent outline-none focus-visible:outline-none t-paragraph-md text-text-primary placeholder:text-text-tertiary"
        />
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => {
            // Toggle without stealing focus from the input.
            e.preventDefault();
            setOpen((v) => !v);
            inputRef.current?.focus();
          }}
          aria-label={open ? 'Close states' : 'Open states'}
          className="flex-shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors"
        >
          <CaretDown
            size={14}
            weight="regular"
            style={{ transition: 'transform 160ms ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>
      </div>

      {open && menuRect && typeof document !== 'undefined' && createPortal(
        <ul
          ref={listRef}
          id="state-listbox"
          role="listbox"
          className="max-h-64 overflow-y-auto rounded-xl bg-surface-elevated ring-1 ring-inset ring-border-default py-1"
          style={{
            position: 'fixed',
            left: menuRect.left,
            top: menuRect.top,
            width: menuRect.width,
            zIndex: 9999,
            boxShadow: '0 1px 2px rgba(0,0,0,0.06), 0 16px 40px rgba(0,0,0,0.12)',
            animation: 'consultPopoverIn 200ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {filtered.length === 0 && (
            <li className="px-4 py-3 t-paragraph-sm text-text-tertiary">No matches</li>
          )}
          {filtered.map((s, i) => {
            const isActive = i === activeIndex;
            const isSelected = value === s.code;
            return (
              <li
                key={s.code}
                id={`state-opt-${i}`}
                role="option"
                aria-selected={isSelected}
                data-idx={i}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => {
                  // Pick before blur fires.
                  e.preventDefault();
                  pick(s.code);
                }}
                className={cn(
                  'flex items-center justify-between gap-3 px-4 h-10 cursor-pointer t-paragraph-md',
                  isActive ? 'bg-surface-subtle text-text-primary' : 'text-text-primary',
                )}
              >
                <span className="truncate">{s.name}</span>
                <span className="t-label-sm text-text-tertiary tabular-nums">{s.code}</span>
              </li>
            );
          })}
        </ul>,
        document.body,
      )}
    </div>
  );
});

/* ── DateOfBirthPicker ── */
export function DateOfBirthPicker({
  value,
  onChange,
  inputRef: externalInputRef,
  onEnterAdvance,
}: {
  value: string;
  onChange: (v: string) => void;
  inputRef?: React.MutableRefObject<HTMLInputElement | null>;
  onEnterAdvance?: () => void;
}) {
  const parsed = parseMMDDYYYY(value);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'days' | 'years' | 'decades'>('days');
  const [view, setView] = useState<Date>(parsed ?? new Date(1990, 0, 1));
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (externalInputRef) externalInputRef.current = inputRef.current;
  });

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setMode('days');
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
        setMode('days');
      }
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const yearStart = Math.floor(year / 12) * 12;
  const decadeStart = Math.floor(year / 100) * 100;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const currentDecade = Math.floor(todayYear / 10) * 10;
  const canGoNextMonth = new Date(year, month + 1, 1) <= new Date(todayYear, todayMonth, 1);
  const canGoNextYears = yearStart + 12 <= todayYear;
  const canGoNextCenturies = decadeStart + 100 <= currentDecade;

  function shiftMonth(delta: number) {
    if (delta > 0 && !canGoNextMonth) return;
    setView(new Date(year, month + delta, 1));
  }
  function shiftYears(delta: number) {
    if (delta > 0 && !canGoNextYears) return;
    setView(new Date(year + delta, month, 1));
  }
  function shiftCenturies(delta: number) {
    if (delta > 0 && !canGoNextCenturies) return;
    setView(new Date(year + delta, month, 1));
  }
  function pickDay(d: number) {
    if (new Date(year, month, d) > today) return;
    onChange(formatMMDDYYYY(new Date(year, month, d)));
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <div
        style={{
          borderRadius: '10px',
          border: open 
            ? '1px solid var(--color-text-primary, #141515)' 
            : '0.5px solid var(--color-border-default, #D1CDC2)',
          background: 'var(--color-surface-elevated, #FFF)',
          transition: 'border 0.2s ease-in-out',
        }}
        className={cn('w-full h-12 pl-5 pr-3 appearance-none flex items-center gap-2 outline-none')}
        aria-expanded={open || undefined}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="bday"
          enterKeyHint="next"
          placeholder="MM / DD / YYYY"
          value={value}
          onChange={(e) => {
            const formatted = formatMask(e.target.value);
            onChange(formatted);
            const p = parseMMDDYYYY(formatted);
            if (p) setView(p);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              setOpen(false);
              onEnterAdvance?.();
            }
          }}
          // 16px prevents iOS Safari focus-zoom (t-paragraph-md is 15px).
          style={{ fontSize: 16 }}
          className="flex-1 min-w-0 h-full bg-transparent outline-none focus-visible:outline-none t-paragraph-md text-text-primary placeholder:text-text-tertiary"
        />
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            if (!open) inputRef.current?.blur();
          }}
          aria-label="Open calendar"
          aria-haspopup="dialog"
          aria-expanded={open}
          className="flex-shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors"
        >
          <CalendarBlank size={18} weight="regular" />
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl bg-surface-elevated ring-1 ring-inset ring-border-default p-4 origin-top"
          style={{
            boxShadow: '0 1px 2px rgba(0,0,0,0.06), 0 16px 40px rgba(0,0,0,0.12)',
            animation: 'consultPopoverIn 200ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => mode === 'days' ? shiftMonth(-1) : mode === 'years' ? shiftYears(-12) : shiftCenturies(-100)}
              className="h-9 w-9 inline-flex items-center justify-center rounded-full text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors"
              aria-label="Previous"
            >
              <CaretLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => setMode(mode === 'days' ? 'years' : mode === 'years' ? 'decades' : 'days')}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-full hover:bg-surface-subtle transition-colors t-label-md text-text-primary"
            >
              {mode === 'days'
                ? `${MONTH_NAMES[month]} ${year}`
                : mode === 'years'
                ? `${yearStart} – ${yearStart + 11}`
                : `${decadeStart} – ${decadeStart + 99}`}
              <CaretRight size={11} className="rotate-90 text-text-tertiary" />
            </button>
            <button
              type="button"
              onClick={() => mode === 'days' ? shiftMonth(1) : mode === 'years' ? shiftYears(12) : shiftCenturies(100)}
              disabled={mode === 'days' ? !canGoNextMonth : mode === 'years' ? !canGoNextYears : !canGoNextCenturies}
              className="h-9 w-9 inline-flex items-center justify-center rounded-full text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text-secondary"
              aria-label="Next"
            >
              <CaretRight size={14} />
            </button>
          </div>

          {mode === 'days' ? (
            <div key={`days-${year}-${month}`} style={{ animation: 'consultCellFadeIn 180ms ease-out' }}>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {DOW.map((d) => (
                  <div key={d} className="h-8 inline-flex items-center justify-center t-label-sm text-text-tertiary">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDow }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const d = i + 1;
                  const isSelected =
                    parsed && parsed.getFullYear() === year && parsed.getMonth() === month && parsed.getDate() === d;
                  const isFuture = new Date(year, month, d) > today;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => pickDay(d)}
                      disabled={isFuture}
                      style={isFuture ? { opacity: 0.35, cursor: 'not-allowed' } : undefined}
                      className={cn(
                        'h-9 rounded-full inline-flex items-center justify-center t-paragraph-md transition-[background-color,color,transform] duration-150 active:scale-90',
                        isSelected
                          ? 'bg-brand-primary text-text-inverse'
                          : isFuture
                          ? 'text-text-tertiary'
                          : 'text-text-primary hover:bg-surface-subtle'
                      )}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : mode === 'years' ? (
            <div key={`years-${yearStart}`} className="grid grid-cols-4 gap-2" style={{ animation: 'consultCellFadeIn 180ms ease-out' }}>
              {Array.from({ length: 12 }).map((_, i) => {
                const y = yearStart + i;
                const isSelected = parsed && parsed.getFullYear() === y;
                const isFuture = y > todayYear;
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      const targetMonth = y === todayYear && month > todayMonth ? todayMonth : month;
                      setView(new Date(y, targetMonth, 1));
                      setMode('days');
                    }}
                    disabled={isFuture}
                    style={isFuture ? { opacity: 0.35, cursor: 'not-allowed' } : undefined}
                    className={cn(
                      'h-10 rounded-full inline-flex items-center justify-center t-paragraph-md transition-[background-color,color,transform] duration-150 active:scale-90',
                      isSelected
                        ? 'bg-brand-primary text-text-inverse'
                        : isFuture
                        ? 'text-text-tertiary'
                        : 'text-text-primary hover:bg-surface-subtle'
                    )}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          ) : (
            <div key={`decades-${decadeStart}`} className="grid grid-cols-4 gap-2" style={{ animation: 'consultCellFadeIn 180ms ease-out' }}>
              {Array.from({ length: 10 }).map((_, i) => {
                const decade = decadeStart + i * 10;
                const isSelected = parsed && Math.floor(parsed.getFullYear() / 10) * 10 === decade;
                const isFuture = decade > currentDecade;
                return (
                  <button
                    key={decade}
                    type="button"
                    onClick={() => { setView(new Date(decade, month, 1)); setMode('years'); }}
                    disabled={isFuture}
                    style={isFuture ? { opacity: 0.35, cursor: 'not-allowed' } : undefined}
                    className={cn(
                      'h-10 rounded-full inline-flex items-center justify-center t-paragraph-md transition-[background-color,color,transform] duration-150 active:scale-90',
                      isSelected
                        ? 'bg-brand-primary text-text-inverse'
                        : isFuture
                        ? 'text-text-tertiary'
                        : 'text-text-primary hover:bg-surface-subtle'
                    )}
                  >
                    {decade}s
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SuccessPopup({
  title,
  description,
  buttonText,
  onButtonClick,
}: {
  title: string;
  description: React.ReactNode;
  buttonText: string;
  onButtonClick: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        width: '416px',
        maxWidth: '100%',
        minHeight: '327px',
        padding: '24px',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        borderRadius: '16px',
        background: '#FFF',
        boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Scoped keyframes for the badge pop-in. Kept on the SVG itself
          (not the path) so the whole sparkle settles together — animating
          the path alone would lose the spiky edges momentarily. */}
      <style>{`
        @keyframes success-popup-tick-pop {
          0%   { transform: scale(0.4) rotate(-8deg); opacity: 0; }
          60%  { transform: scale(1.1) rotate(2deg);  opacity: 1; }
          100% { transform: scale(1)   rotate(0);     opacity: 1; }
        }
      `}</style>
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transformOrigin: '50% 50%',
          animation:
            'success-popup-tick-pop 520ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}
      >
        <path d="M70.5813 32.1313C69.4031 30.9 68.1844 29.6313 67.725 28.5156C67.3 27.4937 67.275 25.8 67.25 24.1594C67.2031 21.1094 67.1531 17.6531 64.75 15.25C62.3469 12.8469 58.8906 12.7969 55.8406 12.75C54.2 12.725 52.5062 12.7 51.4844 12.275C50.3719 11.8156 49.1 10.5969 47.8687 9.41875C45.7125 7.34687 43.2625 5 40 5C36.7375 5 34.2906 7.34687 32.1313 9.41875C30.9 10.5969 29.6313 11.8156 28.5156 12.275C27.5 12.7 25.8 12.725 24.1594 12.75C21.1094 12.7969 17.6531 12.8469 15.25 15.25C12.8469 17.6531 12.8125 21.1094 12.75 24.1594C12.725 25.8 12.7 27.4937 12.275 28.5156C11.8156 29.6281 10.5969 30.9 9.41875 32.1313C7.34687 34.2875 5 36.7375 5 40C5 43.2625 7.34687 45.7094 9.41875 47.8687C10.5969 49.1 11.8156 50.3688 12.275 51.4844C12.7 52.5062 12.725 54.2 12.75 55.8406C12.7969 58.8906 12.8469 62.3469 15.25 64.75C17.6531 67.1531 21.1094 67.2031 24.1594 67.25C25.8 67.275 27.4937 67.3 28.5156 67.725C29.6281 68.1844 30.9 69.4031 32.1313 70.5813C34.2875 72.6531 36.7375 75 40 75C43.2625 75 45.7094 72.6531 47.8687 70.5813C49.1 69.4031 50.3688 68.1844 51.4844 67.725C52.5062 67.3 54.2 67.275 55.8406 67.25C58.8906 67.2031 62.3469 67.1531 64.75 64.75C67.1531 62.3469 67.2031 58.8906 67.25 55.8406C67.275 54.2 67.3 52.5062 67.725 51.4844C68.1844 50.3719 69.4031 49.1 70.5813 47.8687C72.6531 45.7125 75 43.2625 75 40C75 36.7375 72.6531 34.2906 70.5813 32.1313ZM54.2688 34.2688L36.7688 51.7688C36.5366 52.0012 36.2608 52.1856 35.9574 52.3114C35.6539 52.4372 35.3285 52.502 35 52.502C34.6715 52.502 34.3461 52.4372 34.0426 52.3114C33.7392 52.1856 33.4634 52.0012 33.2312 51.7688L25.7312 44.2688C25.2621 43.7996 24.9986 43.1634 24.9986 42.5C24.9986 41.8366 25.2621 41.2004 25.7312 40.7312C26.2003 40.2621 26.8366 39.9986 27.5 39.9986C28.1634 39.9986 28.7997 40.2621 29.2688 40.7312L35 46.4656L50.7312 30.7312C50.9635 30.499 51.2393 30.3147 51.5428 30.189C51.8462 30.0633 52.1715 29.9986 52.5 29.9986C52.8285 29.9986 53.1538 30.0633 53.4572 30.189C53.7607 30.3147 54.0365 30.499 54.2688 30.7312C54.501 30.9635 54.6853 31.2393 54.811 31.5428C54.9367 31.8462 55.0014 32.1715 55.0014 32.5C55.0014 32.8285 54.9367 33.1538 54.811 33.4572C54.6853 33.7607 54.501 34.0365 54.2688 34.2688Z" fill="#3D8168"/>
      </svg>
      <h3
        style={{
          color: '#141515',
          textAlign: 'center',
          fontSize: '24px',
          fontStyle: 'normal',
          fontWeight: '500',
          lineHeight: '25px',
          letterSpacing: '-0.4px',
          margin: '8px 0 0',
        }}
      >
        {title}
      </h3>
      <div
        style={{
          color: '#5A554A',
          textAlign: 'center',
          fontSize: '15px',
          fontStyle: 'normal',
          fontWeight: '400',
          lineHeight: '24px',
          margin: '4px 0 16px',
          maxWidth: '320px',
        }}
      >
        {description}
      </div>
      <button
        type="button"
        onClick={onButtonClick}
        style={{
          display: 'flex',
          width: '368px',
          maxWidth: '100%',
          height: '52px',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '999px',
          background: '#206E55',
          color: '#FFF',
          border: 'none',
          cursor: 'pointer',
          fontWeight: '500',
        }}
        className="t-label-lg"
      >
        {buttonText}
      </button>
    </div>
  );
}

export function BottomSheetShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          background: '#FFFFFF',
          boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.18)',
          borderRadius: '24px 24px 0 0',
          padding: '12px 16px 40px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '0 0 16px',
            flex: 'none',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '4px',
              background: '#F3F1EB',
              borderRadius: '2px',
            }}
            aria-hidden
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
