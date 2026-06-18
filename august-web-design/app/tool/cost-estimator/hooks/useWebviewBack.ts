import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function useWebviewBack(onExit?: () => void) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isWebview = searchParams.get("source") === "webview";

  useEffect(() => {
    if (!isWebview) return;

    const handler = (e: MessageEvent) => {
      let data;

      try {
        data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }

      if (data?.type !== "NAVIGATION" || data?.action !== "BACK") return;

      if (onExit) onExit();
      else router.back();
    };

    // 🔥 Listen to BOTH
    window.addEventListener("message", handler);
    document.addEventListener("message", handler as any);

    return () => {
      window.removeEventListener("message", handler);
      document.removeEventListener("message", handler as any);
    };
  }, [isWebview, onExit, router]);

  return isWebview;
}