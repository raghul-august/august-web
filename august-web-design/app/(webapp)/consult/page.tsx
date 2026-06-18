'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Legacy entry point — the pre-payment flow lives at
// `/consults/d/<differential_diagnosis_id>`. Forward old links that still
// carry a dd_id; everything else falls back to the consults list.
export default function ConsultLegacyEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ddId = searchParams.get('dd_id') ?? searchParams.get('differential_diagnosis_id');
    router.replace(ddId ? `/consults/d/${ddId}` : '/consults');
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">
      Redirecting…
    </div>
  );
}
