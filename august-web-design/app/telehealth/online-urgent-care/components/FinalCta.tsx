import Image from "next/image";
import { CaretRightIcon, MapPinIcon } from "@phosphor-icons/react/ssr";

export default function FinalCta() {
  return (
      <section className="cta-band-sec" aria-label="Get started">
        <div className="wrap">
          <div className="cta-band" data-nav-dark>
            <Image className="cta-bg" src="https://assets.getbeyondhealth.com/telehealth/cta-bg.webp" alt="" fill sizes="(min-width: 1200px) 1120px, 100vw" aria-hidden />
            <div className="cta-content">
              <h2>Healthcare on your schedule</h2>
              <p>Feeling off? Start a conversation with August now. It's free to begin, and care is always just a few messages away.</p>
              <a href="/chat?anon_telehealth=true" className="btn btn-primary">Get started <CaretRightIcon className="ph" aria-hidden /></a>
              <p className="trust-line"><MapPinIcon className="ph" aria-hidden /> Available in 50 states + DC</p>
            </div>
          </div>
        </div>
      </section>
  );
}
