import { Sparkles } from 'lucide-react';

type Nudge = {
  category: 'asking' | 'doing' | 'watching';
  label: string;
  body: React.ReactNode;
};

const NUDGES: Nudge[] = [
  {
    category: 'asking',
    label: 'Worth asking',
    body: (
      <>
        Ask Dr Patel about your borderline <em className="not-italic underline decoration-[#206E55]/40 decoration-2 underline-offset-2">LDL</em> at your May visit — August will pre-fill the question list.
      </>
    ),
  },
  {
    category: 'doing',
    label: 'Keep doing',
    body: (
      <>
        Vitamin D is back in range after six months of consistent <em className="not-italic underline decoration-[#206E55]/40 decoration-2 underline-offset-2">1,000 IU</em>. Stay with it through winter.
      </>
    ),
  },
  {
    category: 'watching',
    label: 'Worth watching',
    body: (
      <>
        Sleep averaged <em className="not-italic underline decoration-[#206E55]/40 decoration-2 underline-offset-2">5.8 hours</em> last week — about an hour below your norm. August will flag it again if it persists.
      </>
    ),
  },
];

const CATEGORY_STYLES: Record<Nudge['category'], { bg: string; text: string; dot: string }> = {
  asking: { bg: 'bg-[#FFF6E5]', text: 'text-[#B8791A]', dot: 'bg-[#B8791A]' },
  doing: { bg: 'bg-[#EAFAF2]', text: 'text-[#206E55]', dot: 'bg-[#206E55]' },
  watching: { bg: 'bg-[#EEF4FF]', text: 'text-[#3B74C4]', dot: 'bg-[#3B74C4]' },
};

export function InsightsSection() {
  return (
    <section className="py-16 lg:py-24 border-t border-[#ECEEED]">
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-center">
        {/* Left — copy */}
        <div>
          <p className="text-[11px] font-semibold text-[#6B7370] uppercase tracking-[0.18em]">
            03 — Insights that move
          </p>
          <h2 className="mt-4 text-[32px] sm:text-[40px] leading-tight tracking-[-0.02em] font-semibold text-[#1A1E1C]">
            Numbers become <span className="italic font-medium text-[#206E55]">next steps.</span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-[#4a5250] max-w-[28rem]">
            Each lab, each med, each visit comes with a few lines from August: what&rsquo;s
            worth asking, what&rsquo;s working, and what&rsquo;s worth watching. Small,
            specific nudges that compound over time.
          </p>
        </div>

        {/* Right — three stacked nudges. Each labelled by the kind of
            action it suggests so the page reads as "August doesn't just
            describe; it nudges you toward a next step." */}
        <div className="space-y-3">
          {NUDGES.map((n, i) => {
            const c = CATEGORY_STYLES[n.category];
            return (
              <div
                key={i}
                className="rounded-2xl border border-[#E4E8E6] bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="h-[14px] w-[14px] text-[#206E55] shrink-0 mt-[3px]" />
                  <div className="min-w-0 flex-1">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] mb-1.5 ${c.bg} ${c.text}`}
                    >
                      <span className={`w-1 h-1 rounded-full ${c.dot}`} />
                      {n.label}
                    </span>
                    <p className="text-[13.5px] leading-[1.55] text-[#1A1E1C]">{n.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
