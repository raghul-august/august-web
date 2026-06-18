import { Inter } from "next/font/google";
import ClientProviders from "@/app/components/ClientProviders";
import QRFloatingBanner from "@/app/components/QRFloatingBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export default function ImportMemoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClientProviders>
      <div className={inter.variable}>
        {children}
        <QRFloatingBanner />
      </div>
    </ClientProviders>
  );
}
