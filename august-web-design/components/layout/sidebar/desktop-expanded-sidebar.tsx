'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { logout } from '@/services/auth-service';
import { useChatStore } from '@/stores/chat-store';
import { useAuthStore } from '@/stores/auth-store';
import { useEhrStore } from '@/stores/ehr-store';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import { useI18n } from '@/components/providers';
import { track } from '@/services/analytics-service';
import { trackTelehealth } from '@/services/telehealth-analytics';
import { trackClevertap } from '@/utils/clevertap';
import { getLocationInfo } from '@/services/location-service';
import { useLocation } from '@/components/providers/location-provider';
import { AccountBottomSheet } from '@/components/account';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { InstallGuide } from '@/components/pwa';
import { PanelLeft, LayoutGrid } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { useLoginModalStore } from '@/stores/login-modal-store';
import { useAccountSheetStore } from '@/stores/account-sheet-store';
import { useNewConsultModalStore } from '@/stores/new-consult-modal-store';
import { prefetchConsult } from '@/utils/encounter-prefetch';
import { getUserData, type UserData } from '@/services/user-service';
import { ChatDotsIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { NAV_OPTIONS, type NavOptionId } from './constants';
import { resolveActiveNavId, formatRelativeShort } from './utils';
import { useSidebarConsults } from './use-sidebar-consults';
import { AugustLogo, AccountProfileIcon } from './icons';
import { DownloadModal } from './download-modal';
import { EhrSubNav } from './ehr-sub-nav';

/* ============================================================
 * DesktopExpandedSidebar — new design (desktop, expanded only).
 * Mobile sheet and collapsed desktop continue to use SidebarContent.
 * ========================================================== */

export function DesktopExpandedSidebar({ onToggleCollapse, hydrated }: { onToggleCollapse: () => void; hydrated: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();
  const { isAnonymous, isAuthenticated } = useAuthStore();
  // Subscribe to providers + recentlyUploadedFor directly so the EHR sub-nav
  // re-renders the instant the selected person gets data (see SidebarContent).
  const selectedPersonHasEhrData = useEhrStore((s) => {
    if (!s.selectedPersonId) return false;
    return (
      s.providers.some((p) => p.personId === s.selectedPersonId) ||
      !!s.recentlyUploadedFor[s.selectedPersonId]
    );
  });
  const [authHydrated, setAuthHydrated] = useState(false);
  useEffect(() => { setAuthHydrated(true); }, []);
  const { isInitialized } = useLocation();
  const isUS = isInitialized && getLocationInfo()?.countryCode === 'US';

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadOption, setDownloadOption] = useState<NavOptionId>('chat');
  const isAccountSheetOpen = useAccountSheetStore((s) => s.isOpen);
  const setIsAccountSheetOpen = useAccountSheetStore((s) => s.setOpen);
  const showSidebarEmptyConsultAction = useNewConsultModalStore((s) => s.showSidebarEmptyAction);
  const showSidebarConsultAction = useNewConsultModalStore((s) => s.showSidebarAction);
  const [user, setUser] = useState<UserData | null>(null);
  const { showGuide, dismissGuide, platform } = usePwaInstall();

  const {
    consults,
    sortedConsults,
    activeConsultId,
  } = useSidebarConsults();

  useEffect(() => {
    if (!isAuthenticated) { setUser(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const u = await getUserData();
        if (!cancelled) setUser(u);
      } catch { }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const activeNavId: NavOptionId = resolveActiveNavId(pathname);
  const consultsExpanded = consults.length > 0;

  const handleLogout = async () => {
    try {
      await logout();
      useChatStore.getState().reset();
      // Clear identity-scoped EHR state (persons, selectedPersonId,
      // ehrOnboardingComplete) so a different account logging in this tab
      // doesn't inherit it from the in-memory store.
      useEhrStore.getState().reset();
      track('user_logout');
      router.push('/chat');
    } catch (error) {
      logger.error('Logout failed', serializeError(error));
    }
  };

  const handleNavClick = (id: NavOptionId) => {
    if (id === 'chat') { router.push('/chat'); return; }
    if (id === 'consults') {
      // No navigation — the consults dropdown + "View all consults" link
      // is rendered directly below this row. /consults is only reached via
      // that link.
      track('consults_tapped');
      trackTelehealth('consult_doctor_menu_group_clicked');
      trackClevertap('Sidebar Navigation Selected', { destination: 'consults' });
      if (consults.length === 0) {
        showSidebarConsultAction();
      }
      return;
    }
    if (id === 'explore') {
      track('explore_tapped');
      trackClevertap('Sidebar Navigation Selected', { destination: 'discover' });
      router.push('/explore');
      return;
    }
    if (id === 'nutrition') {
      track('nutrition_tapped');
      trackClevertap('Sidebar Navigation Selected', { destination: 'nutrition' });
    }
    if (id === 'ehr') {
      track('ehr_tapped');
      trackClevertap('Sidebar Navigation Selected', { destination: 'ehr' });
      router.push('/ehr');
      return;
    }
    setDownloadOption(id);
    setShowDownloadModal(true);
  };

  const handleNewConsultClick = () => {
    trackTelehealth('new_consult_clicked');
    if (pathname !== '/chat') router.push('/chat');
    useNewConsultModalStore.getState().open();
  };

  const displayName = user?.displayName || user?.name || (isAnonymous ? 'August User' : '');

  const navItems: Array<{ id: NavOptionId; label: string; Icon: React.ComponentType<{ selected?: boolean }> }> =
    useMemo(() => NAV_OPTIONS.filter((option) => isUS || !option.isUSOnly).map((option) => ({
      id: option.id,
      label: t(option.labelKey, { defaultValue: option.defaultLabel }),
      Icon: option.icon,
    })), [isUS, t]);

  return (
    <>
      <aside
        className={`hidden lg:flex h-full flex-col shrink-0 ${hydrated ? 'transition-all duration-200' : ''}`}
        style={{ width: 288, background: '#FAF9F5', borderRight: '0.5px solid #D1CDC2' }}
      >
        {/* Top section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '14px 16px 24px', flex: 1, minHeight: 0, overflowY: 'auto' }} className="hide-scrollbar">
          <style jsx global>{`
            .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
            .hide-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
          `}</style>

          {/* Header: logo + collapse */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 56 }}>
            <div style={{ display: 'flex', alignItems: 'center', paddingTop: 4 }}>
              <AugustLogo />
            </div>
            <Tooltip content={t('sidebar.tooltips.hideFullMenu')} position="right">
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Collapse sidebar"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <PanelLeft size={24} strokeWidth={1.5} color="#5A554A" />
              </button>
            </Tooltip>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {navItems.map((item) => {
              const isActive =
                item.id === activeNavId &&
                !(item.id === 'consults' && activeConsultId);
              const isConsultsRow = item.id === 'consults';
              const showSubItems = isConsultsRow && consultsExpanded && hydrated;
              const showInlineNewConsult = isConsultsRow && consults.length > 0;

              return (
                <React.Fragment key={item.id}>
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: showInlineNewConsult ? '12px 44px 12px 8px' : '12px 8px',
                        height: 48,
                        borderRadius: 12,
                        background: isActive ? '#F3F1EB' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = '#F3F1EB'; }}
                      onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                    >
                      <span style={{ display: 'inline-flex', width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                        <item.Icon selected={isActive} />
                      </span>
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: 15,
                          lineHeight: '24px',
                          color: isActive ? '#141515' : '#7A7468',
                        }}
                      >
                        {item.label}
                      </span>
                    </button>
                    {showInlineNewConsult && (
                      <div
                        style={{
                          position: 'absolute',
                          right: 4,
                          top: '50%',
                          transform: 'translateY(-50%)',
                        }}
                      >
                        <Tooltip content="New Consult" position="right">
                          <button
                            type="button"
                            onClick={handleNewConsultClick}
                            aria-label="New Consult"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 36,
                              height: 36,
                              borderRadius: 8,
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#EDEBE5'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                          >
                            <PlusCircleIcon size={20} color="#5A554A" />
                          </button>
                        </Tooltip>
                      </div>
                    )}
                  </div>

                  {item.id === 'ehr' && isActive && selectedPersonHasEhrData && (
                    <EhrSubNav />
                  )}

                  {showSubItems && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 44 }}>
                      {sortedConsults.slice(0, 2).map((c) => {
                        const isActiveConsult = c.id === activeConsultId;
                        const topic = c.visit_reason || 'Online doctor consult';
                        const doctorRaw = (() => {
                          const first = (c.clinician_first_name || '').trim();
                          const last = (c.clinician_last_name || '').trim();
                          const suffix = (c.clinician_suffix || '').trim();
                          const name = [first, last].filter(Boolean).join(' ');
                          if (!name) return 'Awaiting doctor';
                          return suffix ? `${name}, ${suffix}` : name;
                        })();
                        const date = formatRelativeShort(c.created_at);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              trackTelehealth('consult_doctor_child_menu_clicked');
                              router.push(`/consults/e/${c.id}`);
                            }}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              padding: 12,
                              borderRadius: 12,
                              background: isActiveConsult ? '#F3F1EB' : 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              textAlign: 'left',
                              width: '100%',
                            }}
                            onMouseEnter={(e) => {
                              prefetchConsult(c);
                              if (!isActiveConsult) (e.currentTarget as HTMLButtonElement).style.background = '#F3F1EB';
                            }}
                            onFocus={() => prefetchConsult(c)}
                            onTouchStart={() => prefetchConsult(c)}
                            onMouseLeave={(e) => { if (!isActiveConsult) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
                              <span
                                style={{
                                  fontFamily: 'Inter, sans-serif',
                                  fontWeight: 500,
                                  fontSize: 15,
                                  lineHeight: '24px',
                                  color: isActiveConsult ? '#141515' : '#5A554A',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {topic}
                              </span>
                              <span
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  minWidth: 0,
                                  fontFamily: 'Inter, sans-serif',
                                  fontWeight: 400,
                                  fontSize: 13,
                                  lineHeight: '20px',
                                  color: isActiveConsult ? '#5A554A' : '#7A7468',
                                }}
                              >
                                <span
                                  style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    minWidth: 0,
                                  }}
                                >
                                  {doctorRaw}
                                </span>
                                <span style={{ flexShrink: 0 }}>· {date}</span>
                              </span>
                            </div>
                            {c.has_unread && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '2px 4px',
                                  background: '#E8F2ED',
                                  border: '0.5px solid #206E55',
                                  borderRadius: 4,
                                  flexShrink: 0,
                                  marginLeft: 8,
                                }}
                              >
                                <ChatDotsIcon size={10} color="#206E55" />
                                <span
                                  style={{
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: 400,
                                    fontSize: 12,
                                    lineHeight: '16px',
                                    color: '#206E55',
                                  }}
                                >
                                  New
                                </span>
                              </span>
                            )}
                          </button>
                        );
                      })}

                      {sortedConsults.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            trackTelehealth('view_all_consults_clicked');
                            router.push('/consults');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            padding: '0 12px',
                            height: 24,
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 400,
                              fontSize: 13,
                              lineHeight: '20px',
                              color: '#5A554A',
                            }}
                          >
                            View all
                          </span>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 3l4 4-4 4" stroke="#5A554A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}

                  {isConsultsRow && consults.length === 0 && showSidebarEmptyConsultAction && (
                    <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 44 }}>
                      <button
                        type="button"
                        onClick={handleNewConsultClick}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 12px',
                          borderRadius: 12,
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F3F1EB'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                      >
                        <PlusCircleIcon size={18} color="#A8A39A" />
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: 13,
                            lineHeight: '20px',
                            color: '#A8A39A',
                          }}
                        >
                          New Consult
                        </span>
                      </button>
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {isUS && (() => {
              const isSelected = activeNavId === 'all-tools';
              return (
                <button
                  type="button"
                  onClick={() => {
                    track('all_tools_tapped');
                    trackClevertap('Sidebar Navigation Selected', { destination: 'all-tools' });
                    router.push('/tool');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 8px',
                    height: 48,
                    borderRadius: 12,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F3F1EB'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <span style={{ display: 'inline-flex', width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                    <LayoutGrid size={22} color={isSelected ? '#206E55' : '#5A554A'} strokeWidth={1.5} aria-hidden />
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: 15,
                      lineHeight: '24px',
                      color: isSelected ? '#141515' : '#5A554A',
                    }}
                  >
                    Tools
                  </span>
                </button>
              );
            })()}
          </nav>

          {authHydrated && !isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                track('webapp_login', { source: 'side_menu' });
                useLoginModalStore.getState().open();
              }}
              className="w-full rounded-full bg-[#206E55] px-4 py-3 text-center text-base font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
            >
              {t('common.login', { defaultValue: 'Log in' })}
            </button>
          )}
        </div>

        {/* Account row */}
        {isAuthenticated && (
          <button
            type="button"
            onClick={() => { track('account_tapped'); setIsAccountSheetOpen(true); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 27px',
              borderTop: '0.5px solid #D1CDC2',
              background: 'transparent',
              border: 'none',
              borderTopWidth: '0.5px',
              borderTopStyle: 'solid',
              borderTopColor: '#D1CDC2',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  background: '#141515',
                  borderRadius: 999,
                  flexShrink: 0,
                }}
              >
                <AccountProfileIcon />
              </div>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 15,
                  lineHeight: '24px',
                  color: '#141515',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayName || t('account.title')}
              </span>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M6 3l5 5-5 5" stroke="#141515" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </aside>

      <DownloadModal open={showDownloadModal} onOpenChange={setShowDownloadModal} option={downloadOption} />

      <AccountBottomSheet
        open={isAccountSheetOpen}
        onOpenChange={setIsAccountSheetOpen}
        onLogout={handleLogout}
        isAnonymous={isAnonymous}
        onLogin={() => {
          setIsAccountSheetOpen(false);
          useLoginModalStore.getState().open();
        }}
      />

      {showGuide && <InstallGuide platform={platform} onDismiss={dismissGuide} />}
    </>
  );
}
