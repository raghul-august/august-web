import Image from "next/image";

import { CaretDownIcon } from "@phosphor-icons/react/ssr";

import { CONSULT_PRICE_LABEL } from "@/lib/config";

export default function Faq() {
  return (
      <section id="faq" className="sec-warm">
        <div className="wrap">
          <div className="faq-layout">
          <div className="faq-left">
          <div className="sec-head" data-anim="fade-up">
            <p className="eyebrow">Good to know</p>
            <h2>Good things to know</h2>
            <p>Virtual urgent care is for the things that come up suddenly but aren't emergencies: a UTI, pinkeye, a rash, a sinus infection. It's the same kind of help you'd get at an urgent care clinic, only you skip the drive and the waiting room and start from wherever you are.</p>
            <p style={{ marginTop: '16px' }}>With August, you begin by simply telling us how you're feeling in plain words. We ask a few gentle questions, help make sense of your symptoms, and, if a doctor would help, connect you with a clinician licensed in your state. When it's appropriate, they can send a prescription to your pharmacy and give you a clear care plan to keep.</p>
          </div>

          <div className="faq-wrap" data-anim="fade-up">
            <details className="faq">
              <summary><span className="faq-q">What is virtual urgent care?</span><span className="chev" aria-hidden="true"><CaretDownIcon className="ph" /></span></summary>
              <div className="faq-a">It's care for the things that come up suddenly but aren't emergencies: a UTI, pinkeye, a rash, a sinus infection. Instead of driving to a clinic and waiting, you start a conversation with August from your phone, and connect with a licensed doctor if you need one.</div>
            </details>
            <details className="faq">
              <summary><span className="faq-q">How does August work?</span><span className="chev" aria-hidden="true"><CaretDownIcon className="ph" /></span></summary>
              <div className="faq-a">You tell August how you're feeling in plain words. August asks a few gentle follow-up questions to understand your symptoms, then helps you decide what to do next. If a doctor would help, we match you with one licensed in your state. August is your companion through it, not a replacement for the doctor.</div>
            </details>
            <details className="faq">
              <summary><span className="faq-q">How much does it cost?</span><span className="chev" aria-hidden="true"><CaretDownIcon className="ph" /></span></summary>
              <div className="faq-a">Reviewing your symptoms with August is always free. If you choose to see a doctor, it's a flat {CONSULT_PRICE_LABEL} per visit. No membership, no subscription, and no surprise bills.</div>
            </details>
            <details className="faq">
              <summary><span className="faq-q">Can August's doctors prescribe medication?</span><span className="chev" aria-hidden="true"><CaretDownIcon className="ph" /></span></summary>
              <div className="faq-a">Yes, when it's appropriate. A visit doesn't guarantee a prescription. Whether medication is right for you is always the clinician's professional judgment. For safety, controlled substances can't be prescribed through a virtual visit.</div>
            </details>
            <details className="faq">
              <summary><span className="faq-q">Is my data private and HIPAA-compliant?</span><span className="chev" aria-hidden="true"><CaretDownIcon className="ph" /></span></summary>
              <div className="faq-a">Your health information is protected with HIPAA-grade security, and we never sell your data. Your conversations with August stay yours.</div>
            </details>
            <details className="faq">
              <summary><span className="faq-q">What states are you available in?</span><span className="chev" aria-hidden="true"><CaretDownIcon className="ph" /></span></summary>
              <div className="faq-a">August's virtual urgent care is available in all 50 states and Washington, D.C. We'll always match you with a clinician licensed where you are.</div>
            </details>
            <details className="faq">
              <summary><span className="faq-q">When should I NOT use this?</span><span className="chev" aria-hidden="true"><CaretDownIcon className="ph" /></span></summary>
              <div className="faq-a">Virtual urgent care isn't for emergencies. If you're experiencing chest pain, trouble breathing, severe bleeding, signs of a stroke, sudden confusion, or thoughts of harming yourself, call 911 or go to your nearest emergency room right away.</div>
            </details>
            <details className="faq">
              <summary><span className="faq-q">Do I need insurance to use August?</span><span className="chev" aria-hidden="true"><CaretDownIcon className="ph" /></span></summary>
              <div className="faq-a">No. The flat {CONSULT_PRICE_LABEL} visit is the same with or without insurance, so there's nothing to verify and no claims to chase.</div>
            </details>
          </div>
          </div>
          <div className="faq-right" data-anim="fade-up">
            <Image src="https://assets.getbeyondhealth.com/telehealth/faq-support.webp" alt="Doctor reviewing patient information" fill sizes="320px" />
          </div>
          </div>
        </div>
      </section>
  );
}
