'use client';

import { usePathname } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Navbar } from '@/components/layout/navbar';

export function ExploreShell({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isViewPage = pathname?.startsWith('/explore/view') ?? false;

  return (
    <AppShell
      background={isViewPage ? 'white' : 'var(--background)'}
      className={`${className} explore-layout`}
      webviewExitSource="explore"
      renderNavbar={({ openSidebar }) => (
        <div
          className={`shrink-0 ${
            isViewPage ? 'view-navbar-wrapper' : 'explore-navbar-wrapper'
          }`}
        >
          <Navbar
            onMenuClick={openSidebar}
            showBackButton={isViewPage}
            backButtonLabel="Library"
          />
        </div>
      )}
    >
      {children}
    </AppShell>
  );
}
