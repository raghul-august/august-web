import { Home, Upload } from 'lucide-react';

/**
 * Focused empty-state for an existing household member who has no
 * FHIR data yet — typically a freshly-added family profile. The user
 * already knows what August does (someone in the household has data),
 * so this view skips the full marketing pitch and gets straight to the
 * two ingest CTAs. Profile-gate isn't run here because name + sex are
 * captured when the person is created.
 */
export function EmptyPersonPrompt({
  personName,
  onConnect,
  onUpload,
  canConnectRecords,
  connecting,
}: {
  personName: string;
  onConnect: () => void;
  onUpload: () => void;
  canConnectRecords: boolean;
  connecting?: boolean;
}) {
  const displayName = personName.trim() || 'this person';
  return (
    <section className="pt-10 pb-6 lg:pt-16 lg:pb-10 max-w-2xl mx-auto text-center">
      <h1 className="text-[32px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] font-semibold text-[#1A1E1C]">
        Let&rsquo;s bring{' '}
        <span className="italic font-medium text-[#206E55]">{displayName}&rsquo;s</span>{' '}
        health into August.
      </h1>
      <p className="mt-5 text-[15px] leading-relaxed text-[#4a5250] max-w-md mx-auto">
        {canConnectRecords
          ? 'Connect their providers or upload a report. August will take it from there.'
          : 'Upload a report. August will take it from there.'}
      </p>

      <div className="mt-7 inline-flex flex-wrap items-center justify-center gap-3">
        {canConnectRecords && (
          <button
            type="button"
            onClick={onConnect}
            disabled={connecting}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#206E55] text-white text-[14px] font-semibold hover:bg-[#1a5a46] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            <Home className="h-4 w-4" />
            Connect their records
          </button>
        )}
        <button
          type="button"
          onClick={onUpload}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#206E55] text-[#206E55] text-[14px] font-semibold hover:bg-[#F0F7F4] transition-colors"
        >
          <Upload className="h-4 w-4" />
          Upload reports
        </button>
      </div>
    </section>
  );
}
