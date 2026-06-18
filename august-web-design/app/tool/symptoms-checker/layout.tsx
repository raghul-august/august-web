import { ChatAppProviders } from "@/app/components/chat-app-providers";
import "@/app/chat-app.css";
import "@/app/globals.css";
import "@/app/styles/tool-tokens.css";
import "@/app/styles/tool-shared.css";
import "@/app/components/tool/symptoms-checker/symptoms-checker.css";
import { SymptomsCheckerShell } from "./shell";

export default function SymptomsCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatAppProviders>
      <SymptomsCheckerShell>{children}</SymptomsCheckerShell>
    </ChatAppProviders>
  );
}
