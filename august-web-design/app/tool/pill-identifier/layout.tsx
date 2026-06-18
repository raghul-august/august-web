import { ChatAppProviders } from "@/app/components/chat-app-providers";
import "@/app/chat-app.css";
import "@/app/globals.css";
import "@/app/styles/tool-tokens.css";
import "@/app/styles/tool-shared.css";
import "@/app/components/tool/pill-identifier/pill-identifier.css";
import { PillIdentifierShell } from "./shell";

export default function PillIdentifierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatAppProviders>
      <PillIdentifierShell>{children}</PillIdentifierShell>
    </ChatAppProviders>
  );
}
