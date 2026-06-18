'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PanelLeft, X, ArrowLeft, ChevronDown } from 'lucide-react';
import { DetectiveIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { useIncognitoStore } from '@/stores/incognito-store';
import { useLoginModalStore } from '@/stores/login-modal-store';
import { useI18n } from '@/components/providers';
import { useLocation } from '@/components/providers/location-provider';
import { getLocationInfo } from '@/services/location-service';
import { track } from '@/services/analytics-service';
import { trackClevertap } from '@/utils/clevertap';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TextSize } from '@/types';


const TEXT_SIZE_OPTIONS: { value: TextSize; label: string; fontSize: number; iconSize: number }[] = [
  { value: 'small', label: 'Small', fontSize: 18, iconSize: 16 },
  { value: 'medium', label: 'Medium', fontSize: 20, iconSize: 20 },
  { value: 'large', label: 'Large', fontSize: 24, iconSize: 24 },
];

export const getTextSizePixels = (size: TextSize): number => {
  const option = TEXT_SIZE_OPTIONS.find(o => o.value === size);
  return option?.fontSize ?? 20;
};

interface NavbarProps {
  onMenuClick: () => void;
  textSize?: TextSize;
  onTextSizeChange?: (size: TextSize) => void;
  onIncognitoEnter?: () => void;
  onIncognitoExit?: () => void;
  showBackButton?: boolean;
  backButtonLabel?: string;
  onBackClick?: () => void;
  hideMenuButton?: boolean;
  loginUrl?: string;
}

export type { TextSize };

