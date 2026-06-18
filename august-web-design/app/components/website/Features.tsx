"use client";

import Image from "next/image";
import { type ReactNode } from "react";
import { TrackedCTA } from "./TrackedCTA";
import { track } from "@/app/utils/analytics";

function IconHistory() {
  return (
    <svg width="20" height="18" viewBox="-1 -1 24 20" fill="none" className="shrink-0">
      <path d="M2.60691 1.93115C1.1112 2.19489 0.112489 3.6212 0.376223 5.11691L0.622225 6.51206L8.93337 5.04658C10.4758 3.47491 12.6242 2.49998 15.0003 2.49998C15.0491 2.49998 15.0978 2.50039 15.1464 2.50121C14.8776 1.0116 13.4546 0.0184078 11.9626 0.281496L2.60691 1.93115Z" fill="#04754C"/>
      <path d="M7.60661 6.80366C6.90244 8.04169 6.50025 9.47387 6.50025 11C6.50025 12.552 6.91621 14.0069 7.64273 15.2592L5.03799 15.7185C3.54228 15.9822 2.11597 14.9835 1.85223 13.4878L0.882698 7.98927L7.60661 6.80366Z" fill="#04754C"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M8.00025 11C8.00025 7.134 11.1343 3.99999 15.0003 3.99999C18.8662 3.99999 22.0003 7.134 22.0003 11C22.0003 14.866 18.8662 18 15.0003 18C11.1343 18 8.00025 14.866 8.00025 11ZM15.0003 8C15.4145 8 15.7503 8.33578 15.7503 8.75V10.6893L17.5306 12.4697C17.8235 12.7626 17.8235 13.2374 17.5306 13.5303C17.2377 13.8232 16.7628 13.8232 16.4699 13.5303L14.4699 11.5303C14.3293 11.3897 14.2503 11.1989 14.2503 11V8.75C14.2503 8.33578 14.586 8 15.0003 8Z" fill="#04754C"/>
    </svg>
  );
}

function IconSymptom() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
      <path d="M 0 2.75 C 0 1.231 1.231 0 2.75 0 L 15.25 0 C 16.769 0 18 1.231 18 2.75 L 18 15.25 C 18 16.769 16.769 18 15.25 18 L 2.75 18 C 1.231 18 0 16.769 0 15.25 Z M 8.14 5.202 C 8.388 4.871 8.321 4.401 7.99 4.152 C 7.658 3.904 7.188 3.971 6.94 4.302 L 5.494 6.23 L 4.959 5.874 C 4.614 5.644 4.149 5.737 3.919 6.082 C 3.689 6.426 3.782 6.892 4.127 7.122 L 5.252 7.872 C 5.583 8.093 6.029 8.016 6.268 7.698 Z M 10.808 5.25 C 10.394 5.25 10.058 5.586 10.058 6 C 10.058 6.414 10.394 6.75 10.808 6.75 L 13.308 6.75 C 13.722 6.75 14.058 6.414 14.058 6 C 14.058 5.586 13.722 5.25 13.308 5.25 Z M 8.14 11.203 C 8.388 10.872 8.321 10.402 7.99 10.153 C 7.658 9.905 7.188 9.972 6.94 10.303 L 5.494 12.231 L 4.959 11.875 C 4.614 11.645 4.149 11.738 3.919 12.083 C 3.689 12.428 3.782 12.893 4.127 13.123 L 5.252 13.873 C 5.583 14.094 6.029 14.017 6.268 13.699 Z M 10.75 11.25 C 10.336 11.25 10 11.586 10 12 C 10 12.414 10.336 12.75 10.75 12.75 L 13.25 12.75 C 13.664 12.75 14 12.414 14 12 C 14 11.586 13.664 11.25 13.25 11.25 Z" fill="#FAD82D"/>
    </svg>
  );
}

