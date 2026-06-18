"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/* ─── Hero Title ───────────────────────────────────────────── */
export function PrescriptionHero() {
  return (
    <section className="pt-36 pb-6">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{
            fontFamily: '"Archivo", "Archivo Placeholder", sans-serif',
            fontSize: "clamp(28px, 4vw, 38px)",
            fontWeight: 500,
            letterSpacing: "-0.76px",
            lineHeight: 1.3,
            color: "rgb(0, 46, 37)",
            textAlign: "center",
          }}
        >
          Doctor Prescription Reader
        </motion.h2>
      </div>
    </section>
  );
}

/* ─── Iframe Embed ─────────────────────────────────────────── */
export function PrescriptionEmbed() {
  return (
    <section className="pb-10 md:pb-16 px-4 md:px-0">
      <div className="max-w-[1440px] mx-auto">
        <div
          className="w-full h-[75vh] min-h-[500px] md:h-[720px] overflow-hidden bg-white"
          style={{ 
            border: "0px solid rgb(204, 204, 204)",
            borderRadius: "0px",
          }}
        >
          <iframe
            style={{ width: "100%", height: "100%", border: "none" }}
            title="August AI Prescription Reader"
            allow="camera"
            srcDoc={`<!DOCTYPE html>
<html>
<head>
<style>
html, body { margin: 0; padding: 0; min-height: 100%; width: 100%; overflow: hidden; background: white; }
* { box-sizing: border-box; }
.chat-embed { height: 100vh; width: 90%; margin: 0 auto; position: relative; }
@media (max-width: 768px) {
  .chat-embed { width: 100%; }
}
</style>
</head>
<body>
<div class="chat-embed"></div>
<script src="https://augustbuckets.blob.core.windows.net/web-app-assets/scripts/web-iframe-prescriptions-staging.js"><\/script>
</body>
</html>`}
          />
        </div>
      </div>
    </section>
  );
}

