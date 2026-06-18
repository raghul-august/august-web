export const CHAT_HREF = "/chat?anon_telehealth=true";

export function chatHrefWithMessage(message: string): string {
  const text = message.trim();
  return text ? `${CHAT_HREF}&msg=${encodeURIComponent(text)}` : CHAT_HREF;
}
const ASSET_BASE = "https://assets.getbeyondhealth.com/telehealth-landing";
const SHARED_ASSET_BASE = "https://assets.getbeyondhealth.com/telehealth";

export function asset(name: string): string {
  return `${ASSET_BASE}/${name}`;
}

export function sharedAsset(name: string): string {
  return `${SHARED_ASSET_BASE}/${name}`;
}
