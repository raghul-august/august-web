"use client";

import { useEffect } from "react";
import "@/app/chat-app.css";
import "@/app/globals.css";
import "@/app/styles/tool-tokens.css";
import "@/app/styles/tool-shared.css";
import { ChatAppProviders } from "@/app/components/chat-app-providers";
import ClientProviders from "@/app/components/ClientProviders";
import QRFloatingBanner from "@/app/components/QRFloatingBanner";
import { AppShell, useAppShellSidebar } from "@/components/layout/app-shell";
import { Navbar } from "@/components/layout/navbar";
import { TurnstileLoader } from "@/components/turnstile-loader";
import { initializeLocation } from "@/services/location-service";
import { initializeAuth } from "@/services/auth-service";

export type ToolCategory = "quiz" | "calculator";

interface ToolLayoutProps {
  children: React.ReactNode;
  category: ToolCategory;
}

// Inline so the navbar scrolls with content (matches symptoms-checker); the
// AppShell's own Navbar slot is suppressed via renderNavbar={() => null}.
function InlineNavbar() {
  const { openSidebar } = useAppShellSidebar();
  return <Navbar onMenuClick={openSidebar} />;
}

export default function ToolLayout({ children, category }: ToolLayoutProps) {
  useEffect(() => {
    initializeLocation().then(() => initializeAuth()).catch(() => {});
  }, []);

  return (
    <ChatAppProviders>
      <AppShell webviewExitSource="tools" renderNavbar={() => null}>
        <ClientProviders>
          <TurnstileLoader />
          <div data-tool-category={category}>
            <InlineNavbar />
            {children}
            <QRFloatingBanner />
          </div>
        </ClientProviders>
      </AppShell>
    </ChatAppProviders>
  );
}