/* ─── Long-form Content ────────────────────────────────────── */
export function PrescriptionContent() {
  return (
    <section className="pb-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-14"
          >
            <h1
              style={{
                fontFamily: '"Archivo", "Archivo Placeholder", sans-serif',
                fontSize: "clamp(32px, 5vw, 61px)",
                fontWeight: 500,
                letterSpacing: "-2.44px",
                lineHeight: 1.2,
                color: "rgb(0, 46, 37)",
                textAlign: "center",
              }}
            >
              What is Doctor Prescription Reader
              <br className="hidden md:block" />
              by August AI?
            </h1>
          </motion.div>
 
          {/* Content area – single column prose */}
          <div
            className="max-w-[1200px] mx-auto"
            style={{
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: 16,
              letterSpacing: "-0.32px",
              lineHeight: "1.7em",
              color: "rgb(9, 12, 16)",
            }}
          >
            {/* Intro paragraph */}
            <motion.p variants={fadeUp} className="mb-10">
              August is an AI companion that simplifies managing your{" "}
              <strong>Doctor Prescription Reader</strong> needs, making the
              process of understanding your health faster and more efficient.
              Simply upload a photo or scan of your script, and August will
              function as a <strong>prescription reader online free</strong> of
              charge to instantly read, interpret, and clarify your medication
              details. It is especially helpful when deciphering difficult to
              read doctor&apos;s handwriting, ensuring that you receive clear,
              accurate guidance in easy to understand language for better
              comprehension of your medical needs.
            </motion.p>
 
            {/* Why Use */}
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: '"Archivo", "Archivo Placeholder", sans-serif',
                fontSize: "clamp(24px, 3vw, 38px)",
                fontWeight: 500,
                letterSpacing: "-0.76px",
                lineHeight: 1.3,
                color: "rgb(0, 46, 37)",
                textAlign: "left",
              }}
              className="mb-8"
            >
              Why Use August AI Medical Prescription Reader?
            </motion.h2>
 
            <motion.p variants={fadeUp} className="mb-6">
              Managing medical documents can be confusing and overwhelming,
              especially when dealing with multiple medications or unclear
              handwriting. Here is why you should choose August as your go to{" "}
              <strong>AI Prescription Reader online free</strong>:
            </motion.p>
 
            <motion.ul variants={fadeUp} className="mb-10 pl-6 space-y-4" style={{ listStyleType: "disc" }}>
              <li>
                <strong>No More Guesswork:</strong> Never worry about
                misinterpreting your medical prescription or forgetting important
                details. August reads it for you and provides clear, actionable
                guidance.
              </li>
              <li>
                <strong>Convenience:</strong> Forget about calling the office or
                waiting in line at the pharmacy for clarifications. You can get
                instant answers to all your medication related questions, 24/7.
              </li>
              <li>
                <strong>Personalized Assistance:</strong> Unlike generic advice,
                August tailors its responses to your specific{" "}
                <strong>Doctor Prescription Reader</strong> results, offering
                advice that&apos;s relevant to your situation.
              </li>
              <li>
                <strong>Peace of Mind:</strong> With AI powered accuracy and
                privacy first policies, you can be confident that your medication
                details are interpreted correctly and safely.
              </li>
            </motion.ul>
 
            {/* How It Works */}
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: '"Archivo", "Archivo Placeholder", sans-serif',
                fontSize: "clamp(24px, 3vw, 38px)",
                fontWeight: 500,
                letterSpacing: "-0.76px",
                lineHeight: 1.3,
                color: "rgb(0, 46, 37)",
                textAlign: "left",
              }}
              className="mb-8"
            >
              How It Works:
            </motion.h2>
 
            <motion.p variants={fadeUp} className="mb-6">
              Using August to manage your{" "}
              <strong>prescription reader online free</strong> experience is
              quick, simple, and hassle free. Here is how it works, step by step:
            </motion.p>
 
            <motion.ol variants={fadeUp} className="mb-10 pl-6 space-y-6" style={{ listStyleType: "decimal" }}>
              <li>
                <strong>Upload Your Prescription:</strong>
                <br />
                Getting started is easy. Simply take a photo or upload a scan
                through the August chat interface. Whether it&apos;s handwritten
                or typed, August is designed to process both formats accurately.
                You can use this{" "}
                <strong>doctor handwriting reader online</strong> directly from
                your phone, tablet, or computer, making it convenient to use
                anytime, anywhere.
              </li>
              <li>
                <strong>Instant Prescription Analysis:</strong>
                <br />
                Once your document is uploaded, August&apos;s AI powered engine
                goes to work. It instantly reads and interprets the content. This
                includes extracting key information such as the medication names,
                dosages, frequencies, and any special instructions or warnings.
                As a specialized{" "}
                <strong>prescription reader AI online</strong>, the bot ensures
                nothing is overlooked, so you have all the critical details right
                at your fingertips.
              </li>
              <li>
                <strong>Receive Clear and Concise Guidance:</strong>
                <br />
                After analyzing the text, August breaks it down into easy to
                understand language. Instead of dealing with complex medical
                jargon, you&apos;ll receive a simplified explanation of how to
                take each medication, when to take it, and any possible side
                effects to watch for. If you need more detail, the bot can
                provide deeper insights into specific instructions.
              </li>
              <li>
                <strong>Ask Questions &amp; Get Personalized Advice:</strong>
                <br />
                If anything is unclear, simply ask. August is not just a{" "}
                <strong>doctor prescription reader app</strong> experience;
                it&apos;s a personal health assistant that can answer your
                questions in real time. Whether you&apos;re unsure about the
                dosage or worried about potential interactions, August provides
                accurate and relevant advice tailored to your situation.
              </li>
              <li>
                <strong>Stay Informed with Ongoing Updates:</strong>
                <br />
                August can notify you of updates, provide reminders for refills,
                and even alert you about possible interactions or
                contraindications with other medications you may be taking. With
                August, you&apos;re always in the know about your health.
              </li>
              <li>
                <strong>Secure &amp; Private:</strong>
                <br />
                All your health data is handled with the utmost care. August uses
                advanced encryption and privacy protocols to ensure that your{" "}
                <strong>Doctor Prescription Reader</strong> details and any
                information you share are fully secure and confidential. We take
                your privacy seriously and follow the highest standards to
                protect your personal data.
              </li>
            </motion.ol>

            {/* Challenges */}
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: '"Archivo", "Archivo Placeholder", sans-serif',
                fontSize: "clamp(24px, 3vw, 38px)",
                fontWeight: 500,
                letterSpacing: "-0.76px",
                lineHeight: 1.3,
                color: "rgb(0, 46, 37)",
                textAlign: "left",
              }}
              className="mb-8"
            >
              Challenges You May Encounter
            </motion.h2>
 
            <motion.p variants={fadeUp} className="mb-6">
              While August is designed to be an incredibly useful{" "}
              <strong>best prescription reader online free</strong> tool, there
              are a few things to consider:
            </motion.p>
 
            <motion.ul variants={fadeUp} className="mb-10 pl-6 space-y-4" style={{ listStyleType: "disc" }}>
              <li>
                <strong>Prescription Accuracy</strong>: The AI relies on the
                quality of the image you upload. If the handwriting is
                excessively smudged, August may not be able to interpret it
                correctly.
              </li>
              <li>
                <strong>Not a Replacement for Professional Advice</strong>: While
                August provides reliable guidance, it is not a substitute for
                professional medical advice. Always consult your healthcare
                provider for medical concerns.
              </li>
              <li>
                <strong>Compatibility with Certain Formats</strong>: While August
                works with most formats, heavily stylized scripts may present a
                challenge for the AI, especially if the ink is faded.
              </li>
              <li>
                <strong>Limited to Prescription Information</strong>: August can
                only interpret the data present in the{" "}
                <strong>Doctor Prescription Reader</strong> upload itself. It
                cannot access additional medical history unless provided by you.
              </li>
            </motion.ul>
 
            {/* Demo */}
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: '"Archivo", "Archivo Placeholder", sans-serif',
                fontSize: "clamp(24px, 3vw, 38px)",
                fontWeight: 500,
                letterSpacing: "-0.76px",
                lineHeight: 1.3,
                color: "rgb(0, 46, 37)",
                textAlign: "left",
              }}
              className="mb-8"
            >
              Let&apos;s go through a demo:
            </motion.h2>
 
            <motion.p variants={fadeUp} className="mb-8">
              Sarah has just received a new prescription from her doctor for a
              medication called Lisinopril to help manage her blood pressure. The
              prescription is a little hard to read due to her doctor&apos;s
              handwriting, and Sarah isn&apos;t entirely sure about the dosage or
              how often she should take it.
            </motion.p>
 
            <motion.div variants={fadeUp} className="space-y-8 mb-16">
              <div>
                <p className="mb-3">
                  <strong>Step 1: Upload the Prescription</strong>
                  <br />
                  Sarah takes a photo of her medical prescription using the
                  August platform. She uploads it through the chat interface in a
                  few easy steps.
                </p>
              </div>
 
              <div>
                <p className="mb-3">
                  <strong>Step 2: Prescription Analysis</strong>
                  <br />
                  August&apos;s AI instantly reads the doctor&apos;s
                  prescription, extracting important details such as the
                  medication name, dosage, and instructions. The prescription
                  includes:
                </p>
                <ul className="pl-6 space-y-2 mb-3" style={{ listStyleType: "disc" }}>
                  <li>Medication: Lisinopril 10mg</li>
                  <li>Dosage: 1 tablet once a day</li>
                  <li>
                    Special Instructions: Take with or without food. Avoid
                    potassium supplements.
                  </li>
                </ul>
              </div>
 
              <div>
                <p className="mb-3">
                  <strong>Step 3: Receive Clear Guidance</strong>
                  <br />
                  August presents Sarah with a simplified breakdown of her doctor
                  prescription in plain language:
                </p>
                <ul className="pl-6 space-y-3 mb-3" style={{ listStyleType: "disc" }}>
                  <li>
                    <strong>Medication</strong>: Lisinopril 10mg
                    <br />
                    This medication is used to treat high blood pressure
                    (hypertension) and may also help protect the kidneys.
                    It&apos;s important to take it consistently for the best
                    results.
                  </li>
                  <li>
                    <strong>Dosage</strong>: Take one 10mg tablet once a day,
                    preferably at the same time each day. It can be taken with or
                    without food, depending on your preference.
                  </li>
                  <li>
                    <strong>Special Instructions</strong>: Avoid taking potassium
                    supplements while on this medication, as it may lead to an
                    imbalance. Always drink plenty of water.
                  </li>
                </ul>
              </div>
 
              <div>
                <p className="mb-3">
                  <strong>Step 4: Ask Questions</strong>
                  <br />
                  Sarah, unsure about potassium supplements, types a question:
                  <br />
                  &quot;What are potassium supplements, and why should I avoid
                  them?&quot;
                </p>
                <p>
                  August replies promptly with a detailed but simple explanation:
                  <br />
                  Potassium supplements are pills or foods with extra potassium,
                  which can interfere with your Lisinopril. Too much potassium
                  can cause side effects like irregular heart rhythms or muscle
                  weakness. It&apos;s best to avoid these while taking your
                  medication.
                </p>
              </div>
 
              <div>
                <p>
                  <strong>Step 5: Ongoing Support</strong>
                  <br />
                  Sarah now has a clearer understanding of her medical
                  prescription. August even sets a reminder for her to take her
                  medication daily, ensuring she doesn&apos;t forget. In the
                  future, Sarah will get notifications about her refills and any
                  new updates to her medical prescription.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
 
