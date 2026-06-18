'use client';

import { usePathname } from 'next/navigation';
import { SignUpModal } from './signup-modal';
import { useAuthStore } from '@/stores/auth-store';
import { useIsWebview } from '@/hooks/use-webview';
import { toolIdForPath, TOOLS_BY_ID } from '@/lib/tools';

/**
 * Single source of truth for gating an inline tool behind sign-in. Replaces the
 * copy-pasted `{cond && isAnonymous && !isWebview && <SignUpModal .../>}` block.
 *
 * - Gates only when the tool's `requiresAuth` meta flag is true (kill-switch).
 * - Eligibility (`isAnonymous`/`isWebview`) is read from already-hydrated state;
 *   `ToolLayout` kicks off `initializeAuth()` on page load so it's settled by the
 *   time results render.
 * - The modal is non-dismissable (SignUpModal defaults `dismissible=false`); its
 *   blurred backdrop obscures the results behind it.
 *
 * `active` is the tool's own "results are ready" signal.
 */
export function ToolAuthGate({ active }: { active: boolean }) {
  const pathname = usePathname();
  const isAnonymous = useAuthStore((s) => s.isAnonymous);
  const isWebview = useIsWebview();

  const id = toolIdForPath(pathname);
  const requiresAuth = id ? TOOLS_BY_ID[id].requiresAuth : false;

  if (!(active && requiresAuth && isAnonymous && !isWebview)) return null;
  return <SignUpModal />;
}
