import Image from "next/image";
import { TrackedCTA } from "./TrackedCTA";

const cards = [
  { src: "/website-images/how-card-8.png", w: 668, h: 220, top: "calc(26.875% - 43.5px)", left: "calc(22.822% - 160px)",  width: 320, height: 87,  side: "left" },
  { src: "/website-images/how-card-2.png", w: 668, h: 254, top: "calc(39.625% - 52px)",   left: "calc(21.2121% - 160px)", width: 320, height: 104, side: "left" },
  { src: "/website-images/how-card-1.png", w: 668, h: 254, top: "calc(50.25% - 52px)",    left: "calc(17.5189% - 160px)", width: 320, height: 104, side: "left" },
  { src: "/website-images/how-card-3.png", w: 668, h: 254, top: "calc(61% - 52px)",       left: "calc(20.7386% - 160px)", width: 320, height: 104, side: "left" },
  { src: "/website-images/how-card-7.png", w: 668, h: 278, top: "calc(25.375% - 43.5px)", left: "calc(75.7576% - 160px)", width: 320, height: 87,  side: "right" },
  { src: "/website-images/how-card-5.png", w: 668, h: 246, top: "calc(38.125% - 52px)",   left: "calc(81.25% - 160px)",   width: 320, height: 104, side: "right" },
  { src: "/website-images/how-card-4.png", w: 668, h: 254, top: "calc(50.25% - 52px)",    left: "calc(84.8485% - 160px)", width: 320, height: 104, side: "right" },
  { src: "/website-images/how-card-6.png", w: 548, h: 526, top: "calc(70.125% - 120px)",  left: "calc(78.4091% - 130px)", width: 260, height: 240, side: "right" },
];

const dropShadow = "drop-shadow(0 27px 4px rgba(173,173,173,0)) drop-shadow(0 17px 3px rgba(173,173,173,0.01)) drop-shadow(0 10px 3px rgba(173,173,173,0.05)) drop-shadow(0 4px 2px rgba(173,173,173,0.09)) drop-shadow(0 1px 1px rgba(173,173,173,0.1))";

export function HowItWorks({ initialCountry }: { initialCountry?: string | null }) {
  return (
    <section className="py-12 sm:py-20 px-4">
      <div className="max-w-[1100px] mx-auto" style={{ maskImage: "linear-gradient(black 85%, transparent 100%)", WebkitMaskImage: "linear-gradient(black 85%, transparent 100%)" }}>
        <div className="text-center mb-4 sm:mb-16">
          <p className="text-base sm:text-xl font-semibold text-primary-400 mb-4">How it works</p>
          <h2 className="text-[28px] sm:text-4xl font-semibold leading-[1.2] tracking-[-0.96px] text-dark mb-4">Talk to August instantly</h2>
          <p className="text-base text-[#595959] font-medium max-w-[636px] mx-auto">Gain access to expert healthcare at your fingertips, at no cost.</p>
        </div>
        <div className="relative w-full h-[420px] sm:h-[600px] lg:h-[800px]" style={{ maskImage: "linear-gradient(black 90%, transparent 100%)", WebkitMaskImage: "linear-gradient(black 90%, transparent 100%)" }}>
          <div className="absolute z-[1] w-[82%] sm:w-[62%] left-[54%] sm:left-[62%] top-[50%] sm:top-[51%]" style={{ maxHeight: "100%", aspectRatio: "0.835", transform: "translate(-50%, -50%)" }}>
            <Image src="/website-images/how-it-works-hand.png" alt="August AI chat interface" width={1384} height={1660} className="w-full h-full object-contain" loading="lazy" sizes="(max-width: 640px) 82vw, (max-width: 1024px) 62vw, 620px" />
          </div>
          {cards.map((card) => (
            <div key={card.src} className="absolute hidden lg:block" style={{ top: card.top, left: card.left, width: card.width, height: card.height, filter: dropShadow }}>
              <Image src={card.src} alt="" width={card.w} height={card.h} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 mt-4 sm:mt-10">
        <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 500, lineHeight: '150%', color: '#1D1D1D' }}>No waiting lines, get instant help</p>
        <TrackedCTA 
          href="https://www.meetaugust.ai/join/wa?message=Hello%20August&utm=page_cta" 
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-base px-6 py-3 rounded-5xl transition-colors font-[family-name:var(--font-geist)]" 
          button_name="how_it_works" 
          button_copy="Talk To August Now"
          initialCountry={initialCountry}
        >
          Talk To August Now
        </TrackedCTA>
      </div>
    </section>
  );
}
