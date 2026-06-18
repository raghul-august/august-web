import type { Metadata, Viewport } from "next";
import { getImageProps } from "next/image";
import { ChatAppProviders } from "@/app/components/chat-app-providers";
import { ClarityUserSync } from "@/components/clarity-user-sync";
import { CleverTapInit } from "@/components/clevertap-init";
import { MarketingAttributionInit } from "@/components/marketing-attribution-init";
import "@/app/chat-app.css";

export const metadata: Metadata = {
  title: "August",
  description: "Your AI Health Companion",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "August",
  },
  icons: {
    apple: "/icons/favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#206E55",
  viewportFit: "cover",
};

// Preload the signup modal hero image.
export default function WebappLayout({ children }: { children: React.ReactNode }) {
  const { props: { srcSet, sizes } } = getImageProps({
    src: "/assets/modal-signup.png",
    alt: "",
    width: 500,
    height: 275,
    sizes: "(max-width: 768px) 100vw, 500px",
  });

  return (
    <ChatAppProviders>
      <link
        rel="preload"
        as="image"
        imageSrcSet={srcSet}
        imageSizes={sizes}
        fetchPriority="high"
      />
      {/* Microsoft Clarity is loaded once sitewide from app/layout.js.
          Here we just sync the user identity to the single Clarity project. */}
      <ClarityUserSync />
      <CleverTapInit />
      <MarketingAttributionInit />
      {children}
    </ChatAppProviders>
  );
}
