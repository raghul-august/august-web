'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X } from 'lucide-react';

export function EhrSidePanel({
  open,
  eyebrow,
  titleId,
  onClose,
  children,
}: {
  open: boolean;
  eyebrow: string;
  titleId?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
      if (event.key !== 'Tab') return;
      const root = panelRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        if (active === first || !root.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }
      if (active === last || !root.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLButtonElement>('button[aria-label="Close panel"]')?.focus();
    }, 50);
    return () => window.clearTimeout(timer);
  }, [open]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      data-open={open ? 'true' : 'false'}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 border-0 p-0 bg-[#1A1E1C]/25 opacity-0 transition-opacity duration-200 data-[open=true]:opacity-100"
        data-open={open ? 'true' : 'false'}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute right-0 top-0 bottom-0 flex w-[min(820px,92vw)] flex-col overflow-hidden border-l border-[#E4E8E6] bg-white shadow-[-12px_0_40px_rgba(13,17,23,0.10)] transition-transform duration-300 ease-out ${
          open ? 'translate-x-0 pointer-events-auto' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#E4E8E6] px-6 py-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#8A9290]">{eyebrow}</p>
          <button
            type="button"
            aria-label="Close panel"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4E8E6] bg-[#F8FAF9] text-[#4A5250] hover:bg-[#EEF5F2]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function EhrPanelSection({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group border-t border-[#E4E1DC]" open={defaultOpen}>
      <summary className="flex cursor-pointer select-none list-none items-center gap-2.5 px-6 py-3.5 text-[#37413E] hover:bg-[#FBFAF7]">
        {icon && <span className="text-[#66716E] [&_svg]:h-4 [&_svg]:w-4">{icon}</span>}
        <h3 className="flex-1 text-[14px] font-semibold tracking-[-0.01em]">{title}</h3>
        <ChevronDown className="h-4 w-4 text-[#66716E] transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-6 pb-5">
        {children}
      </div>
    </details>
  );
}

export function EhrPanelFactGrid({ rows }: { rows: Array<{ label: string; value: ReactNode }> }) {
  const visible = rows.filter(row => row.value);
  if (visible.length === 0) return null;

  return (
    <dl className="grid grid-cols-[minmax(120px,0.4fr)_minmax(0,1fr)] gap-x-6 gap-y-2">
      {visible.map(row => (
        <div key={row.label} className="contents">
          <dt className="text-[13px] text-[#6B7370]">{row.label}</dt>
          <dd className="min-w-0 text-[13px] text-[#111715] break-words">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