function IconCareNav() {
  return (
    <svg width="18" height="19" viewBox="-1 -1 20 21" fill="none" className="shrink-0">
      <path fillRule="evenodd" clipRule="evenodd" d="M0 2.75C0 1.23122 1.23122 0 2.75 0H15.25C16.7688 0 18 1.23122 18 2.75V13.25C18 14.7688 16.7688 16 15.25 16H12.3759C12.3177 16 12.2613 16.0203 12.2164 16.0575L10.1181 17.7959C9.46759 18.3348 8.52489 18.3321 7.87747 17.7894L5.81242 16.0584C5.76741 16.0207 5.71055 16 5.65182 16H2.75C1.23122 16 0 14.7688 0 13.25V2.75ZM9 12C9.33333 12 13 10.1406 13 7.625C13 5.875 11.8889 5 10.7778 5C9.66667 5 9 5.65625 9 5.65625C9 5.65625 8.33333 5 7.22222 5C6.11111 5 5 5.875 5 7.625C5 10.1406 8.66667 12 9 12Z" fill="#D4F9FF"/>
    </svg>
  );
}

function IconLab() {
  return (
    <svg width="20" height="22" viewBox="0 0 20 22" fill="none" className="shrink-0">
      <path fillRule="evenodd" clipRule="evenodd" d="M11.72 2.21967C12.0129 1.92678 12.4878 1.92678 12.7807 2.21967L19.7807 9.21967C20.0736 9.51256 20.0736 9.98744 19.7807 10.2803C19.4878 10.5732 19.0129 10.5732 18.72 10.2803L18.2504 9.81066L8.28071 19.7803C6.6071 21.4539 3.89365 21.4539 2.22005 19.7803C0.546441 18.1067 0.546443 15.3933 2.22005 13.7197L12.1897 3.75L11.72 3.28033C11.4272 2.98744 11.4272 2.51256 11.72 2.21967ZM13.2504 4.81066L7.06104 11H14.9397L17.1897 8.75L13.2504 4.81066Z" fill="#00B2FF"/>
      <path d="M20.0039 5C20.0039 5.55228 19.5562 6 19.0039 6C18.4516 6 18.0039 5.55228 18.0039 5C18.0039 4.44772 18.4516 4 19.0039 4C19.5562 4 20.0039 4.44772 20.0039 5Z" fill="#00B2FF"/>
      <path d="M19.0039 1.5C19.0039 2.32843 18.3323 3 17.5039 3C16.6755 3 16.0039 2.32843 16.0039 1.5C16.0039 0.671573 16.6755 0 17.5039 0C18.3323 0 19.0039 0.671573 19.0039 1.5Z" fill="#00B2FF"/>
    </svg>
  );
}

function IconSecondOpinion() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
      <path d="M10.7368 0.609666C10.6694 0.255926 10.3601 0 10 0C9.6399 0 9.33063 0.255926 9.26325 0.609666C8.78441 3.12353 7.83969 5.03715 6.43842 6.43842C5.03715 7.83969 3.12353 8.78441 0.609666 9.26325C0.255926 9.33063 0 9.6399 0 10C0 10.3601 0.255926 10.6694 0.609666 10.7368C3.12353 11.2156 5.03715 12.1603 6.43842 13.5616C7.83969 14.9629 8.78441 16.8765 9.26325 19.3903C9.33063 19.7441 9.6399 20 10 20C10.3601 20 10.6694 19.7441 10.7368 19.3903C11.2156 16.8765 12.1603 14.9629 13.5616 13.5616C14.9629 12.1603 16.8765 11.2156 19.3903 10.7368C19.7441 10.6694 20 10.3601 20 10C20 9.6399 19.7441 9.33063 19.3903 9.26325C16.8765 8.78441 14.9629 7.83969 13.5616 6.43842C12.1603 5.03715 11.2156 3.12353 10.7368 0.609666Z" fill="#FF423E"/>
    </svg>
  );
}

function IconWellness() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
      <path d="M5.75 0C2.57436 0 0 2.57436 0 5.75C0 8.92564 2.57436 11.5 5.75 11.5C8.92564 11.5 11.5 8.92564 11.5 5.75C11.5 2.57436 8.92564 0 5.75 0Z" fill="#FAE77D"/>
      <path d="M12 11.5C9.65279 11.5 7.75 13.4028 7.75 15.75C7.75 18.0972 9.65279 20 12 20C14.3472 20 16.25 18.0972 16.25 15.75C16.25 13.4028 14.3472 11.5 12 11.5Z" fill="#FAE77D"/>
      <path d="M13 7.25C13 5.317 14.567 3.75 16.5 3.75C18.433 3.75 20 5.317 20 7.25C20 9.183 18.433 10.75 16.5 10.75C14.567 10.75 13 9.183 13 7.25Z" fill="#FAE77D"/>
    </svg>
  );
}

