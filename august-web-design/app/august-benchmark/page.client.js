'use client';

import Link from "next/link";
import { MDXComponents } from "@/app/components/MDXComponents";
import AugustBenchmark from "./august-benchmark.mdx";
import { Navbar } from "@/app/components/website/Navbar";
import { Footer } from "@/app/components/website/Footer";
import QRFloatingBanner from "@/app/components/QRFloatingBanner";
import { Box } from "@mui/material";

export default function ClientAugustBenchmarkPage() {
  return (
    <>
      <Navbar />
      <Box sx={{ bgcolor: "white" }}>
        <div className="container mx-auto px-4 pt-32 pb-12 max-w-[730px] box-border">
          <Link
            href="/august-benchmark-2026"
            className="group mb-10 flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/90 px-5 py-5 text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-white sm:flex-row sm:items-center sm:gap-6"
          >
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                New benchmark
              </p>
              <p className="text-base font-medium text-slate-800 sm:text-lg">
                Review the 2026 benchmark where August delivers a perfect USMLE score.
              </p>
            </div>
            <span className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition group-hover:bg-emerald-500 sm:w-auto sm:min-w-[200px]">
              View 2026 results
              <span aria-hidden className="ml-2 text-base">↗</span>
            </span>
          </Link>
          <AugustBenchmark components={MDXComponents} />
          <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl bg-white px-5 py-4 text-center shadow-sm">
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
        </div>
      </Box>
      <Footer />
      <QRFloatingBanner />
    </>
  );
}
