import { sendGAEvent } from '@next/third-parties/google'

export function track(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  // Default params to empty object if undefined
  sendGAEvent('event', eventName, params || {});
}