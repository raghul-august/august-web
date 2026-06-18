import { CheckIcon } from "@phosphor-icons/react/ssr";

import { CONSULT_PRICE_LABEL } from "@/lib/config";

export default function Pricing() {
  return (
      <section id="pricing" className="sec-white">
        <div className="wrap">
          <div className="sec-head center" data-anim="fade-up">
            <p className="eyebrow">Pricing</p>
            <h2>Transparent pricing, <span>no surprises</span></h2>
            <p>Reviewing your symptoms with August is always free. You only pay if you choose to see a doctor.</p>
          </div>

          <div className="pricing-grid" data-stagger>
            <div className="pricing-tier">
              <p className="pricing-tier-label">Free</p>
              <p className="pricing-tier-desc">Perfect for checking symptoms and getting health guidance.</p>
              <div className="pricing-tier-price"><span className="price-val">$0</span></div>
              <a href="/chat?anon_telehealth=true" className="pricing-cta">Start for free</a>
              <ul className="price-list">
                <li><CheckIcon className="ph" aria-hidden />AI-powered symptom assessment</li>
                <li><CheckIcon className="ph" aria-hidden />Personalized health guidance</li>
                <li><CheckIcon className="ph" aria-hidden />Available 24/7, no account needed</li>
                <li><CheckIcon className="ph" aria-hidden />No ads, no data selling</li>
              </ul>
            </div>
            <div className="pricing-tier featured">
              <p className="pricing-tier-label">Doctor Visit</p>
              <p className="pricing-tier-desc">See a licensed doctor when August thinks you need one.</p>
              <div className="pricing-tier-price"><span className="price-val">{CONSULT_PRICE_LABEL}</span> <span>/ visit</span></div>
              <a href="/chat?anon_telehealth=true" className="pricing-cta">Get started</a>
              <ul className="price-list">
                <li><CheckIcon className="ph" aria-hidden />24/7 visits with licensed doctors</li>
                <li><CheckIcon className="ph" aria-hidden />Prescriptions sent to your pharmacy when appropriate</li>
                <li><CheckIcon className="ph" aria-hidden />A clear, written care plan you can keep</li>
                <li><CheckIcon className="ph" aria-hidden />No membership, no subscription, no hidden fees</li>
              </ul>
            </div>
          </div>
          <p className="price-disclaimer">
            A visit doesn't guarantee a prescription. Whether medication is right for you is always the clinician's professional judgment. Controlled substances can't be prescribed through a virtual visit.
          </p>
        </div>
      </section>
  );
}
