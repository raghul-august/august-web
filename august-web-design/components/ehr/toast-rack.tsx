'use client';

/**
 * Top-right toast stack for transient notifications. Mounted once at the page
 * level. Success toasts auto-dismiss after a few seconds; error toasts stay
 * until the user dismisses them so they can read the failure.
 *
 * Uses the store's `toasts` array as the source of truth — components push
 * toasts via `pushToast`, this rack just renders them.
 */

import { useEffect } from 'react';
import { Check, AlertTriangle, X, Info } from 'lucide-react';
import { useEhrStore, type Toast } from '@/stores/ehr-store';

const SUCCESS_AUTO_DISMISS_MS = 4000;
const INFO_AUTO_DISMISS_MS = 4000;

export function ToastRack() {
  const toasts = useEhrStore(s => s.toasts);
  const dismissToast = useEhrStore(s => s.dismissToast);

  // Auto-dismiss timers per toast. We keep the timer keyed by toast id so
  // re-renders (the array reference changes when other toasts get added)
  // don't reset existing timers.
  useEffect(() => {
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    for (const t of toasts) {
      if (t.kind === 'error') continue;
      const delay = t.kind === 'info' ? INFO_AUTO_DISMISS_MS : SUCCESS_AUTO_DISMISS_MS;
      const handle = setTimeout(() => dismissToast(t.id), delay);
      timers.push(handle);
    }
    return () => {
      for (const h of timers) clearTimeout(h);
    };
  }, [toasts, dismissToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-[60] flex flex-col gap-2 max-w-[calc(100vw-32px)] w-[340px] pointer-events-none"
    >
      {toasts.map(t => (
        <ToastCard key={t.id} toast={t} onDismiss={() => dismissToast(t.id)} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const accent =
    toast.kind === 'success'
      ? 'border-l-[#206E55]'
      : toast.kind === 'error'
        ? 'border-l-[#C44040]'
        : 'border-l-[#6B7370]';
  const Icon = toast.kind === 'success' ? Check : toast.kind === 'error' ? AlertTriangle : Info;
  const iconColor =
    toast.kind === 'success'
      ? 'text-[#206E55]'
      : toast.kind === 'error'
        ? 'text-[#C44040]'
        : 'text-[#6B7370]';

  return (
    <div
      className={`pointer-events-auto bg-white rounded-xl shadow-xl border border-[#E4E8E6] border-l-4 ${accent} px-3.5 py-3 flex items-start gap-2.5`}
    >
      <Icon className={`h-4 w-4 ${iconColor} mt-0.5 shrink-0`} />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-[#1A1E1C] truncate">{toast.title}</div>
        {toast.body && (
          <div className="text-[12px] text-[#6B7370] mt-0.5">{toast.body}</div>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="text-[#8A9290] hover:text-[#1A1E1C] p-0.5 rounded shrink-0"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
