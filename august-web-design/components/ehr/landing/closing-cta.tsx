export function ClosingCta({
  onGetStarted,
  canConnectRecords,
}: {
  onGetStarted: () => void;
  canConnectRecords: boolean;
}) {
  return (
    <section className="py-16 lg:py-24 border-t border-[#ECEEED]">
      <div className="text-center">
        <h2 className="text-[28px] sm:text-[36px] leading-tight tracking-[-0.02em] font-semibold text-[#1A1E1C]">
          Ready when you are.
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[#4a5250] max-w-[34rem] mx-auto">
          {canConnectRecords
            ? 'It takes about a minute to connect a provider or drop in a report. Everything stays private to your household.'
            : 'It takes about a minute to drop in a report. Everything stays private to your household.'}
        </p>
        <div className="mt-7">
          <button
            type="button"
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#206E55] text-white text-[15px] font-semibold hover:bg-[#1a5a46] transition-colors shadow-sm"
          >
            Get started
          </button>
        </div>
      </div>
    </section>
  );
}
