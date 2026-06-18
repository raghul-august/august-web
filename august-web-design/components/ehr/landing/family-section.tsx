import { Heart, Pill, Activity } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type FamilyCard = {
  initials: string;
  name: string;
  relation: string;
  color: string;
  /** A single representative line of activity, kept short. Illustrative only. */
  highlight: { icon: LucideIcon; label: string };
};

const CARDS: FamilyCard[] = [
  {
    initials: 'YO',
    name: 'You',
    relation: 'Self',
    color: '#206E55',
    highlight: { icon: Activity, label: 'Vitamin D back in range' },
  },
  {
    initials: 'MO',
    name: 'Mom',
    relation: 'Mother',
    color: '#C44D6A',
    highlight: { icon: Pill, label: 'Atorvastatin refill in 8 days' },
  },
  {
    initials: 'DA',
    name: 'Dad',
    relation: 'Father',
    color: '#3B74C4',
    highlight: { icon: Heart, label: 'BP trending down over 6 months' },
  },
];

export function FamilySection() {
  return (
    <section className="py-16 lg:py-24 border-t border-[#ECEEED]">
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-center">
        {/* Left — copy */}
        <div>
          <p className="text-[11px] font-semibold text-[#6B7370] uppercase tracking-[0.18em]">
            02 · Your whole household
          </p>
          <h2 className="mt-4 text-[32px] sm:text-[40px] leading-tight tracking-[-0.02em] font-semibold text-[#1A1E1C]">
            Care for everyone you love, in one place.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-[#4a5250] max-w-[28rem]">
            Add a parent, a partner, a kid. Each person gets their own private record, and a
            picker at the top to switch in a click.
          </p>
        </div>

        {/* Right — three stacked person cards. Slight rotation/offset so
            it reads as a deck rather than three identical cards in a row. */}
        <div className="relative h-[280px] lg:h-[320px]">
          {CARDS.map((card, i) => {
            const Icon = card.highlight.icon;
            const offsetY = i * 24;
            const offsetX = i * 18;
            const rotate = (i - 1) * 1.5;
            return (
              <div
                key={card.name}
                className="absolute left-0 right-0 rounded-2xl border border-[#E4E8E6] bg-white p-5 shadow-sm transition-transform"
                style={{
                  top: `${offsetY}px`,
                  marginLeft: `${offsetX}px`,
                  marginRight: `${(CARDS.length - 1 - i) * 18}px`,
                  transform: `rotate(${rotate}deg)`,
                  zIndex: i + 1,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: card.color }}
                    >
                      <span className="text-[12px] font-semibold text-white">{card.initials}</span>
                    </span>
                    <div>
                      <p className="text-[14px] font-semibold text-[#1A1E1C] leading-tight">
                        {card.name}
                      </p>
                      <p className="text-[11px] text-[#8A9290]">{card.relation}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[#F8FAF9] border border-[#ECEEED] px-3 py-2">
                  <Icon className="h-3.5 w-3.5 text-[#206E55] shrink-0" />
                  <span className="text-[12px] text-[#1A1E1C] truncate">{card.highlight.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
