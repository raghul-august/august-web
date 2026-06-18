// Chat lives in-repo at /chat — no external env var indirection needed.
// `openAugustChat` stays in the same tab via relative-URL navigation.

export const AUGUST_LANDING_URL = "https://www.meetaugust.ai";

export function openAugustChat(message: string): void {
  window.open(`/chat?msg=${encodeURIComponent(message)}`, "_self");
}

export function getQuizUrl(toolSlug: string): string {
  return `${AUGUST_LANDING_URL}/tool/${toolSlug}`;
}
