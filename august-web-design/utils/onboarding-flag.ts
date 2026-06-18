/**
 * "User has finished EHR onboarding" signal.
 *
 * Server-authoritative and cross-device: the truth is the
 * `ehr_onboarding_complete` flag the backend returns on get-persons,
 * captured into the EHR store (`ehrOnboardingComplete`) by fetchPersons.
 * It goes true once the user engages with EHR (connects a provider,
 * uploads a report, or creates a profile) and stays true permanently.
 *
 * This used to be a per-browser localStorage flag; reads now hit the
 * store so a user who onboarded on one device isn't re-prompted on
 * another. The `userId` params are kept only so call sites stay
 * unchanged — the store already scopes to the current user.
 */
import { useEhrStore } from '@/stores/ehr-store';

export function isOnboardingComplete(_userId?: string | undefined): boolean {
  return useEhrStore.getState().ehrOnboardingComplete;
}

export function markOnboardingComplete(_userId?: string | undefined): void {
  // Optimistic flip for instant UX (e.g. wizard Done). The next
  // get-persons confirms it server-side.
  useEhrStore.getState().markEhrOnboardingComplete();
}
