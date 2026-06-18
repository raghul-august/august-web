import { HeartIcon, LockIcon } from "@phosphor-icons/react/ssr";

import { CONSULT_PRICE_LABEL } from "@/lib/config";

export default function WhyAugust() {
  return (
      <section className="tri-band-sec" aria-label="Why August">
        <div className="wrap">
          <div className="tri-band" data-anim="fade-up" data-nav-dark>
            <div className="tri-band-head">
              <h2>Virtual Urgent Care by <span style={{ color: 'rgba(255,255,255,.7)' }}>August</span></h2>
              <p>An urgent care service built around your needs. Personalized, private, and judgement-free.</p>
            </div>
            <div className="tri-grid" data-stagger>
              <div className="tri-item">
                <div className="tri-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path></svg></div>
                <h3>24/7, day and night</h3>
                <p>August is just one click away. When you need an Rx or just have a question.</p>
              </div>
              <div className="tri-item">
                <div className="tri-icon"><HeartIcon className="ph" aria-hidden /></div>
                <h3>Patient-first Care</h3>
                <p>Unlimited free symptom reviews. Flat {CONSULT_PRICE_LABEL} doctor visits. Full year of free care follow-ups. </p>
              </div>
              <div className="tri-item">
                <div className="tri-icon"><LockIcon className="ph" aria-hidden /></div>
                <h3>Safe &amp; Private</h3>
                <p>Your health data is never sold, and it's protected with HIPAA-grade security.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}
