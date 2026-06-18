import { useCallback, useRef, useState } from 'react';
import { ProfileGate } from '@/components/ehr';
import { useAuthStore } from '@/stores/auth-store';
import { useEhrStore } from '@/stores/ehr-store';

/**
 * Imperative gate for ingest CTAs (Connect, Upload) that need a
 * complete self profile (name + sex). Returns a promise that resolves
 * `true` when the profile is already complete OR the user saves through
 * the modal, and `false` when the user cancels.
 *
 * Mount the returned `gate` element once in the consuming page so the
 * modal has a DOM home. Both the shell and the records page reach for
 * this hook independently — each page mounts its own gate but reads the
 * same persons slice from the store, so a profile saved through one
 * resolves the other's `awaitProfile` calls immediately on next call.
 */
export function useProfileGate() {
  const persons = useEhrStore(s => s.persons);
  const { user } = useAuthStore();
  const userId = (user?.id ?? (user as Record<string, unknown> | undefined)?.userId) as string | undefined;

  const [open, setOpen] = useState(false);
  // Resolver of the pending awaitProfile() promise. Captured by
  // `awaitProfile` and consumed by onClose / onSaved so the caller
  // unblocks with the correct boolean.
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);

  const awaitProfile = useCallback((): Promise<boolean> => {
    const self = userId ? persons.find(p => p.person_id === userId) : undefined;
    const ready = !!self?.name?.trim() && !!self?.sex?.trim();
    if (ready) return Promise.resolve(true);
    return new Promise<boolean>(resolve => {
      // If a previous gate is somehow still pending (shouldn't happen —
      // the modal blocks the UI) cancel it before overwriting so the
      // prior caller doesn't hang.
      resolverRef.current?.(false);
      resolverRef.current = resolve;
      setOpen(true);
    });
  }, [persons, userId]);

  const settle = useCallback((ok: boolean) => {
    setOpen(false);
    const resolve = resolverRef.current;
    resolverRef.current = null;
    resolve?.(ok);
  }, []);

  const gate = (
    <ProfileGate
      open={open}
      onClose={() => settle(false)}
      onSaved={() => settle(true)}
    />
  );

  return { awaitProfile, gate };
}
