const EVERYDAY_CHIPS = [
  "UTI", "Acne", "Cold Sores", "Pinkeye", "Rosacea", "Migraine", "Sinusitis",
  "Swimmer's Ear", "Dental Infection", "Yeast Infection", "Bacterial Vaginosis",
  "Genital Herpes", "STI Prevention", "Chlamydia", "Tick Bite", "Shingles",
  "Athlete's Foot", "Tinea Versicolor", "Asthma Refill", "Strep Throat",
  "Gout Flare", "Back / Neck Strain",
];

export default function Safety() {
  return (
      <section id="safety" className="sec-white">
        <div className="wrap">
          <div className="sec-head center" data-anim="fade-up">
            <p className="eyebrow">Knowing when</p>
            <h2>Is online urgent care <span>right for me</span></h2>
            <p>Virtual urgent care is wonderful for everyday needs, and we&apos;ll always be honest when something belongs in an ER.</p>
          </div>

          <div className="use-yes" data-anim="fade-up">
            <h3>Yes, its great for everyday urgent care needs</h3>
            <p>If it&apos;s bothering you today but isn&apos;t an emergency, start here.</p>
            <div className="use-chips">
              {EVERYDAY_CHIPS.map((chip) => (
                <span className="use-chip" key={chip}>{chip}</span>
              ))}
            </div>
          </div>

          <div className="use-no" data-anim="fade-up">
            <h3>Not for emergencies</h3>
            <p>For chest pain, trouble breathing, severe bleeding, signs of a stroke, sudden confusion, or thoughts of harming yourself, call <a href="tel:911">911</a> or go to your nearest emergency room.</p>
          </div>
        </div>
      </section>
  );
}
