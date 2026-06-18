"use client";

import Image from "next/image";
import { StoreButtons } from "./StoreButtons";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

/* ─── Hero ─────────────────────────────────────────────────── */
export function AboutHero() {
  return (
    <section className="relative pt-32 pb-8">
      <div className="relative z-10 mx-4 sm:mx-6 xl:mx-auto max-w-[1200px] px-0 xl:px-6">
        {/* Rectangle with gradient bg + text on top */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.21, 0.45, 0.32, 0.9] }}
          className="relative w-full overflow-hidden rounded-[24px] flex flex-col items-center justify-center text-center"
          style={{
            minHeight: "420px",
            padding: "60px 24px",
          }}
        >
          {/* Gradient background image */}
          <Image
            src="/website-images/about/hero-gradient.png"
            alt=""
            fill
            className="object-cover"
            priority
          />

          {/* Dark overlay for text readability */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0, 0, 0, 0.25)" }}
          />

          {/* Content on top */}
          <div className="relative z-10">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontWeight: 500,
                color: "rgba(255, 255, 255, 0.6)",
                marginBottom: "16px",
              }}
            >
              Our Story
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mx-auto max-w-3xl"
              style={{
                fontFamily: '"Inter Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontSize: "clamp(34px, 5vw, 56px)",
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "#FAF9F5",
              }}
            >
              Putting you at the centre of healthcare
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mx-auto mt-4 max-w-2xl"
              style={{
                fontSize: "clamp(15px, 1.8vw, 18px)",
                fontWeight: 300,
                lineHeight: 1.7,
                color: "rgba(250, 249, 245, 0.6)",
              }}
            >
              Building from India, for the world
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Story ────────────────────────────────────────────────── */
export function AboutStory() {
  return (
    <section className="py-12 md:py-20 lg:py-24" >
      <div className="mx-auto max-w-[800px] px-6 md:px-10 lg:px-20 text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            color: "rgb(0, 46, 37)",
          }}
          className="mb-8 md:mb-10"
        >
          Your health{" "}
          <span style={{ color: "#206E55" }}>matters</span>
        </motion.h2>

        {/* Body text */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          style={{
            letterSpacing: "-0.18px",
            lineHeight: "1.8em",
            color: "rgb(9, 12, 16)",
            textAlign: "left",
          }}
          className="space-y-6 text-base"
        >
          {[
            <>August is your health companion AI: &quot;<strong>designed not to replace doctors, but to offer clarity and reassurance in the chaotic silence between visits</strong>&quot;.</>,
            <>We&apos;re a multi-disciplinary team of doctors, engineers, and data scientists who&apos;ve lived both sides of the healthcare experience: as practitioners and as patients. Our work is grounded in a deep understanding of how healthcare actually unfolds in the real world: with ambiguity, overwhelm, and often, silence.</>,
            <>The idea for August began in 2022, after one of our founders, Anuruddh, went through a painful four-month misdiagnosis for rheumatoid arthritis. Despite access to doctors, lab tests, and second opinions, the answers never quite added up. It took his own deep dive into reports and symptoms to uncover the real issue: a simple nutritional imbalance. The system hadn&apos;t failed maliciously; it had just left him to figure it out alone.</>,
            <>That experience wasn&apos;t rare. It was far too common.</>,
            <>So we started building. Not a chatbot. Not a virtual doctor. But a companion: one that could read prescriptions, interpret lab reports, explain medical terms, and help you piece things together when no one else has the time. We began with computational algorithms that make sense of scattered health data and are now building toward a future where AI becomes a deeply empathetic force in healthcare.</>,
            <>We believe AI isn&apos;t just about speed or automation. It&apos;s about not missing the thing that matters, because someone was too tired, too rushed, or too human. And that future isn&apos;t far away.</>
          ].map((p, i) => (
            <motion.p key={i} variants={fadeUp}>
              {p}
            </motion.p>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Values ───────────────────────────────────────────────── */
export function AboutValues() {
  const values = [
    {
      iconUrl: "/website-images/about/icon-passion.svg",
      title: "Passion",
      description:
        "We care deeply about your health and the problem that we are solving.",
    },
    {
      iconUrl: "/website-images/about/icon-customer-focus.svg",
      title: "Customer Focus",
      description:
        "Whatever you need, whenever you need - we are here to help.",
    },
    {
      iconUrl: "/website-images/about/icon-transparency.svg",
      title: "Transparency",
      description:
        "We accept our strengths and flaws. We know August has a long way to go and we'll keep building until it's the way you look at your health.",
    },
  ];

  return (
    <section className="py-12 md:py-20 lg:py-24" >
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-20 text-center">
        <div className="mb-8 md:mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              color: "rgb(0, 46, 37)",
              textAlign: "center",
            }}
          >
            We lead with{" "}
            <span style={{ color: "#206E55" }}>our principles</span>
          </motion.h2>
          <p
            className="mx-auto mt-2 max-w-lg"
            style={{
              fontSize: "clamp(15px, 1.8vw, 18px)",
              fontWeight: 300,
              color: "rgb(60, 64, 73)",
            }}
          >
            Our values guide everything we build
          </p>
        </div>

        {/* Cards */}
        <motion.div 
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {values.map((v, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="flex flex-col items-center p-10 rounded-[24px]"
              style={{ border: "1px solid rgba(0,0,0,0.06)", backgroundColor: "#fff" }}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#F3F4F6] flex items-center justify-center mb-6">
                <Image src={v.iconUrl} alt={`${v.title} icon`} width={32} height={32} />
              </div>
              <h3
                style={{
                  fontFamily: '"Inter Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  fontSize: 20,
                  fontWeight: 500,
                  letterSpacing: "-0.3px",
                  lineHeight: "1.6em",
                  color: "rgb(9, 12, 16)",
                  textAlign: "center",
                }}
                className="mb-3"
              >
                {v.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  letterSpacing: "-0.08px",
                  lineHeight: "1.7em",
                  color: "rgb(60, 64, 73)",
                  textAlign: "center",
                }}
              >
                {v.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Benchmark ────────────────────────────────────────────── */
export function AboutBenchmark() {
  return (
    <section className="py-12 md:py-20 lg:py-24" >
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-20 text-center">
        <div className="mb-8 md:mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              color: "rgb(0, 46, 37)",
            }}
          >
            August is the{" "}
            <span style={{ color: "#206E55" }}>top Health AI in the world</span>
          </motion.h2>
          <p
            className="mx-auto mt-2 max-w-2xl"
            style={{
              fontSize: "clamp(15px, 1.8vw, 18px)",
              fontWeight: 300,
              color: "rgb(60, 64, 73)",
            }}
          >
            We scored 100% in the US Medical Licensing Examination, the same standardized test used to train and license doctors.
          </p>
          <motion.a
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            href="https://www.meetaugust.ai/en/library/august-benchmark-2026"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 group mt-4"
            style={{ color: "rgb(0, 46, 37)", fontWeight: 500, fontSize: "16px" }}
          >
            Learn More
            <Image
              src="/website-images/about/arrow-right.svg"
              alt="Right arrow icon"
              width={24}
              height={24}
              className="transition-transform group-hover:translate-x-1"
            />
          </motion.a>
        </div>

        {/* Chart image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-full max-w-[900px] mx-auto overflow-hidden"
        >
          <Image
            src="/website-images/about/benchmark-chart.png"
            alt="USMLE Benchmark comparison chart"
            width={1588}
            height={1021}
            className="w-full h-auto object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Team ─────────────────────────────────────────────────── */
export function AboutTeam() {
  const team = [
    {
      name: "Anuruddh Mishra",
      title: "Founder and CEO",
      image: "/website-images/about/team-anuruddh.jpg",
      linkedin: "https://www.linkedin.com/in/anuruddhmishra/",
    },
    {
      name: "Samarth Sharma",
      title: "Data Science",
      image: "/website-images/about/team-samarth.png",
      linkedin: "https://www.linkedin.com/in/samarth-sharma-12108/",
    },
    {
      name: "Dr. Deep Bhatt",
      title: "Medical Science",
      image: "/website-images/about/team-deep.jpg",
      linkedin: "https://www.linkedin.com/in/dr-deep-bhatt-7992b731/",
    },
    {
      name: "Dr. Anuruddh Misra",
      title: "Medical Advisor",
      image: "/website-images/about/team-misra.webp",
      linkedin: "https://www.linkedin.com/in/akmisra/",
    },
  ];

  return (
    <section className="py-12 md:py-20 lg:py-24" id="team" >
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-20 text-center">
        <div className="mb-8 md:mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              color: "rgb(0, 46, 37)",
              textAlign: "center",
            }}
          >
            The{" "}
            <span style={{ color: "#206E55" }}>team behind</span>
          </motion.h2>
        </div>

        {/* Grid */}
        <motion.div 
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {team.map((member, i) => (
            <motion.div key={i} variants={fadeUp} className="flex flex-col items-center">
              {/* Photo */}
              <div className="relative w-full aspect-[3/4] rounded-[20px] overflow-hidden mb-5 bg-gray-100 shadow-sm transition-transform hover:scale-[1.02] duration-300">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              {/* Name */}
              <p
                style={{
                  fontFamily: '"Inter Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  fontSize: 18,
                  fontWeight: 500,
                  letterSpacing: "-0.27px",
                  lineHeight: "1.8em",
                  color: "rgb(60, 64, 73)",
                  textAlign: "center",
                }}
              >
                {member.name}
              </p>
              {/* Title */}
              <p
                style={{
                  fontSize: 14,
                  letterSpacing: "-0.08px",
                  lineHeight: "1.7em",
                  color: "rgb(88, 93, 105)",
                }}
                className="mb-3"
              >
                {member.title}
              </p>
              {/* LinkedIn */}
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-gray-50 bg-white"
                style={{ border: "1px solid rgb(235, 236, 239)" }}
              >
                <Image
                  src="/website-images/about/linkedin-icon.png"
                  alt="LinkedIn"
                  width={20}
                  height={20}
                  className="opacity-60"
                />
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
 