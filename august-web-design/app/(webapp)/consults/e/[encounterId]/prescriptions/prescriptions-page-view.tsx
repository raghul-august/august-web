'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PrescriptionDetails,
  type PrescriptionMedication,
} from '@/components/prescription/prescription-details';
import {
  extractPrescribedProducts,
  listEncounterMessages,
  type ChatLog,
} from '@/services/consultations-service';
import { BeautifulLoader } from '../../../../consult/_components';

interface Props {
  encounterId: string;
}

export function PrescriptionsPageView({ encounterId }: Props) {
  const router = useRouter();
  const [logs, setLogs] = useState<ChatLog[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listEncounterMessages(encounterId);
        if (!cancelled) setLogs(data);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.error || err?.message || 'Failed to load prescriptions');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [encounterId]);

  // Walk prescription chat-log rows newest-first and pick the latest snapshot
  // that actually has products. Earlier prescription rows are superseded by
  // later ones (each carries the full state at that point in time), so only
  // the most recent one matters for the details page.
  const medications: PrescriptionMedication[] = useMemo(() => {
    if (!logs) return [];
    for (let i = logs.length - 1; i >= 0; i--) {
      const log = logs[i];
      if (log.type !== 'prescription') continue;
      const products = extractPrescribedProducts(log.metadata);
      if (products.medications.length === 0 && products.compounds.length === 0) continue;
      return [
        ...products.medications.map((m) => ({
          id: m.id ?? undefined,
          name: (m.name || m.drug_name || '').trim() || undefined,
          title:
            [m.name || m.drug_name || 'Prescription', m.strength, m.dose_form]
              .filter(Boolean)
              .join(' '),
          // Backend doesn't yet split fill state; treat the presence of a
          // pharmacy row (set when MDI confirms the e-Rx hit the pharmacy)
          // as "sent_to_pharmacy", otherwise pending.
          status: m.pharmacy ? ('sent_to_pharmacy' as const) : ('pending' as const),
          directions: m.directions ?? undefined,
          quantity: m.quantity ?? undefined,
          dispense_unit_name: m.dispense_unit ?? undefined,
          refills_total: typeof m.refills === 'number' ? m.refills : undefined,
          clinical_note: m.clinical_note ?? undefined,
        })),
        ...products.compounds.map((c) => ({
          id: c.id ?? undefined,
          name: (c.name || '').trim() || undefined,
          title: c.name || 'Compound',
          status: c.pharmacy ? ('sent_to_pharmacy' as const) : ('pending' as const),
          directions: c.directions ?? undefined,
          quantity: c.quantity ?? undefined,
          dispense_unit_name: c.dispense_unit ?? undefined,
          refills_total: typeof c.refills === 'number' ? c.refills : undefined,
          clinical_note: c.clinical_note ?? undefined,
        })),
      ];
    }
    return [];
  }, [logs]);

  if (error) {
    return (
      <div style={{ background: '#FAF9F5', minHeight: '100vh', padding: 24 }} className="text-sm text-text-secondary">
        {error}
      </div>
    );
  }

  if (!logs) {
    return <BeautifulLoader label="Loading…" fullScreen />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF9F5' }}>
      <PrescriptionDetails
        medications={medications}
        onBack={() => router.push(`/consults/e/${encounterId}`)}
      />
    </div>
  );
}
