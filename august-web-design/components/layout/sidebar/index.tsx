'use client';

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useI18n } from '@/components/providers';
import { track } from '@/services/analytics-service';
import { trackClevertap } from '@/utils/clevertap';
import type { SidebarProps } from './constants';
import { SidebarContent } from './sidebar-content';
import { DesktopExpandedSidebar } from './desktop-expanded-sidebar';

export type { SidebarProps } from './constants';

export function Sidebar({ open, onOpenChange, textSize, onTextSizeChange }: SidebarProps) {
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Mark as hydrated after mount for CSS transition
  useEffect(() => {
    setHydrated(true);
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      track('side_menu_open');
      trackClevertap('Menu button clicked', { page: 'chat' });
    } else {
      track('side_menu_close');
    }
    onOpenChange(nextOpen);
  };

  const handleToggleCollapse = () => {
    setCollapsed((prev) => !prev);
    track('sidebar_collapse_toggle', { collapsed: !collapsed });
  };

  return (
    <>
      {/* Desktop sidebar - always visible on screens lg+ */}
      {collapsed ? (
        <aside className={`hidden lg:flex w-16 h-full flex-col bg-white border-r border-gray-200 shrink-0 ${hydrated ? 'transition-all duration-200' : ''}`}>
          <SidebarContent textSize={textSize} onTextSizeChange={onTextSizeChange} collapsed={collapsed} onToggleCollapse={handleToggleCollapse} />
        </aside>
      ) : (
        <DesktopExpandedSidebar onToggleCollapse={handleToggleCollapse} hydrated={hydrated} />
      )}

      {/* Mobile/tablet sheet sidebar - only visible below lg */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <SheetTitle className="sr-only">{t('common.menu')}</SheetTitle>
            <SheetDescription className="sr-only">
              {t('common.menu')}
            </SheetDescription>
            <SidebarContent onClose={() => onOpenChange(false)} textSize={textSize} onTextSizeChange={onTextSizeChange} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
