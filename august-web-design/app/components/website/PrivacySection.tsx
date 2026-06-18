import Image from "next/image";
import { TrackedCTA } from "./TrackedCTA";
import { StoreButtons } from "./StoreButtons";

export function PrivacySection({ initialCountry }: { initialCountry?: string | null }) {
  return (
    <section className="py-12 sm:py-20 px-4">
      <div className="max-w-[1100px] mx-auto">
        <div className="bg-[#003e45] rounded-2xl sm:rounded-[32px] p-6 sm:p-8 lg:py-[88px] lg:px-[72px] flex flex-col lg:flex-row items-start gap-6 sm:gap-10 overflow-hidden relative min-h-[300px] sm:min-h-[400px] border border-[#1111114d]">
          {/* Decorative green circles with blur */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] rounded-full bg-[#00ec92] opacity-20 pointer-events-none z-[1]" style={{ aspectRatio: "1.42", filter: "blur(66px)", mixBlendMode: "lighten" }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] rounded-full bg-[#00ec92] opacity-20 pointer-events-none z-[1]" style={{ aspectRatio: "1.42", filter: "blur(82px)" }} />

          {/* Grid overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] pointer-events-none z-[1]" style={{ aspectRatio: "2.5" }}>
            <Image
              src="/website-images/privacy-grid-overlay.png"
              alt=""
              width={2000}
              height={800}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Left Content - Shield + Heading */}
          <div className="flex-1 z-10">
            <ShieldIcon />
            <h2 className="text-2xl sm:text-4xl lg:text-[60px] font-semibold leading-[1.2] tracking-[-1.2px] text-white mt-4">
              Your Privacy is
              <br />
              <br className="hidden lg:flex" />
              Our Priority
            </h2>
          </div>

          {/* Right Content - Badges + Description */}
          <div className="flex-1 z-10">
            <div className="flex items-center gap-4 sm:gap-8 mb-6 lg:justify-end">
              <Image
                src="/website-images/hipaa-badge.png"
                alt="HIPAA"
                width={1024}
                height={1536}
                className="h-16 w-auto object-contain drop-shadow-[0_2.3px_1px_rgba(0,0,0,0.08)]"
              />
              <Image
                src="/website-images/gdpr-badge.png"
                alt="GDPR"
                width={268}
                height={256}
                className="h-16 w-auto object-contain drop-shadow-[0_2.3px_1px_rgba(0,0,0,0.08)]"
              />
            </div>
            <p className="text-base sm:text-lg text-white font-medium leading-relaxed lg:text-right">
              August AI never requires personally identifiable information to
              assist you. Your health data remains secure, protected by
              industry-leading encryption, and fully aligned with HIPAA and GDPR
              standards.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center mt-8 gap-3">
          <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 500, lineHeight: '150%', color: '#1D1D1D' }}>Ask questions privately</p>
          <TrackedCTA
            href="https://www.meetaugust.ai/join/wa?message=Hello%20August&utm=page_cta"
            button_name="privacy"
            button_copy="Talk To August Now"
            initialCountry={initialCountry}
          >
            Talk To August Now
          </TrackedCTA>
          {/* <StoreButtons 
            googlePlayLink="https://join.meetaugust.ai/?c=privacy_policy_hero"
            appStoreLink="https://join.meetaugust.ai/?c=privacy_policy_hero_ios"
            className="flex flex-wrap justify-center gap-4 mt-4"
          /> */}
        </div>
      </div>
    </section>
  );
}

function ShieldIcon() {
  return (
    <div className="w-[54px] h-[54px] lg:w-16 lg:h-16">
      <svg width="50" height="57" viewBox="-1 -1 50 57" fill="none">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M21.3994 1.07611C23.0847 0.496765 24.9153 0.496766 26.6006 1.07611L42.6006 6.57611C45.8311 7.68656 48 10.7257 48 14.1416V26.7682C48 34.2529 44.9362 39.6468 40.5 43.8467C36.3069 47.8164 30.8138 50.7785 25.685 53.5441L25.2661 53.77C24.4759 54.1963 23.5241 54.1963 22.7339 53.77L22.315 53.5441C17.1862 50.7785 11.6932 47.8165 7.5 43.8467C3.06375 39.6468 0 34.2529 0 26.7682V14.1416C0 10.7257 2.16895 7.68656 5.39936 6.57611L21.3994 1.07611ZM24 16.3343C20.3181 16.3343 17.3333 19.3191 17.3333 23.001C17.3333 25.7347 18.9788 28.0842 21.3333 29.1129V35.001C21.3333 36.4737 22.5272 37.6676 24 37.6676C25.4728 37.6676 26.6667 36.4737 26.6667 35.001V29.1129C29.0212 28.0842 30.6667 25.7347 30.6667 23.001C30.6667 19.3191 27.6819 16.3343 24 16.3343Z"
          fill="white"
        />
      </svg>
    </div>
  );
}
