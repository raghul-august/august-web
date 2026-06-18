import { MapPinIcon } from "@phosphor-icons/react/ssr";

import { CONSULT_PRICE_LABEL } from "@/lib/config";

export default function HowItWorks() {
  return (
      <section id="how" className="sec-white">
        <div className="wrap">
          <div className="sec-head center" data-anim="fade-up">
            <p className="eyebrow">How it works</p>
            <h2>Urgent Care Made Easy</h2>
            <p>No phone trees, no waiting rooms. Start a conversation and we'll guide you the rest of the way.</p>
          </div>

          <div className="steps-grid" data-stagger>

            <div className="step">
              <div className="step-num">1</div>
              <h3>Chat with August about your symptoms</h3>
              <p>Tell August how you're feeling in plain words. It listens, asks a few gentle questions, and helps make sense of your symptoms. Free, anytime.</p>
            </div>


            <div className="step">
              <div className="step-num">2</div>
              <h3>Start a virtual visit with a licensed doctor, if eligible</h3>
              <p>If a doctor would help, we match you with a clinician licensed in your state. flat {CONSULT_PRICE_LABEL}, no membership, no surprise bills.</p>
            </div>


            <div className="step">
              <div className="step-num">3</div>
              <h3>Get your prescription sent to nearest pharmacy</h3>
              <p>When appropriate, your prescription goes straight to your pharmacy, along with a clear care plan you can keep and revisit.</p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 'clamp(36px,5vw,52px)' }}>
            <a href="/chat?anon_telehealth=true" className="btn btn-primary how-cta">Get started</a>
            <p className="trust-line" style={{ justifyContent: 'center', marginTop: '18px' }}><MapPinIcon className="ph" aria-hidden /> Available in 50 states + DC</p>
          </div>
        </div>
      </section>
  );
}