const features: {
  number: string;
  icon: ReactNode;
  title: string;
  titleColor: string;
  pillBg?: string;
  subtitle: string;
  description: string;
  cta: string;
  ctaLink: string;
  image: string;
  overlay?: string;
  dark?: boolean;
}[] = [
  {
    number: "01",
    icon: <IconHistory />,
    title: "Medical History Review",
    titleColor: "#04754B",
    pillBg: "#ECFDF6",
    subtitle:
      "Your second brain for health\u2014August recalls the details you miss.",
    description:
      "August quickly scans your health records, highlighting key details\u2014like past conditions, treatments, or allergies\u2014so you get personalised, accurate guidance instantly.",
    cta: "Review records Now",
    ctaLink:
      "https://www.meetaugust.ai/join/wa?message=Can%20you%20help%20me%20make%20sense%20of%20my%20medical%20history%20and%20summarize%20what%20matters%3F&utm=page_cta",
    image: "https://framerusercontent.com/images/vM2vbTpN7efH0gPhCuHlaZSnqNk.png?width=1136&height=624",
  },
  {
    number: "02",
    icon: <IconSymptom />,
    title: "Symptom Checking & Differential Diagnosis",
    titleColor: "#FAD82D",
    subtitle:
      "Understand Symptoms. Explore Causes. Know What to Ask Your Doctor.",
    description:
      "Not sure what\u2019s causing that headache, rash, or stomach pain? August gives you clarity before you panic\u2014helps you decide if it\u2019s worth seeing a doctor & what to ask if you do.",
    cta: "Check your Symptoms",
    ctaLink:
      "https://www.meetaugust.ai/join/wa?message=I%E2%80%99m%20feeling%20off%20%E2%80%94%20can%20I%20tell%20you%20my%20symptoms%20and%20get%20help%20figuring%20out%20what%20it%20could%20be%3F&utm=page_cta",
    image: "/website-images/feature-card-symptom.png",
    overlay: "/website-images/feature-card-symptom-overlay.png",
    dark: true,
  },
  {
    number: "03",
    icon: <IconCareNav />,
    title: "Care Navigation & Specialist Guidance",
    titleColor: "#D4F9FF",
    subtitle: "Know exactly where, when and whom to seek care.",
    description:
      "August assesses your symptoms, determines urgency & quickly connects you with the right provider or specialist.",
    cta: "Talk to August",
    ctaLink:
      "https://www.meetaugust.ai/join/wa?message=I%E2%80%99m%20confused%20about%20what%20to%20do%20next%20for%20my%20health%20%E2%80%94%20can%20you%20guide%20me%20step%20by%20step%3F&utm=page_cta",
    image: "/website-images/feature-card-care-nav.png",
    overlay: "/website-images/feature-card-care-nav-overlay.png",
    dark: true,
  },
  {
    number: "04",
    icon: <IconLab />,
    title: "Lab Report & Prescription Analysis",
    titleColor: "#00B2FF",
    pillBg: "#EBFAFF",
    subtitle: "Tired of medical jargon? Get clarity when you\u2019re confused.",
    description:
      "August translates complex medical prescriptions, understands scans, highlights information, flags potential medication interactions, and suggests safer alternatives",
    cta: "Get clarity on Meds",
    ctaLink:
      "https://www.meetaugust.ai/join/wa?message=I%20have%20lab%20results%20and%20a%20prescription%20%E2%80%94%20can%20you%20explain%20them%20in%20simple%20terms%20and%20tell%20me%20what%20to%20watch%3F&utm=page_cta",
    image: "/website-images/feature-card-lab.png",
  },
  {
    number: "05",
    icon: <IconSecondOpinion />,
    title: "Second Opinion",
    titleColor: "#FF423E",
    pillBg: "#FFF5F5",
    subtitle:
      "Eliminate doubt; verify your treatment options before you commit.",
    description:
      "Big, scary, or unclear health decisions? Whether it\u2019s a complex diagnosis, major treatment, or avoiding unnecessary procedures, August helps you explore evidence-based options so you have clarity, confidence & peace of mind.",
    cta: "Get Second Opinion",
    ctaLink:
      "https://www.meetaugust.ai/join/wa?message=I%20got%20a%20diagnosis%20and%20treatment%20plan%20but%20I%E2%80%99m%20not%20fully%20sure%20%E2%80%94%20can%20you%20help%20me%20think%20it%20through%20and%20prepare%20questions%20for%20my%20doctor%3F&utm=page_cta",
    image: "/website-images/feature-card-second.png",
  },
  {
    number: "06",
    icon: <IconWellness />,
    title: "Wellness Planning",
    titleColor: "#FAE77D",
    subtitle:
      "Your health plan, for the whole you\u2014not just what\u2019s hurting.",
    description:
      "From diet & sleep to exercise & stress\u2014August creates a hyper-personalised wellness plan based on your health history, habits, goals & needs. A plan for your healthy life.",
    cta: "Talk to August",
    ctaLink:
      "https://www.meetaugust.ai/join/wa?message=I%20want%20a%20simple%20wellness%20plan%20I%20can%20actually%20stick%20to%20%E2%80%94%20sleep%2C%20food%2C%20and%20movement%20based%20on%20my%20goals&utm=page_cta",
    image: "/website-images/feature-card-wellness.png",
    overlay: "/website-images/feature-card-wellness-overlay.png",
    dark: true,
  },
];

