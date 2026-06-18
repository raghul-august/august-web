'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { PersonInfo, FastenBootstrap, FastenConnectionEvent } from '@/types/ehr';
import { useAuthStore } from '@/stores/auth-store';
import { useEhrStore } from '@/stores/ehr-store';
import { getFastenBootstrap, postFastenConnection } from '@/services/ehr-service';
import { FastenConnectWidget } from '@/components/ehr/fasten-connect-widget';
import { avatarInitials } from '@/components/ehr/health-dashboard/utils';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import type { FooterState } from './onboarding-wizard';

/**
 * Embedded Fasten widget within the onboarding wizard — same call
 * pattern the production landing flow uses (`getFastenBootstrap` →
 * iframe → `postFastenConnection` on connection_success), just mounted
 * inline inside the wizard's sub-screen instead of in a top-level
 * modal. The widget chrome (iframe) becomes the sub-screen content;
 * the wizard's sticky footer carries the Next CTA.
 */
export function ConnectSubScreen({
  personId,
  persons,
  onFooterChange,
  onConnected,
  onConnectionStarted,
}: {
  personId: string;
  persons: PersonInfo[];
  onFooterChange: (footer: FooterState) => void;
  /** Fired after a successful connection event has been posted to the
   *  backend. Returns the user to the records grid. */
  onConnected: () => void;
  /** Fired right after the connection POST returns, with the Fasten
   *  org_connection_id. Wizard plumbs this up to the shell so the
   *  existing /fasten/status polling can drive a real syncing view
   *  when the wizard closes (sync is ~60s; we don't want the user
   *  landing in an empty workspace mid-sync). */
  onConnectionStarted?: (event: FastenConnectionEvent & { event_type?: string }) => void;
}) {
  const { user } = useAuthStore();
  const userId = (user?.id ?? (user as Record<string, unknown> | undefined)?.userId) as string | undefined;
  const resetEhr = useEhrStore(s => s.resetEhr);

  const person = persons.find(p => p.person_id === personId);
  const isSelf = personId === userId;
  const personName = person?.name || (isSelf ? 'You' : person?.relationship) || 'this profile';
  const tone = isSelf ? '#206E55' : (person?.color || '#C44D6A');

  const [bootstrap, setBootstrap] = useState<FastenBootstrap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectedBrand, setConnectedBrand] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // No in-effect reset of bootstrap/error here — parent passes
    // `key={personId}` so this component remounts (and useState's
    // initializer fires) whenever the target person changes.
    const apiPersonId = isSelf ? undefined : personId;
    getFastenBootstrap(apiPersonId)
      .then(b => { if (!cancelled) setBootstrap(b); })
      .catch(err => {
        if (cancelled) return;
        logger.error('[Onboarding] Fasten bootstrap failed', serializeError(err));
        setError('Could not load the connection widget. Please try again.');
      });
    return () => { cancelled = true; };
  }, [personId, isSelf]);

  const handleFastenEvent = async (event: unknown) => {
    const evt = event as FastenConnectionEvent & { event_type?: string };
    const isConnectionSuccess =
      evt.event_type === 'patient.connection_success' || evt.type === 'patient.connection_success';
    if (!isConnectionSuccess) return;
    try {
      await postFastenConnection({ ...evt, person_id: bootstrap?.personId || undefined });
      // Drop the cached EHR slice so the next fetch picks up the new
      // provider's data instead of returning the stale cached version.
      resetEhr();
      setConnectedBrand(evt.brand_name || 'Provider');
      // Hand the connection id up so the shell can drive its existing
      // /fasten/status polling when the wizard closes. Without this,
      // the user lands in an empty workspace mid-sync.
      if (evt.org_connection_id && onConnectionStarted) {
        onConnectionStarted(evt);
      }
    } catch (err) {
      logger.error('[Onboarding] Fasten postConnection failed', serializeError(err));
      setError('Connected, but we could not save it. Please try again.');
    }
  };

  // Footer: disabled "Next →" until a connection event fires; then
  // enable so the user can return to the records grid.
  const onFooterChangeRef = useRef(onFooterChange);
  const onConnectedRef = useRef(onConnected);
  useEffect(() => { onFooterChangeRef.current = onFooterChange; }, [onFooterChange]);
  useEffect(() => { onConnectedRef.current = onConnected; }, [onConnected]);
  useEffect(() => {
    onFooterChangeRef.current({
      label: 'Next →',
      disabled: !connectedBrand,
      onClick: connectedBrand ? () => onConnectedRef.current() : undefined,
    });
  }, [connectedBrand]);

  return (
    <div className="max-w-[640px] mx-auto">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold text-white"
          style={{ background: tone }}
        >
          {avatarInitials(personName)}
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7370]">Connecting for</p>
          <p className="text-[18px] font-semibold text-[#1A1E1C]">{personName}</p>
        </div>
      </div>
      <h2 className="mt-8 font-serif text-[28px] leading-tight text-[#1A1E1C]">Connect their provider.</h2>
      <p className="mt-2 text-[13px] text-[#6B7370]">
        Search 12,000+ hospitals and clinics, then sign in to authorize a secure pull.
      </p>

      {/* Embedded Fasten widget panel */}
      {connectedBrand ? (
        <div className="mt-6 p-5 rounded-2xl border border-[#206E55]/30 bg-[#F0F7F4] text-center">
          <p className="text-[14px] font-semibold text-[#1A1E1C]">{connectedBrand} connected</p>
          <p className="mt-1 text-[12px] text-[#6B7370]">We&rsquo;ll pull their records in the background.</p>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-[#ECEEED] bg-white overflow-hidden shadow-sm" style={{ height: 520 }}>
          {error && (
            <div className="flex items-center justify-center h-full p-6 text-center">
              <p className="text-[13px] text-[#C44040]">{error}</p>
            </div>
          )}
          {!error && !bootstrap && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-5 w-5 animate-spin text-[#206E55]" />
            </div>
          )}
          {!error && bootstrap && (
            <FastenConnectWidget
              publicId={bootstrap.customerPublicId}
              externalId={bootstrap.externalId}
              externalState={bootstrap.externalState}
              onEventBus={handleFastenEvent}
            />
          )}
        </div>
      )}
    </div>
  );
}
