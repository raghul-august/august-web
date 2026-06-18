import { Sparkles } from 'lucide-react';

export function PlainEnglishSection() {
  return (
    <section className="py-16 lg:py-24 border-t border-[#ECEEED]">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Left — copy */}
        <div>
          <p className="text-[11px] font-semibold text-[#6B7370] uppercase tracking-[0.18em]">
            01 · In plain English
          </p>
          <h2 className="mt-4 text-[32px] sm:text-[40px] leading-tight tracking-[-0.02em] font-semibold text-[#1A1E1C]">
            Know what every result actually means.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-[#4a5250] max-w-[28rem]">
            August explains each marker in plain language and shows exactly where you fall against
            the reference range. No medical degree required.
          </p>
        </div>

        {/* Right — illustrative biomarker explained card */}
        <div className="rounded-2xl border border-[#E4E8E6] bg-white p-5 shadow-sm">
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <h3 className="text-[15px] font-semibold text-[#1A1E1C]">MCH</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-[22px] font-semibold text-[#1A1E1C] tabular-nums">26.8</span>
              <span className="text-[11px] text-[#6B7370]">pg</span>
              <span className="ml-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#EEF4FF] text-[#3B74C4]">
                LOW
              </span>
            </div>
          </div>
          <p className="text-[11px] text-[#8A9290] mb-3">Mean corpuscular hemoglobin</p>
          <div className="relative h-1.5 w-full rounded-full bg-[#E4E8E6] overflow-hidden mb-1">
            <div className="absolute inset-y-0 left-[20%] right-[20%] bg-[#CFE4D9]" />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-white bg-[#3B74C4]"
              style={{ left: 'calc(12% - 4px)' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#8A9290] mb-4 font-mono tabular-nums">
            <span>27 pg</span>
            <span>32 pg</span>
          </div>

          <div className="rounded-xl bg-[#F0F7F4] border border-[#D6E5DD] p-4">
            <div className="flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-[#206E55] mt-0.5 shrink-0" />
              <p className="text-[13px] leading-relaxed text-[#1A1E1C]">
                A low MCH means each red blood cell carries a little less hemoglobin than
                expected, often linked to{' '}
                <span className="underline decoration-[#206E55]/40 decoration-2 underline-offset-2">
                  iron-deficiency anemia
                </span>
                . August flags it and suggests what to ask your doctor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