/* ─── CTA Section ──────────────────────────────────────────── */
export function PrescriptionCTA() {
  return (
    <section className="py-20 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            fontFamily: '"Archivo", "Archivo Placeholder", sans-serif',
            fontSize: "clamp(32px, 5vw, 61px)",
            fontWeight: 500,
            letterSpacing: "-2.44px",
            lineHeight: 1.2,
            color: "rgb(0, 46, 37)",
            textAlign: "center",
          }}
          className="mb-12"
        >
          Stop guessing what
          <br />
          your doctor wrote
        </motion.h1>
 
        <motion.a
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          href="https://www.meetaugust.ai/join/wa?message=Hello%20August&utm=page_cta"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-10 py-5 text-white font-semibold rounded-[52px] transition-transform hover:scale-105 shadow-xl"
          style={{
            background:
              "linear-gradient(rgb(45, 155, 119) 0%, rgb(32, 110, 85) 100%)",
            border: "1px solid rgba(28, 96, 77, 0.4)",
            boxShadow:
              "rgba(0,0,0,0.18) 0px 1px 2px 0px, rgba(0,0,0,0.16) 0px 4px 4px 0px, rgba(0,0,0,0.09) 0px 9px 5px 0px, rgba(0,0,0,0.03) 0px 16px 6px 0px, rgba(0,0,0,0) 0px 24px 7px 0px",
            fontFamily: '"Geist", "Geist Placeholder", sans-serif',
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: "24px",
          }}
        >
          Just Try August Now
        </motion.a>
      </div>
    </section>
  );
}

