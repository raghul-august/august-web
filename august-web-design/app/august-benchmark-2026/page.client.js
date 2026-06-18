'use client';

import Link from "next/link";
import { Navbar } from "@/app/components/website/Navbar";
import { Footer } from "@/app/components/website/Footer";
import QRFloatingBanner from "@/app/components/QRFloatingBanner";
import { Box } from "@mui/material";
import Image from "next/image";
import chartUsmle from "@/public/august-benchmark/image2.png";
import chartMedqa from "@/public/august-benchmark/image3.png";
import chartMmlu from "@/public/august-benchmark/image1.png";

const sections = [
  {
    title: "The USMLE",
    paragraphs: [
      "The United States Medical Licensing Examination is a three-step, high-stakes test required for medical licensure in the US. It covers everything physicians need to know: basic science, clinical reasoning, medical management, bioethics. The questions are rigorously standardized, which makes the USMLE an ideal benchmark for medical AI.",
      "Step 1 is 280 multiple-choice questions, testing foundational medical science. Step 2 CK adds 318 questions focused on clinical decision-making. Step 3 spans two days with 412 questions plus 13 simulated patient cases, it tests whether you can practice medicine independently.",
      "The passing threshold is around 60%. Human physicians train for years to clear it. August's results effectively saturate this benchmark.",
    ],
    img: {
      src: chartUsmle,
      alt: "August versus other leading models on the USMLE benchmark",
      caption:
        "August achieves a perfect score on the USMLE while other state-of-the-art models trail behind.",
    },
  },
  {
    title: "MedQA",
    paragraphs: [
      "MedQA is the standard benchmark for medical AI. It was introduced by researchers at MIT in 2020 and sources questions from professional medical licensing exams across three languages: English, Simplified Chinese, and Traditional Chinese.",
      "The English test set has 1,273 USMLE-style questions, each with four or five answer choices. These aren't simple recall, they require multi-step clinical reasoning. You read a patient vignette, interpret symptoms and test findings, reason about the diagnosis, then pick the right next step. It's closer to how physicians actually think.",
    ],
    img: {
      src: chartMedqa,
      alt: "August versus other models on the MedQA benchmark",
      caption: "August leads the MedQA benchmark, reflecting strong multi-step clinical reasoning.",
    },
  },
  {
    title: "MMLU medical subsets",
    paragraphs: [
      "MMLU (Measuring Massive Multitask Language Understanding) is the benchmark for general AI knowledge. It was introduced by UC Berkeley researchers in 2021 and covers 57 subjects with nearly 16,000 questions.",
      "For medical evaluation, six subsets matter most: Clinical Knowledge (265 questions), Professional Medicine (272), Medical Genetics (100), Anatomy (135), College Medicine (173), and College Biology (144). Together, that's about 1,100 questions testing medical and biological knowledge at various levels.",
      "One caveat: independent analysis found that roughly 6.5% of MMLU questions contain errors, wrong answers, ambiguous wording, or multiple valid choices. The Virology subset is particularly affected. This means the theoretical ceiling is below 100%.",
    ],
    img: {
      src: chartMmlu,
      alt: "August's scores across MMLU medical subsets compared to other models",
      caption: "August maintains a strong lead across every medical subset within MMLU.",
    },
  },
];

const paragraphClasses =
  "text-base sm:text-lg leading-relaxed text-slate-700";

export default function ClientAugustBenchmark2026Page() {
  return (
    <>
      <Navbar />
      <Box sx={{ bgcolor: "white" }}>
        <div className="container mx-auto px-4 pt-32 pb-12 sm:pb-16 max-w-[760px] box-border">
          <article className="flex flex-col gap-12 sm:gap-14 text-slate-900">
            <section className="flex flex-col gap-5">
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
                Benchmarks
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                August Scores 100% on the USMLE
              </h1>
              <p className={`${paragraphClasses} text-slate-600`}>
                August now scores a perfect 100% on the US Medical Licensing Examination. It's the
                benchmark physicians take to practice medicine in the United States, and August has
                saturated it. Two years ago,
                <a
                  href="/august-benchmark"
                  className="text-emerald-600 underline-offset-2 hover:underline ml-1"
                >
                  we scored 94.8%
                </a>
                . Today, we're sharing results from that benchmark and two others.
              </p>
            </section>

            {sections.map((section) => (
              <section key={section.title} className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
                  {section.title}
                </h2>
                {section.paragraphs.map((copy, idx) => (
                  <p key={`${section.title}-${idx}`} className={paragraphClasses}>
                    {copy}
                  </p>
                ))}
                <figure className="space-y-3 pt-2">
                  <Image
                    src={section.img.src}
                    alt={section.img.alt}
                    className="w-full rounded-2xl"
                    placeholder="empty"
                  />
                  <figcaption className="text-sm text-slate-500">
                    {section.img.caption}
                  </figcaption>
                </figure>
              </section>
            ))}

            <section className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
                What these benchmarks measure and what they don't
              </h2>
              <p className={paragraphClasses}>
                High scores on medical knowledge benchmarks are necessary but not sufficient. The USMLE,
                MedQA, and MMLU test whether an AI can reason through standardized exam questions. They
                don't test the messiness of real interactions with users around their health.
              </p>
              <p className={paragraphClasses}>
                Real patient records contain noise, irrelevant details, incomplete information,
                contradictory notes. Real medicine involves timing: when to treat, when to wait, when
                to escalate. It involves communication, uncertainty, and judgment calls that don't fit
                neatly into multiple choice.
              </p>
              <p className={paragraphClasses}>
                We've been working on deeper benchmarks that get closer to how users actually interact
                with August. In December 2024, we published{" "}
                <a
                  href="https://arxiv.org/abs/2412.12538"
                  className="text-emerald-600 underline-offset-2 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  A Scalable Approach to Benchmarking the In-Conversation Differential Diagnostic
                  Accuracy of a Health AI
                </a>
                , which describes our current approach to ensuring each interaction with August is safe
                and accurate. We've since extended this framework to cover more aspects of the
                conversation and will publish more on August's safety, accuracy, medical record handling
                and efficacy in 2026.
              </p>
            </section>

            <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-5 py-4 text-center shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
                Talk to August
              </p>
              <p className="text-lg font-semibold text-slate-900">
                Need medical answers right now?
              </p>
              <p className="text-base text-slate-700 max-w-xl">
                For instant 24/7 medical guidance, reach out to August.
              </p>
              <Link
                href="/join/wa?message=Hello%20August&utm=benchmark_bottom_cta"
                className="inline-flex w-full max-w-xs items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Talk to August
              </Link>
            </div>
          </article>
        </div>
      </Box>
      <Footer />
      <QRFloatingBanner />
    </>
  );
}