export function Features({ initialCountry }: { initialCountry?: string | null }) {
  return (
    <section id="features" className="py-12 sm:py-20 px-4">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-base sm:text-xl font-semibold text-primary-400 mb-4">
            The Features
          </p>
          <h2 className="text-[28px] sm:text-4xl font-semibold leading-[1.2] tracking-[-0.96px] text-dark mb-4">
            What August can do for you
          </h2>
          <p className="text-base text-[#595959] font-medium max-w-[636px] mx-auto">
            From reports to treatment options, August simplifies your health, so
            you can stay at ease.
          </p>
        </div>

        {/* Feature Cards - Paired Rows with Asymmetric Widths */}
        {/* Original: light cards 484px, dark cards 592px, gap 24px, rows 594px */}
        <div className="flex flex-col gap-6">
          {[
            { left: features[0], right: features[1], wideRight: true },
            { left: features[2], right: features[3], wideRight: false },
            { left: features[4], right: features[5], wideRight: true },
          ].map((row) => (
            <div
              key={row.left.number}
              className="flex flex-col md:flex-row gap-6"
            >
              {[
                {
                  feature: row.left,
                  flex: row.wideRight
                    ? "md:flex-[484]"
                    : "md:flex-[592]",
                },
                {
                  feature: row.right,
                  flex: row.wideRight
                    ? "md:flex-[592]"
                    : "md:flex-[484]",
                },
              ].map(({ feature, flex }) =>
                feature.dark ? (
                  <a
                    key={feature.number}
                    href={feature.ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      track("card_click", {
                        section: "features",
                        cta_text: feature.cta,
                        feature_number: feature.number,
                      })
                    }
                    className={`relative rounded-2xl overflow-hidden flex flex-col cursor-pointer ${flex} group`}
                  >
                    {/* Background person photo at z-0 */}
                    {feature.image && (
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 55vw"
                        className="object-cover z-0"
                        style={{ objectPosition: "50% 0%" }}
                      />
                    )}
                    {/* UI screenshot overlay at z-[1] */}
                    {feature.overlay && (
                      <div className="absolute top-0 left-0 right-0 z-[1] pointer-events-none">
                        <Image
                          src={feature.overlay}
                          alt=""
                          width={1312}
                          height={672}
                          sizes="(max-width: 768px) 100vw, 55vw"
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    )}
                    {/* Content area at the bottom of the card */}
                    <div className="relative z-[2] flex flex-col justify-end flex-1 min-h-[480px] sm:min-h-[500px]">
                      {/* Spacer for image visibility at top */}
                      <div className="flex-1 min-h-[200px] sm:min-h-0" />
                      {/* Wrapper for frosted glass + content */}
                      <div className="relative">
                        {/* Frosted backdrop layer with gradient fade at top */}
                        <div
                          className="absolute inset-0 bg-black/10 backdrop-blur-[5px]"
                          style={{ maskImage: "linear-gradient(to bottom, transparent, black 48px)", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 48px)" }}
                        />
                        {/* Content layer on top (no mask, so text stays crisp) */}
                        <div className="relative px-6 pb-6 lg:px-8 lg:pb-8">
                          <p
                            className="text-[54px] font-medium mb-3 bg-clip-text text-transparent"
                            style={{ backgroundImage: "linear-gradient(0deg, rgba(255,255,255,0) 19%, rgb(255,255,255) 100%)" }}
                          >
                            {feature.number}
                          </p>
                          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-[5px] rounded-pill px-3 py-1.5 mb-3 self-start">
                            {feature.icon}
                            <p className="font-semibold text-base" style={{ color: feature.titleColor }}>
                              {feature.title}
                            </p>
                          </div>
                          <p className="text-xl sm:text-2xl font-semibold text-white leading-[1.2] tracking-[-0.48px] mb-3">
                            {feature.subtitle}
                          </p>
                          <p className="text-base text-white/80 leading-normal mb-6">
                            {feature.description}
                          </p>
                          {/* <TrackedCTA
                            href={feature.ctaLink}
                            className="inline-flex items-center gap-2 text-white font-semibold text-base px-4 py-3 rounded-pill transition-colors self-start"
                            style={{ background: "linear-gradient(rgb(45, 155, 119) 0%, rgb(32, 110, 85) 100%)" }}
                            section="features"
                            cta_text={feature.cta}
                          >
                            {feature.cta}
                          </TrackedCTA> */}
                        </div>
                      </div>
                    </div>
                  </a>
                ) : (
                  <a
                    key={feature.number}
                    href={feature.ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      track("card_click", {
                        section: "features",
                        cta_text: feature.cta,
                        feature_number: feature.number,
                      })
                    }
                    className={`bg-white rounded-2xl overflow-hidden flex flex-col cursor-pointer ${flex} group`}
                  >
                    {feature.image && (
                      <div className="w-full overflow-hidden">
                        <Image
                          src={feature.image}
                          alt={feature.title}
                          width={648}
                          height={320}
                          sizes="(max-width: 768px) 100vw, 45vw"
                          className="w-full h-auto"
                        />
                      </div>
                    )}
                    <div className="px-6 pb-6 lg:px-8 lg:pb-8 flex flex-col flex-1">
                      <p
                        className="text-[54px] font-medium mb-3 bg-clip-text text-transparent"
                        style={{ backgroundImage: "linear-gradient(0deg, rgba(121,216,179,0) 24%, rgb(121,216,179) 100%)" }}
                      >
                        {feature.number}
                      </p>
                      <div
                        className="inline-flex items-center gap-2 rounded-pill px-3 py-1.5 mb-3 self-start"
                        style={{ backgroundColor: feature.pillBg }}
                      >
                        {feature.icon}
                        <p className="font-semibold text-base" style={{ color: feature.titleColor }}>
                          {feature.title}
                        </p>
                      </div>
                      <p className="text-xl sm:text-2xl font-semibold text-dark leading-[1.2] tracking-[-0.48px] mb-3">
                        {feature.subtitle}
                      </p>
                      <p className="text-base text-[#595959] leading-normal mb-6 flex-1">
                        {feature.description}
                      </p>
                       {/* <TrackedCTA
                        href={feature.ctaLink}
                        className="inline-flex items-center gap-2 text-white font-semibold text-base px-4 py-3 rounded-pill transition-colors self-start"
                        style={{ background: "linear-gradient(rgb(45, 155, 119) 0%, rgb(32, 110, 85) 100%)" }}
                        section="features"
                        cta_text={feature.cta}
                      >
                        {feature.cta}
                      </TrackedCTA> */}
                    </div>
                  </a>
                )
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="flex flex-col items-center mt-10 gap-3">
          <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 500, lineHeight: '150%', color: '#1D1D1D' }}>Don&apos;t postpone your health worries</p>
          <TrackedCTA
            href="https://www.meetaugust.ai/join/wa?message=Hello%20August&utm=page_cta"
            button_name="features"
            button_copy="Talk To August Now"
            initialCountry={initialCountry}
          >
            Talk To August Now
          </TrackedCTA>
        </div>
      </div>
    </section>
  );
}
