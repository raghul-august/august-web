import { useEffect, useRef, useState } from 'react';
import { Building2, Loader2, Plus, Upload } from 'lucide-react';

export function FloatingAddMenu({
  onAddReport,
  onAddProvider,
  canAddProvider,
  loadingProvider,
}: {
  onAddReport: () => void;
  onAddProvider: () => void;
  canAddProvider: boolean;
  loadingProvider?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-40">
      {open && (
        <div className="absolute bottom-16 right-0 bg-white rounded-xl shadow-lg border border-[#E4E8E6] py-2 min-w-[200px] mb-1">
          <button
            onClick={() => { onAddReport(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#F8FAF9] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#EEF5F2] flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4 text-[#206E55]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#1A1E1C] leading-tight">Add report</p>
              <p className="text-[11px] text-[#6B7370] leading-tight mt-0.5">Lab, prescription, scan</p>
            </div>
          </button>
          {canAddProvider && (
            <button
              onClick={() => { onAddProvider(); setOpen(false); }}
              disabled={loadingProvider}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#F8FAF9] transition-colors disabled:opacity-60"
            >
              <div className="w-8 h-8 rounded-full bg-[#EEF5F2] flex items-center justify-center shrink-0">
                {loadingProvider ? (
                  <Loader2 className="w-4 h-4 text-[#206E55] animate-spin" />
                ) : (
                  <Building2 className="w-4 h-4 text-[#206E55]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#1A1E1C] leading-tight">Add provider</p>
                <p className="text-[11px] text-[#6B7370] leading-tight mt-0.5">Connect a hospital or lab</p>
              </div>
            </button>
          )}
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close add menu' : 'Open add menu'}
        className="inline-flex items-center gap-2 h-12 pl-4 pr-5 rounded-full bg-[#206E55] text-white text-[14px] font-semibold shadow-lg shadow-[#206E55]/30 hover:bg-[#1a5a46] transition-transform hover:scale-105"
      >
        <Plus className={`h-5 w-5 transition-transform ${open ? 'rotate-45' : ''}`} />
        Add
      </button>
    </div>
  );
}
