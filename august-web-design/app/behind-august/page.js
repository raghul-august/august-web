'use client';
import { MDXComponents } from "@/app/components/MDXComponents";
import AugustBenchmark from "./behind-august.mdx";
import { Navbar } from "@/app/components/website/Navbar";
import { Footer } from "@/app/components/website/Footer";
import QRFloatingBanner from "@/app/components/QRFloatingBanner";
import { Box } from "@mui/material";

export default function AugustBenchmarkPage() {
  return (
    <>
      <Navbar />
      <Box sx={{ bgcolor: 'white', }}>
        <div className="container mx-auto px-4 pt-32 pb-12 max-w-[730px] box-border">
          <AugustBenchmark components={MDXComponents} />
        </div>
      </Box>
      <Footer />
      <QRFloatingBanner />
    </>
  );
}
