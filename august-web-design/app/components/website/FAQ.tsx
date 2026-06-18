"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { track } from "@/app/utils/analytics";

const faqs = [
  {
    q: "Does August replace a doctor?",
    a: "No. August does not replace a doctor.\n\nAugust is an AI tool created with help from doctors. It gives general health guidance and education.\n\nYou should always consult a qualified doctor for medical decisions.",
  },
  {
    q: "Is August free to use?",
    a: "Yes, using August is completely free of charge.",
  },
  {
    q: "Is health insurance required to use August?",
    a: "No, you do not need health insurance to access August. It’s available to everyone regardless of insurance coverage.",
  },
  {
    q: "How does August work?",
    a: "August leverages AI  to analyze your health queries, cross-referencing trusted medical sources and data. It provides general guidance on symptoms, treatment options, and preventive care.",
  },
  {
    q: "Can August diagnose my condition?",
    a: "August does not provide a formal diagnosis. Instead, it helps you understand your symptoms and offers guidance on whether you should seek further evaluation from a healthcare provider.",
  },
  {
    q: "Is my data safe with August?",
    a: "Absolutely. We take your privacy seriously. August is designed with robust data security measures and follows HIPAA and GDPR guidelines, ensuring that your personal health information is protected at every step.",
  },
  {
    q: "Who can use August?",
    a: "Anyone seeking general health information can use August. Whether you’re preparing for an appointment, managing a chronic condition, or simply curious about a health topic, August is here to help. However, please remember that its guidance does not replace personalized medical consultation.",
  },
  {
    q: "What kind of questions can I ask August?",
    a: "You can ask about a wide range of topics, including symptoms, medication information, treatment options, preventive care, lifestyle tips, and more. From annual physical preparations to managing seasonal allergies, August is designed to assist with many common health inquiries.",
  },
  {
    q: "Can August help with emergency situations?",
    a: "No. August is not designed for emergency use. If you are experiencing a medical emergency, please call 911 or go directly to your nearest emergency department immediately.",
  },
  {
    q: "Will August share my data with third parties?",
    a: "No. Your privacy is our top priority. August does not share your data with third parties without your explicit consent, ensuring that your information remains confidential and secure.",
  },
  {
    q: "Which languages can August understand and reply in?",
    a: "Yes, August is designed to support 30+ languages to answer all your questions easily.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const visibleFaqs = showAll ? faqs : faqs.slice(0, 5);

  return (
    <section id="faqs" className="py-12 sm:py-20 px-6 sm:px-4 bg-white">
      <div className="max-w-[640px] mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-base sm:text-xl font-semibold text-primary-400 mb-4">
            FAQs
          </p>
          <h2 
            style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: "36px",
              fontWeight: 600,
              color: "#111111",
              marginBottom: "16px",
              letterSpacing: "-0.02em"
            }}
          >
            Common Questions
          </h2>
          <p 
            style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontSize: "16px",
              color: "rgba(17, 17, 17, 0.6)",
              maxWidth: "500px",
              margin: "0 auto",
              lineHeight: "1.5"
            }}
          >
            Answers to common questions about how August works, its accuracy, and
            your data privacy.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="flex flex-col gap-3">
          {visibleFaqs.map((faq, i) => (
            <div 
              key={i} 
              style={{
                width: "100%",
                borderRadius: "16px",
                border: "1px solid",
                borderColor: openIndex === i ? "rgba(17, 17, 17, 0.1)" : "transparent",
                boxShadow: openIndex === i ? "0px 2px 40px rgba(0, 0, 0, 0.05)" : "none",
                backgroundColor: openIndex === i ? "#ffffff" : "none",
                overflow: "hidden",
                transition: "all 0.3s ease"
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-7 text-left cursor-pointer transition-colors"
                style={{ paddingBottom: openIndex === i ? "20px" : "28px", paddingTop: "28px" }}
              >
                <p 
                  style={{
                    fontFamily: "var(--font-plus-jakarta), sans-serif",
                    fontSize: "20px",
                    fontWeight: 500,
                    lineHeight: "1.4",
                    color: "#111111",
                    margin: 0,
                    paddingRight: "2rem"
                  }}
                >
                  {faq.q}
                </p>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "52px",
                    background: "linear-gradient(rgb(45, 155, 119) 0%, rgb(32, 110, 85) 100%)",
                    border: "1px solid rgb(7, 121, 104)",
                    boxShadow: "rgba(0, 0, 0, 0.18) 0px 1px 2px 0px, rgba(0, 0, 0, 0.16) 0px 4px 4px 0px, rgba(0, 0, 0, 0.09) 0px 9px 5px 0px, rgba(0, 0, 0, 0.03) 0px 16px 6px 0px, rgba(0, 0, 0, 0) 0px 24px 7px 0px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.3s ease"
                  }}
                >
                  <motion.div
                    animate={{ rotate: openIndex === i ? 0 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {openIndex === i ? (
                      <svg width="16" height="4" viewBox="0 0 16 4" fill="none">
                        <path d="M2 2H14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 2V12M2 7H12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    )}
                  </motion.div>
                </div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                  >
                    <div className="px-7 pb-7">
                       <div 
                        style={{
                          borderTop: "1px solid rgba(17, 17, 17, 0.05)",
                          width: "100%",
                          marginBottom: "20px"
                        }}
                      />
                      <div 
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "20px"
                        }}
                      >
                        {faq.a.split('\n\n').map((paragraph, idx) => (
                          <p 
                            key={idx}
                            style={{
                              fontFamily: "var(--font-manrope), sans-serif",
                              fontWeight: 400,
                              lineHeight: "1.6",
                              color: "rgba(17, 17, 17, 0.65)",
                              fontSize: "16px",
                              margin: 0
                            }}
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <a 
                          href="https://www.meetaugust.ai/join/wa?message=Hello%20August&utm=landing_page_faq"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => track("cta_click", { button_name: "faq", button_copy: "Talk to August" })}
                          style={{
                            fontFamily: "var(--font-manrope), sans-serif",
                            fontWeight: 600,
                            lineHeight: "20px",
                            color: "#206E55",
                            textDecoration: "none",
                            fontSize: "16px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          Talk to August -&gt;
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Show More */}
          {!showAll && (
            <button
              onClick={() => setShowAll(true)}
              style={{
                fontFamily: "var(--font-plus-jakarta), sans-serif",
                fontSize: "16px",
                fontWeight: 500,
                color: "#111111",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                margin: "32px auto 0",
                transition: "opacity 0.2s"
              }}
              className="hover:opacity-70"
            >
              Show more
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
