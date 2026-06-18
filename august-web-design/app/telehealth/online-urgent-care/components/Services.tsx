import { CaretRightIcon, FirstAidIcon, HandHeartIcon, BowlFoodIcon, CalculatorIcon, BooksIcon } from "@phosphor-icons/react/ssr";

export default function Services() {
  return (
      <section id="services" className="sec-white">
        <div className="wrap">
          <div className="sec-head center" data-anim="fade-up">
            <p className="eyebrow">Do more with August</p>
            <h2>Beyond Virtual Urgent Care</h2>
            <p>Explore more of the ways August can support your health, all in the same warm, plain-spoken place.</p>
          </div>
          <div className="related-grid" data-stagger>
            <a href="/chat?anon_telehealth=true" className="related-card">
              <span className="rc-icon tag-brand"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path></svg></span>
              <h3>24/7 AI Health Companion</h3>
              <p>Ask anything, anytime. August helps you make sense of your health in plain words.</p>
              <span className="rc-more">Learn more <CaretRightIcon className="ph" aria-hidden /></span>
            </a>
            <a href="/ehr" className="related-card">
              <span className="rc-icon tag-blue"><FirstAidIcon className="ph" aria-hidden /></span>
              <h3>Health Records Analysis</h3>
              <p>Share lab reports and records, and get clear, gentle explanations of what they mean.</p>
              <span className="rc-more">Learn more <CaretRightIcon className="ph" aria-hidden /></span>
            </a>
            <a href="/tool" className="related-card">
              <span className="rc-icon tag-blue"><CalculatorIcon className="ph" aria-hidden /></span>
              <h3>Calculators &amp; Tools</h3>
              <p>Quick health calculators and tools to help you understand the numbers that matter.</p>
              <span className="rc-more">Learn more <CaretRightIcon className="ph" aria-hidden /></span>
            </a>
            <a href="/en/library" className="related-card">
              <span className="rc-icon tag-brand"><BooksIcon className="ph" aria-hidden /></span>
              <h3>Health Library</h3>
              <p>Plain-language answers and gentle guidance for common health questions.</p>
              <span className="rc-more">Learn more <CaretRightIcon className="ph" aria-hidden /></span>
            </a>
            <div className="related-card is-soon">
              <span className="rc-icon tag-plum"><HandHeartIcon className="ph" aria-hidden /></span>
              <h3>Virtual Primary Care <span className="rc-soon">coming soon</span></h3>
              <p>Ongoing, personalized care for the everyday and the long-term alike.</p>
            </div>
            <div className="related-card is-soon">
              <span className="rc-icon tag-tan"><BowlFoodIcon className="ph" aria-hidden /></span>
              <h3>Meal Tracking <span className="rc-soon">coming soon</span></h3>
              <p>Log meals by chat and build healthier habits with simple, judgment-free guidance.</p>
            </div>
            
          </div>
        </div>
      </section>
  );
}
