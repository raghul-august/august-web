export function careHref(label: string): string {
  return `/chat?anon_telehealth=true&msg=${encodeURIComponent(`Need treatment for ${label}`)}`;
}

// Used when no specific condition is chosen (card-level "Start here" or the card itself).
export const GENERIC_CARE_HREF = `/chat?anon_telehealth=true&msg=${encodeURIComponent("Need urgent care for my health condition")}`;
