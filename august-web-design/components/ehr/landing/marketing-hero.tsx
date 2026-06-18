import { AnimatedFamilyPreview } from './animated-family-preview';

const COMPLIANCE_BADGES = ['HIPAA', '256-BIT ENCRYPTION', 'SOC 2 TYPE II', '12,000+ PROVIDERS'];

export function MarketingHero({
  onGetStarted,
}: {
  /** Opens the onboarding wizard. The wizard owns Connect / Upload
   *  paths from here on; the hero just funnels to it. */
  onGetStarted: () => void;
}) {
  return (
    <section className="pt-10 pb-6 lg:pt-16 lg:pb-10">
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-start">
        {/* Left column — copy + single CTA */}
        <div>
          <p className="text-[11px] font-semibold text-[#6B7370] uppercase tracking-[0.18em]">
            Your personal health record
          </p>
          <h1 className="mt-4 text-[40px] sm:text-[52px] lg:text-[60px] leading-[1.05] tracking-[-0.02em] font-semibold text-[#1A1E1C]">
            All of your family&rsquo;s health, in{' '}
            <span className="italic font-medium text-[#206E55]">one place.</span>
          </h1>
          <p className="mt-5 text-[15px] sm:text-[16px] leading-relaxed text-[#4a5250] max-w-[34rem]">
            August brings every lab, prescription, visit, and reminder for everyone
            you care for, into one calm, intelligent record.
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

          <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
            {COMPLIANCE_BADGES.map((label, i) => (
              <li key={label} className="flex items-center gap-3 text-[10px] font-semibold text-[#8A9290] uppercase tracking-[0.14em]">
                {i > 0 && <span aria-hidden className="text-[#D6DCD9]">•</span>}
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right column — animated multi-persona preview card */}
        <div className="lg:pt-2">
          <AnimatedFamilyPreview />
        </div>
      </div>
    </section>
  );
}