export function Navbar({ onMenuClick, textSize = 'small', onTextSizeChange, onIncognitoEnter, onIncognitoExit, showBackButton, backButtonLabel = 'Library', onBackClick, hideMenuButton, loginUrl }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAnonymous, isAuthenticated } = useAuthStore();
  const [authHydrated, setAuthHydrated] = useState(false);
  useEffect(() => {
    setAuthHydrated(true);
  }, []);
  const { isIncognitoMode, isLoading: isIncognitoLoading } = useIncognitoStore();
  const { isInitialized: isLocationInitialized } = useLocation();
  const isUS = isLocationInitialized && getLocationInfo()?.countryCode === 'US';
  const { t } = useI18n();
  const showIncognitoButton = authHydrated && isAuthenticated && !pathname?.startsWith('/ehr');
  const [isTextSizePopoverOpen, setIsTextSizePopoverOpen] = useState(false);

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  return (
    <header
      className="h-14 flex items-center justify-between px-4 shrink-0"
      style={{ backgroundColor: 'transparent' }}
    >
      <div className="flex items-center">
        {/* Back button for view pages */}
        {showBackButton ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#206E55] hover:opacity-70 transition-opacity"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 500 }}
          >
            <ArrowLeft size={18} />
            <span>{backButtonLabel}</span>
          </button>
        ) : (
          <>
            {/* Menu button - hidden on lg+ where sidebar is always visible */}
            {!hideMenuButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                aria-label={t('common.openMenu')}
                className="lg:hidden hover:bg-gray-200 transition-colors text-gray-500"
                suppressHydrationWarning
              >
                <PanelLeft className="size-6" strokeWidth={1.5} />
              </Button>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Incognito Mode Controls - Logged-in users.
            Mobile: US only (per spec). Desktop: any logged-in user. */}
        {showIncognitoButton && !isIncognitoMode && (
          <div className={`relative group ${isUS ? '' : 'max-lg:hidden'}`}>
            <button
              onClick={() => {
                track('incognito_button_tapped');
                trackClevertap('Incognito Button clicked', { page: 'chat' });
                onIncognitoEnter?.();
              }}
              disabled={isIncognitoLoading}
              className="flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700 bg-white disabled:opacity-50"
              style={{ borderRadius: '60px', padding: '10px' }}
              aria-label={t('navbar.incognitoMode')}
            >
              {isIncognitoLoading ? (
                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <DetectiveIcon size={20} />
              )}
            </button>
            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {t('navbar.enableIncognito')}
            </span>
          </div>
        )}

        {showIncognitoButton && isIncognitoMode && (
          <div className="flex items-center gap-2 bg-gray-800 text-white text-sm" style={{ borderRadius: '60px', padding: '10px 16px' }}>
            <DetectiveIcon size={20} />
            <span>{t('chat.incognito.mode')}</span>
            <button
              onClick={() => {
                track('incognito_exit_tapped');
                trackClevertap('Incognito Mode Closed', { page: 'chat' });
                onIncognitoExit?.();
              }}
              className="ml-1 hover:bg-gray-700 rounded-full p-0.5 transition-colors"
              aria-label={t('navbar.exitIncognito')}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Text Size Selector - Mobile (single button + popover dropdown).
            Per spec, mobile shows for US users — anon or logged-in. */}
        {onTextSizeChange && !isIncognitoMode && authHydrated && isUS && (
          <div className="flex lg:hidden">
            <Popover open={isTextSizePopoverOpen} onOpenChange={setIsTextSizePopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  className="group flex items-center justify-center gap-1 border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700 bg-white"
                  style={{ borderRadius: '60px', padding: '8px 12px', height: 40 }}
                  aria-label={t('navbar.adjustTextSize')}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2 }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1 }}>A</span>
                    <span style={{ fontSize: '18px', fontWeight: 500, lineHeight: 1 }}>A</span>
                  </span>
                  <ChevronDown
                    size={14}
                    strokeWidth={2}
                    className="text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={8} className="w-auto p-1">
                <div className="flex flex-col">
                  {TEXT_SIZE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onTextSizeChange(option.value);
                        track('text_size_changed', { size: option.value });
                        setIsTextSizePopoverOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left ${
                        textSize === option.value
                          ? 'bg-[#206E55] text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span style={{ fontSize: `${option.iconSize}px`, fontWeight: 500, width: 28, textAlign: 'center', lineHeight: 1 }}>A</span>
                      <span style={{ fontSize: '14px' }}>{option.label}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Text Size Buttons - Desktop only (lg+) */}
        {onTextSizeChange && !isIncognitoMode && (
          <div className="hidden lg:flex items-center gap-1 relative group">
            {TEXT_SIZE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onTextSizeChange(option.value);
                  track('text_size_changed', { size: option.value });
                }}
                className={`h-9 w-9 flex items-center justify-center rounded-lg transition-colors ${
                  textSize === option.value
                    ? 'bg-[#206E55] text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                aria-label={`${option.label} text size`}
              >
                <span style={{ fontSize: `${option.iconSize}px`, fontWeight: 500 }}>A</span>
              </button>
            ))}
            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {t('navbar.adjustTextSize')}
            </span>
          </div>
        )}

        {/* Log in CTA. Mobile: non-US anon only (US-anon shows text-size).
            Desktop: any anon user (unchanged). */}
        {isIncognitoMode ? null : !authHydrated ? null : !isAuthenticated ? (
          <Button
            onClick={() => {
              track('webapp_login', { source: 'navbar' });
              if (loginUrl) {
                window.location.href = loginUrl;
              } else {
                useLoginModalStore.getState().open();
              }
            }}
            className={`hover:opacity-90 transition-opacity ${isUS ? 'max-lg:hidden' : ''}`}
            style={{
              display: 'flex',
              padding: '10px 16px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              borderRadius: '60px',
              border: '0 solid var(--Primary-colors-green-500, #206E55)',
              background: 'var(--Primary-colors-green-500, #206E55)',
              color: 'var(--Backgrounds-Background-primary, #FFF)',
              fontFamily: '"SF Pro", sans-serif',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: 'normal',
            }}
          >
            <span suppressHydrationWarning>{t('common.login')}</span>
          </Button>
        ) : null}

        {/* Open in app — mobile only, non-US logged-in users (per spec). */}
        {!isIncognitoMode && authHydrated && isAuthenticated && !isUS && (
          <Button
            onClick={() => {
              track('download_tapped', { source: 'navbar' });
              trackClevertap('Download App Clicked', { source: 'navbar' });
              window.open('https://join.meetaugust.ai/?c=web_app', '_blank');
            }}
            className="lg:hidden hover:opacity-90 transition-opacity"
            style={{
              display: 'flex',
              padding: '10px 16px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              borderRadius: '60px',
              background: '#206E55',
              color: '#FFF',
              fontFamily: '"SF Pro", sans-serif',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: 'normal',
            }}
          >
            <span suppressHydrationWarning>{t('navbar.openInApp', { defaultValue: 'Open in app' })}</span>
          </Button>
        )}
      </div>
      </header>
  );
}

