import { trackTelehealth } from "@/services/telehealth-analytics";
import { track as trackMeta } from "@/app/utils/analytics";

export function trackTelehealthStart(href: string, copy: string, location: string): void {
  trackTelehealth("cta_clicked", { copy, location, destination: href });
  trackMeta("telehealth_start", {
    from_path: window.location.pathname,
    to_path: href,
  });
}
