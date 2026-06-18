'use client';

import { useState } from 'react';
import { useEhrStore } from '@/stores/ehr-store';
import { useAuthStore } from '@/stores/auth-store';
import { getPersons, updatePerson } from '@/services/person-service';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import { ProfileSetupModal } from './profile-setup-modal';

/**
 * Controlled self-profile modal. Caller decides when to open it — typically
 * before an ingest action (Connect Fasten provider, upload reports) that
 * needs `self.name` + `self.sex` to be set so uploaded reports attribute to
 * the right person and biomarker ranges resolve to the right cohort.
 *
 * The modal is dismissable: closing without saving cancels the caller's
 * pending action. Saving runs the existing self-profile update chain
 * (getPersons → updatePerson → fetchPersons) and fires `onSaved` so the
 * caller can resume.
 */
export function ProfileGate({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const { user } = useAuthStore();
  const userId = (user?.id ?? (user as Record<string, unknown> | null)?.userId) as string | undefined;
  const persons = useEhrStore(s => s.persons);
  const fetchPersons = useEhrStore(s => s.fetchPersons);
  const [saving, setSaving] = useState(false);

  const self = userId ? persons.find(p => p.person_id === userId) : undefined;

  return (
    <ProfileSetupModal
      open={open}
      mode="self-required"
      dismissable
      initial={{
        name: self?.name || '',
        age: self?.age || '',
        sex: self?.sex || '',
      }}
      onClose={onClose}
      onSubmit={async (values) => {
        if (saving || !userId) return;
        setSaving(true);
        try {
          // The store normalizes the self person row's id to userId for
          // EHR provider/page filtering (see fetchPersons in ehr-store)
          // but the backend row keeps its own UUID. Hit getPersons raw
          // here to recover the actual id so the PATCH lands on the
          // right row instead of silently no-op'ing.
          const { persons: raw } = await getPersons();
          const rawSelf = raw.find(p => p.relationship === 'self');
          const targetId = rawSelf?.person_id || userId;
          await updatePerson({
            personId: targetId,
            givenName: values.name,
            age: values.age || undefined,
            sex: values.sex,
          });
          await fetchPersons(userId);
          onSaved?.();
        } catch (err) {
          logger.error('[ProfileGate] Failed to save self profile', serializeError(err));
          throw err;
        } finally {
          setSaving(false);
        }
      }}
    />
  );
}