/* ─── FAQs ─────────────────────────────────────────────────── */
export function PrescriptionFAQs() {
  const faqs = [
    {
      question: "Is this prescription reader online free to use?",
      answer:
        "Yes, our tool is 100% free. We believe everyone should have the right to understand their own medical documents without having to pay for a translation service or a premium app. You can use the doctor handwriting reader online free as many times as you need.",
    },
    {
      question: "How accurate is a Doctor Prescription Reader?",
      answer:
        "While our AI is highly advanced and among the best prescription reader online free options available, it is always a screening tool. It is excellent at deciphering messy handwriting, but you should always confirm the final medication and dosage with your pharmacist or doctor before taking any medicine.",
    },
    {
      question:
        "Can I use this as a doctor prescription reader app on my phone?",
      answer:
        "Absolutely. The interface is fully mobile optimized. You don't need to download anything from an app store; just open the tool in your mobile browser, upload a photo of your prescription, and let the AI do the work.",
    },
    {
      question:
        "Is my medical data safe when using a prescription reader AI online?",
      answer:
        "Your privacy is our priority. We do not store your prescription images or personal medical data. The AI processes the image to extract the text and then discards the data, ensuring your health information remains confidential.",
    },
  ];

  return (
    <section className="py-16 pb-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            fontFamily: '"Archivo", "Archivo Placeholder", sans-serif',
            fontSize: "clamp(24px, 3vw, 38px)",
            fontWeight: 500,
            letterSpacing: "-0.76px",
            lineHeight: 1.3,
            color: "rgb(0, 46, 37)",
          }}
          className="mb-8"
        >
          FAQs
        </motion.h2>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="space-y-3"
        >
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      variants={fadeUp}
      className="rounded-[24px] bg-white overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
      >
        <span
          style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: "-0.04em",
            lineHeight: "140%",
            color: "rgb(0, 0, 0)",
          }}
        >
          {question}
        </span>

        {/* Green + icon matching reference */}
        <span
          className="shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center relative"
          style={{ backgroundColor: "rgb(28, 96, 77)" }}
        >
          {/* Horizontal bar */}
          <span
            className="absolute bg-white rounded-full"
            style={{
              width: 14,
              height: 2,
              transition: "transform 0.3s",
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
            }}
          />
          {/* Vertical bar */}
          <span
            className="absolute bg-white rounded-full transition-transform duration-300"
            style={{
              width: 2,
              height: 14,
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
            }}
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p
              className="px-6 pb-6"
              style={{
                fontSize: 16,
                letterSpacing: "-0.04em",
                lineHeight: "140%",
                color: "rgba(0, 0, 0, 0.6)",
              }}
            >
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
