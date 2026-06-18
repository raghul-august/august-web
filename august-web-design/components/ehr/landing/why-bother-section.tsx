type Tile = {
  num: string;
  title: string;
  body: string;
};

const TILES: Tile[] = [
  {
    num: '01',
    title: 'Stop retelling your story.',
    body: 'Every new doctor already knows your meds, allergies, and history. Once is enough.',
  },
  {
    num: '02',
    title: 'Catch trends before they become problems.',
    body: 'August watches the lines move so you see drift in labs or vitals long before the next visit.',
  },
  {
    num: '03',
    title: 'Care for your family from one place.',
    body: 'Parents, partners, kids. Each gets their own private record, and you hold the keys.',
  },
  {
    num: '04',
    title: 'Yours. Always.',
    body: 'Export everything, anytime. We never sell data, and you can delete it with one click.',
  },
];

/**
 * "Why bother" manifesto — editorial layout that intentionally breaks
 * from the sans-serif body type by setting headlines in a serif so the
 * section reads like the opening spread of a magazine: claim on the
 * left, supporting tiles on the right.
 */
export function WhyBotherSection() {
  return (
    <section className="py-16 lg:py-24 border-t border-[#ECEEED]">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Left — eyebrow + serif headline + subhead */}
        <div>
          <p className="inline-flex items-center gap-3 text-[11px] font-semibold text-[#206E55] uppercase tracking-[0.18em]">
            <span className="inline-block w-6 h-px bg-[#206E55]" />
            Why bother
          </p>
          <h2 className="mt-6 font-serif text-[36px] sm:text-[44px] lg:text-[52px] leading-[1.05] tracking-[-0.01em] text-[#1A1E1C]">
            The picture you&rsquo;ve never had, for everyone you love.
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-[#4a5250] max-w-md">
            Your medical story lives across dozens of systems that don&rsquo;t talk.
            August is the one place it adds up.
          </p>
        </div>

        {/* Right — 2x2 grid with thin inner + outer hairlines */}
        <div className="grid grid-cols-2 border-t border-b border-[#ECEEED]">
          {TILES.map((tile, i) => {
            const isLeftCol = i % 2 === 0;
            const isTopRow = i < 2;
            return (
              <div
                key={tile.num}
                className={`p-6 lg:p-8 ${isLeftCol ? 'border-r border-[#ECEEED]' : ''} ${isTopRow ? 'border-b border-[#ECEEED]' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-[11px] text-[#8A9290] tabular-nums tracking-wider mt-1.5 shrink-0">
                    {tile.num}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-serif text-[20px] lg:text-[22px] font-medium leading-snug text-[#1A1E1C]">
                      {tile.title}
                    </h3>
                    <p className="mt-3 text-[14px] leading-relaxed text-[#4a5250]">
                      {tile.body}
                    </p>
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
