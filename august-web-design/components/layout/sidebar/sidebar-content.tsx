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
import { PlusCircleIcon } from '@phosphor-icons/react';
import {
  NAV_OPTIONS,
  COLLAPSED_TOOLTIP_KEYS,
  DOWNLOAD_APP_BUTTON_KEY,
  DOWNLOAD_APP_BUTTON_DEFAULT,
  type NavOptionId,
} from './constants';
import { resolveActiveNavId, formatRelativeShort } from './utils';
import { useSidebarConsults } from './use-sidebar-consults';
import {
  AugustLogo,
  AccountProfileIcon,
  PhoneIcon,
  AppStoreButton,
  GooglePlayButton,
} from './icons';
import { DownloadModal } from './download-modal';
import { EhrSubNav } from './ehr-sub-nav';
import { TextSize } from '@/types';

export function SidebarContent({
  onClose,
  textSize,
  onTextSizeChange,
  collapsed,
  onToggleCollapse,
}: {
  onClose?: () => void;
  textSize?: TextSize;
  onTextSizeChange?: (size: TextSize) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadOption, setDownloadOption] = useState<NavOptionId>('chat');
  const isAccountSheetOpen = useAccountSheetStore((s) => s.isOpen);
  const setIsAccountSheetOpen = useAccountSheetStore((s) => s.setOpen);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();
  const { isAnonymous, isAuthenticated } = useAuthStore();
  // Gate anything that depends on auth state (esp. the login CTA vs
  // "take August with you" split) on the zustand persist rehydration so
  // logged-in users don't flash a "Log in" button on first paint.
  const [authHydrated, setAuthHydrated] = useState(false);
  useEffect(() => {
    setAuthHydrated(true);
  }, []);
  const { isInitialized } = useLocation();
  const isUS = isInitialized && getLocationInfo()?.countryCode === 'US';
  const { showGuide, dismissGuide, platform } = usePwaInstall();
  const showSidebarEmptyConsultAction = useNewConsultModalStore((s) => s.showSidebarEmptyAction);
  const showSidebarConsultAction = useNewConsultModalStore((s) => s.showSidebarAction);

  const {
    consults,
    sortedConsults,
    activeConsultId,
  } = useSidebarConsults();

  const activeNavId: NavOptionId = resolveActiveNavId(pathname);

  const selectedPersonHasEhrData = useEhrStore((s) => {
    if (!s.selectedPersonId) return false;
    return (
      s.providers.some((p) => p.personId === s.selectedPersonId) ||
      !!s.recentlyUploadedFor[s.selectedPersonId]
    );
  });

  const filteredNavOptions = useMemo(() => {
    if (!isUS) return NAV_OPTIONS.filter((option) => !option.isUSOnly);
    return NAV_OPTIONS;
  }, [isUS]);

  const handleLogout = async () => {
    try {
      await logout();
      useChatStore.getState().reset();
      // Full reset (not resetEhr): clears identity-scoped state — persons,
      // selectedPersonId, and the ehrOnboardingComplete flag — so the next
      // account to log in this tab doesn't inherit the prior user's onboarding
      // signal from the in-memory (non-user-keyed) store.
      useEhrStore.getState().reset();
      track('user_logout');
      onClose?.();
      router.push('/chat');
    } catch (error) {
      logger.error('Logout failed', serializeError(error));
    }
  };

  const handleAccountTap = () => {
    track('account_tapped');
    trackClevertap('Sidebar Navigation Selected', { destination: 'settings' });
    setIsAccountSheetOpen(true);
  };

  const handleNewConsultClick = () => {
    trackTelehealth('new_consult_clicked');
    onClose?.();
    if (pathname !== '/chat') router.push('/chat');
    useNewConsultModalStore.getState().open();
  };

  return (
    <>
      <div className={`flex-1  ${collapsed ? 'px-3' : 'px-4'} pb-6 space-y-6`}>
        <div className={`h-14 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && <div className="flex items-center h-9 mt-1"><AugustLogo /></div>}
          {onToggleCollapse && (
            <Tooltip content={collapsed ? t('sidebar.tooltips.showFullMenu') : t('sidebar.tooltips.hideFullMenu')} position={collapsed ? 'right' : 'bottom'}>
              <button
                type="button"
                onClick={onToggleCollapse}
                className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-gray-100 transition text-gray-500"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <PanelLeft className="h-6 w-6" strokeWidth={1.5} />
              </button>
            </Tooltip>
          )}
        </div>

        <nav className="space-y-3">
         {filteredNavOptions.map((option) => {
            const Icon = option.icon;
            const label = t(option.labelKey, { defaultValue: option.defaultLabel });
            const isSelected =
              option.id === activeNavId &&
              !(option.id === 'consults' && activeConsultId);
            const tooltipKey = COLLAPSED_TOOLTIP_KEYS[option.id];
            const tooltipContent = tooltipKey ? t(tooltipKey) : option.defaultLabel;
            const handleOptionClick = () => {
              if (option.id === 'chat') {
                onClose?.();
                router.push('/chat');
                return;
              }
              if (option.id === 'consults') {
                // Don't navigate — the dropdown of recent consults +
                // "View all consults" link is rendered directly below
                // this row. /consults is reached only via that link.
                track('consults_tapped');
                trackTelehealth('consult_doctor_menu_group_clicked');
                trackClevertap('Sidebar Navigation Selected', { destination: 'consults' });
                if (consults.length === 0) {
                  showSidebarConsultAction();
                }
                return;
              }
              if (option.id === 'nutrition') {
                track('nutrition_tapped');
                trackClevertap('Sidebar Navigation Selected', { destination: 'nutrition' });
              }
              if (option.id === 'explore') {
                track('explore_tapped');
                trackClevertap('Sidebar Navigation Selected', { destination: 'discover' });
                router.push('/explore');
                return;
              }
              if (option.id === 'ehr') {
                track('ehr_tapped');
                trackClevertap('Sidebar Navigation Selected', { destination: 'ehr' });
                onClose?.();
                router.push('/ehr');
                return;
              }
              setDownloadOption(option.id);
              setShowDownloadModal(true);
            };
            const showInlineNewConsult = option.id === 'consults' && !collapsed && consults.length > 0;
            const buttonElement = (
              <div className="relative w-full" key={option.id}>
                <button
                  type="button"
                  onClick={handleOptionClick}
                  className={`group flex w-full items-center gap-3 rounded-[12px] h-12 px-1 text-left transition shrink-0 self-stretch ${showInlineNewConsult ? 'pr-11' : ''} ${collapsed ? 'justify-center' : ''} ${isSelected ? 'bg-[#F3F1EB]' : 'hover:bg-[#F3F1EB]'}`}
                >
                  <span className="w-6 flex items-center justify-center shrink-0">
                    <Icon selected={isSelected} />
                  </span>
                  {!collapsed && (
                    <span
                      suppressHydrationWarning
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: 15,
                        lineHeight: '24px',
                        color: isSelected ? '#141515' : '#7A7468',
                      }}
                    >
                      {label}
                    </span>
                  )}
                </button>
                {showInlineNewConsult && (
                  <div className="absolute right-1 top-1/2 -translate-y-1/2">
                    <Tooltip content="New Consult" position="right">
                      <button
                        type="button"
                        onClick={handleNewConsultClick}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#5A554A] transition hover:bg-[#EDEBE5]"
                        aria-label="New Consult"
                      >
                        <PlusCircleIcon size={20} color="#5A554A" />
                      </button>
                    </Tooltip>
                  </div>
                )}
              </div>
            );
            return (
              <React.Fragment key={option.id}>
                {showInlineNewConsult ? (
                  buttonElement
                ) : (
                  <Tooltip content={tooltipContent} position="right" className="w-full">
                    {buttonElement}
                  </Tooltip>
                )}
                {option.id === 'ehr' && activeNavId === 'ehr' && !collapsed && selectedPersonHasEhrData && (
                  <EhrSubNav onNavigate={() => onClose?.()} />
                )}
                {option.id === 'consults' && !collapsed && consults.length === 0 && showSidebarEmptyConsultAction && (
                  <ul className="ml-3 mt-1 space-y-1 pl-3">
                    <li>
                      <button
                        type="button"
                        onClick={handleNewConsultClick}
                        className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-[#EDEBE5]"
                      >
                        <PlusCircleIcon size={18} color="#5A554A" />
                        <span className="text-[13px] font-normal leading-[20px] text-[#5A554A]">
                          New Consult
                        </span>
                      </button>
                    </li>
                  </ul>
                )}
                {option.id === 'consults' && !collapsed && consults.length > 0 && (
                  <ul className="ml-3 mt-1 space-y-1 pl-3">
                    {sortedConsults.slice(0, 2).map((c) => {
                      const isActiveConsult = c.id === activeConsultId;
                      const topic = c.visit_reason || 'Online doctor consult';
                      const doctor = c.clinician_first_name
                        ? `${c.clinician_first_name} ${c.clinician_last_name || ''}${c.clinician_suffix ? ` ${c.clinician_suffix}` : ''}`.trim()
                        : 'Awaiting doctor';
                      const date = formatRelativeShort(c.created_at);
                      return (
                        <li key={c.id}>
                          <button
                            type="button"
                            onClick={() => {
                              trackTelehealth('consult_doctor_child_menu_clicked');
                              onClose?.();
                              router.push(`/consults/e/${c.id}`);
                            }}
                            onPointerEnter={() => prefetchConsult(c)}
                            onFocus={() => prefetchConsult(c)}
                            className={`group block w-full rounded-lg px-2 py-1.5 text-left transition hover:bg-[#EDEBE5] ${
                              isActiveConsult ? 'bg-[#EDEBE5]' : ''
                            }`}
                          >
                            <span className={`flex items-center gap-1.5 truncate text-[13px] leading-[18px] ${isActiveConsult ? 'text-[#206E55] font-medium' : 'text-[#3B403E]'}`}>
                              {c.has_unread && (
                                <span
                                  aria-label="Unread message"
                                  className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#206E55]"
                                />
                              )}
                              <span className="truncate">{topic}</span>
                            </span>
                            <span className="block truncate text-[11px] leading-[14px] text-[#767F7C] mt-0.5">
                              {doctor} · {date}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                    {sortedConsults.length > 2 && (
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            trackTelehealth('view_all_consults_clicked');
                            onClose?.();
                            router.push('/consults');
                          }}
                          className={`group block w-full rounded-lg px-2 py-1.5 text-left transition hover:bg-[#EDEBE5] ${
                            pathname === '/consults' ? 'bg-[#EDEBE5]' : ''
                          }`}
                        >
                          <span className={`flex items-center gap-1.5 text-[13px] leading-[18px] ${pathname === '/consults' ? 'text-[#206E55] font-medium' : 'text-[#3B403E]'}`}>
                            {sortedConsults.slice(2).some((c) => c.has_unread) && (
                              <span
                                aria-label="Unread message"
                                className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#206E55]"
                              />
                            )}
                            View all
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 3l4 4-4 4" stroke="#5A554A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          </span>

                        </button>
                      </li>
                    )}
                  </ul>
                )}
              </React.Fragment>
            );
          })}

          {/* Tools Section - US only */}
          {isUS && (
            <>
              <div className={`mt-4 h-5 ${collapsed ? '' : 'px-3'}`}>
                {!collapsed && <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tools</span>}
              </div>
              {/* All tools link */}
              {(() => {
                const isSelected = activeNavId === 'all-tools';
                const buttonElement = (
                  <button
                    type="button"
                    onClick={() => {
                      track('all_tools_tapped');
                      trackClevertap('Sidebar Navigation Selected', { destination: 'all-tools' });
                      router.push('/tool');
                    }}
                    className={`group flex w-full items-center gap-3 rounded-[12px] h-12 px-1 text-left text-[16px] font-normal transition shrink-0 self-stretch text-[#141515] ${collapsed ? 'justify-center' : ''} ${isSelected ? 'bg-[#F3F1EB]' : 'hover:bg-[#F3F1EB]'}`}
                    style={{ fontFamily: '"SF Pro", system-ui, sans-serif' }}
                  >
                    <span className="w-6 flex items-center justify-center shrink-0">
                      <LayoutGrid size={20} color="#4E5553" strokeWidth={1.5} aria-hidden />
                    </span>
                    {!collapsed && (
                      <span className={isSelected ? 'font-semibold' : 'group-hover:font-semibold'}>Tools</span>
                    )}
                  </button>
                );
                return (
                  <Tooltip key="all-tools" content="All tools" position="right">
                    {buttonElement}
                  </Tooltip>
                );
              })()}
            </>
          )}
        </nav>

        {/* Login button for anonymous or evicted users — only render after
            auth has hydrated from localStorage so logged-in users don't
            see a brief "Log in" flash on first paint. */}
        {!collapsed && authHydrated && !isAuthenticated && (
          <button
            type="button"
            onClick={() => {
              track('webapp_login', { source: 'side_menu' });
              onClose?.();
              useLoginModalStore.getState().open();
            }}
            className="w-full rounded-full bg-[#206E55] px-4 py-3 text-center text-base font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
            suppressHydrationWarning
          >
            <span suppressHydrationWarning>{t('common.login', { defaultValue: 'Log in' })}</span>
          </button>
        )}
      </div>

      {/* Desktop bottom section: App buttons, Text size, Account */}
      {isAuthenticated && !collapsed && (
        <div className="hidden lg:flex flex-col gap-4 px-5 py-6">
          {/* Take August with you */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <PhoneIcon />
              <span className="text-sm text-gray-700" suppressHydrationWarning>{t('sidebar.takeAugustWithYou')}</span>
            </div>
            {/* App Store buttons - in one row */}
            <div className="flex gap-2">
              <a
                href="https://join.meetaugust.ai/?c=web_app_apple_desktop"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  track('download_tapped', { source: 'sidebar' });
                  trackClevertap('Download App Clicked', { source: 'sidebar' , type: 'ios'});
                }}
                className="hover:opacity-90 transition-opacity"
              >
                <AppStoreButton />
              </a>
              <a
                href="https://join.meetaugust.ai/?c=web_app_android_desktop"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  track('download_tapped', { source: 'sidebar' });
                  trackClevertap('Download App Clicked', { source: 'sidebar' , type: 'android'});
                }}
                className="hover:opacity-90 transition-opacity"
              >
                <GooglePlayButton />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Open in app button - mobile only, logged in users */}
      {isAuthenticated && !collapsed && (
        <div className="lg:hidden px-5 pb-4 mt-auto">
          <button
            type="button"
            onClick={() => {
              track('download_tapped', { source: 'side_menu' });
              trackClevertap('Download App Clicked', { source: 'sidebar' });
              window.open('https://join.meetaugust.ai/?c=web_app', '_blank');
            }}
            className="w-full rounded-full bg-[#206E55] px-4 py-3 text-center text-base font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
            suppressHydrationWarning
          >
            <span suppressHydrationWarning>{t(DOWNLOAD_APP_BUTTON_KEY, { defaultValue: DOWNLOAD_APP_BUTTON_DEFAULT })}</span>
          </button>
        </div>
      )}

      {/* Account section - at the very bottom */}
      <div className="border-t border-gray-200">
        <Tooltip content={t('sidebar.tooltips.manageAccount')} position="right">
          <button
            type="button"
            onClick={handleAccountTap}
            className={`flex w-full items-center gap-3 ${collapsed ? 'px-3 justify-center' : 'px-5'} py-4 hover:bg-gray-50 transition`}
          >
            <div className="h-8 w-8 rounded-full bg-[#3D3D3D] flex items-center justify-center shrink-0">
              <AccountProfileIcon />
            </div>
            {!collapsed && (
              <span className="text-[14px] text-gray-900" suppressHydrationWarning>
                {t('account.title')}
              </span>
            )}
          </button>
        </Tooltip>
      </div>

      <DownloadModal
        open={showDownloadModal}
        onOpenChange={setShowDownloadModal}
        option={downloadOption}
      />

      <AccountBottomSheet
        open={isAccountSheetOpen}
        onOpenChange={setIsAccountSheetOpen}
        onLogout={handleLogout}
        isAnonymous={isAnonymous}
        onLogin={() => {
          setIsAccountSheetOpen(false);
          onClose?.();
          useLoginModalStore.getState().open();
        }}
      />

      {/* Install guide overlay */}
      {showGuide && <InstallGuide platform={platform} onDismiss={dismissGuide} />}
    </>
  );
}
