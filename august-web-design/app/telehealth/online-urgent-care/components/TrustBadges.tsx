import { ShieldCheckIcon, MapPinIcon, StethoscopeIcon, LockIcon } from "@phosphor-icons/react/ssr";

export default function TrustBadges() {
  return (
      <section aria-label="Trust and safety" data-nav-dark style={{ background: 'var(--brand-primary)', paddingBlock: 'clamp(80px,12vw,120px)' }}>
        <div className="wrap">
          <div className="badges-row" data-stagger>
            <span className="trust-badge"><ShieldCheckIcon className="ph" aria-hidden /> HIPAA-compliant</span>
            <span className="trust-badge"><MapPinIcon className="ph" aria-hidden /> Available in 50 states + DC</span>
            <span className="trust-badge"><StethoscopeIcon className="ph" aria-hidden /> US-licensed clinicians</span>
            <span className="trust-badge"><LockIcon className="ph" aria-hidden /> Secure &amp; private</span>
          </div>
        </div>
      </section>
  );
}
