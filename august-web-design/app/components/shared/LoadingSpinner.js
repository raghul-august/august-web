'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function LoadingSpinnerInner() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Set loading true immediately when navigation starts
    setLoading(true);

    // Reset loading state when navigation is complete
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 100); // Very small delay to ensure loading state is visible

    return () => {
      clearTimeout(timeoutId);
      setLoading(false);
    };
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-white/70 rounded-lg p-6 shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500"></div>
      </div>
    </div>
  );
}

export default function LoadingSpinner() {
  return (
    <Suspense fallback={null}>
      <LoadingSpinnerInner />
    </Suspense>
  );
}
