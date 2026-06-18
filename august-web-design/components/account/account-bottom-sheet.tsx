'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ExternalLink, Trash2, History } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useI18n } from '@/components/providers';
import { track } from '@/services/analytics-service';
import { trackClevertap } from '@/utils/clevertap';
import { getUserData, UserData } from '@/services/user-service';
import { EditProfileModal } from './edit-profile-modal';
import { LogoutConfirmationModal } from './logout-confirmation-modal';
import { ClearHistoryConfirmationModal } from './clear-history-confirmation-modal';

const LANGUAGE_OPTIONS = [
  { code: 'en', labelKey: 'common.languageEnglish' },
  { code: 'fr', labelKey: 'common.languageFrench' },
  { code: 'ar', labelKey: 'common.languageArabic' },
  { code: 'bn', labelKey: 'common.languageBengali' },
  { code: 'cs', labelKey: 'common.languageCzech' },
  { code: 'de', labelKey: 'common.languageGerman' },
  { code: 'el', labelKey: 'common.languageGreek' },
  { code: 'es', labelKey: 'common.languageSpanish' },
  { code: 'fil', labelKey: 'common.languageFilipino' },
  { code: 'gu', labelKey: 'common.languageGujarati' },
  { code: 'he', labelKey: 'common.languageHebrew' },
  { code: 'hi', labelKey: 'common.languageHindi' },
  { code: 'hu', labelKey: 'common.languageHungarian' },
  { code: 'id', labelKey: 'common.languageIndonesian' },
  { code: 'it', labelKey: 'common.languageItalian' },
  { code: 'ja', labelKey: 'common.languageJapanese' },
  { code: 'kn', labelKey: 'common.languageKannada' },
  { code: 'ko', labelKey: 'common.languageKorean' },
  { code: 'mr', labelKey: 'common.languageMarathi' },
  { code: 'ms', labelKey: 'common.languageMalay' },
  { code: 'nl', labelKey: 'common.languageDutch' },
  { code: 'pa', labelKey: 'common.languagePunjabi' },
  { code: 'pl', labelKey: 'common.languagePolish' },
  { code: 'pt-BR', labelKey: 'common.languagePortugueseBrazil' },
  { code: 'pt-PT', labelKey: 'common.languagePortuguesePortugal' },
  { code: 'ro', labelKey: 'common.languageRomanian' },
  { code: 'ru', labelKey: 'common.languageRussian' },
  { code: 'sv', labelKey: 'common.languageSwedish' },
  { code: 'ta', labelKey: 'common.languageTamil' },
  { code: 'te', labelKey: 'common.languageTelugu' },
  { code: 'th', labelKey: 'common.languageThai' },
  { code: 'tr', labelKey: 'common.languageTurkish' },
  { code: 'uk', labelKey: 'common.languageUkrainian' },
  { code: 'ur', labelKey: 'common.languageUrdu' },
  { code: 'vi', labelKey: 'common.languageVietnamese' },
  { code: 'zh-CN', labelKey: 'common.languageChineseSimplified' },
  { code: 'zh-TW', labelKey: 'common.languageChineseTraditional' },
] as const;

interface AccountBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogout: () => void;
  isAnonymous: boolean;
  onLogin: () => void;
}


export function AccountBottomSheet({
  open,
  onOpenChange,
  onLogout,
  isAnonymous,
  onLogin,
}: AccountBottomSheetProps) {
  const { t, i18n } = useI18n();
  const router = useRouter();
  const { user } = useAuthStore();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isClearHistoryOpen, setIsClearHistoryOpen] = useState(false);
  const languageSelectRef = useRef<HTMLSelectElement>(null);

  // Fetch user data when sheet opens (only for logged in users)
  useEffect(() => {
    if (open && !isAnonymous) {
      getUserData()
        .then(setUserData)
        .catch(() => {
          // Use local user data as fallback
        });
    }
  }, [open, isAnonymous]);

  const displayName = userData?.displayName || userData?.name || user?.name || '';
  const rawPhone = user?.phone || '';
  const isPhoneUser = Boolean(rawPhone && !rawPhone.startsWith('+anon'));
  const primaryContact = isPhoneUser ? rawPhone : (user?.email || '');
  const alternativeContact = isPhoneUser
    ? (userData?.alternativeContact || userData?.email || '')
    : (userData?.alternativeContact || '');

  const initials = getInitials(displayName || primaryContact);

  const handleLanguageChange = (locale: string) => {
    if (locale && locale !== i18n.language) {
      void i18n.changeLanguage(locale);
    }
  };

  const handleEditProfile = () => {
    track('edit_profile_tapped');
    trackClevertap('Settings Item Clicked', { item: 'Edit Profile' });
    setIsEditProfileOpen(true);
  };

  const handleShareApp = () => {
    track('share_app_tapped');
    trackClevertap('Settings Item Clicked', { item: 'Share App' });
    const shareUrl = 'https://join.meetaugust.ai/?c=share_app';
    if (navigator.share) {
      navigator.share({
        title: 'August - AI Health Companion',
        text: "Found something way better than Googling symptoms. \n\nIt's the #1 Health AI trusted by 6 million people and actually knows what it's talking about.\n\nBeen really useful for understanding lab reports, symptoms, medications without the confusion. Sharing in case it helps.\n\nHere's the app -",
        url: shareUrl,
      }).catch(() => {
        // User cancelled share
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  const handleAboutUs = () => {
    track('about_us_tapped');
    trackClevertap('Settings Item Clicked', { item: 'About Us' });
    window.open('https://www.meetaugust.ai/about', '_blank');
  };

  const handleAccountPrivacy = () => {
    track('account_privacy_tapped');
    trackClevertap('Settings Item Clicked', { item: 'Account Privacy' });
    window.open('https://www.meetaugust.ai/privacy', '_blank');
  };

  const handleTermsOfService = () => {
    track('terms_of_service_tapped');
    trackClevertap('Settings Item Clicked', { item: 'Terms of Service' });
    window.open('https://www.meetaugust.ai/terms', '_blank');
  };

  const handleClearChatHistory = () => {
    track('clear_chat_history_tapped');
    trackClevertap('Settings Item Clicked', { item: 'Clear Chat History' });
    setIsClearHistoryOpen(true);
  };

  const handleDeleteAccount = () => {
    track('delete_account_tapped');
    trackClevertap('Settings Item Clicked', { item: 'Delete Account' });
    onOpenChange(false);
    router.push('/delete-account');
  };

  const handleLogoutClick = () => {
    track('logout_tapped');
    trackClevertap('Settings Item Clicked', { item: 'Logout' });
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    onOpenChange(false);
    onLogout();
  };

  const handleProfileSave = (newName: string, newAlternativeContact: string) => {
    setUserData((prev) => {
      if (!prev) return prev;
      const updatedData = { ...prev, displayName: newName, name: newName };
      if (isPhoneUser) {
        updatedData.email = newAlternativeContact;
      } else {
        updatedData.alternativeContact = newAlternativeContact;
      }
      return updatedData;
    });
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
          <div className="min-h-full w-full max-w-2xl mx-auto">
            {/* Handle bar and close button */}
            <div className="relative pt-4 pb-2">
              <div className="flex justify-center sm:hidden">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
              {/* Custom close button */}
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="absolute top-4 right-4 flex items-center justify-center hover:bg-[#EDEBE5] transition"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 46,
                  border: '1px solid #E8EBEA',
                  background: '#Fff',
                }}
              >
                <CloseIcon />
                <span className="sr-only">Close</span>
              </button>
            </div>

          {/* Profile section - centered */}
          <div className="px-6 pt-4 pb-6 flex flex-col items-center">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-[#3D3D3D] flex items-center justify-center">
              <span className="text-2xl font-semibold text-white">
                {isAnonymous ? 'AU' : initials}
              </span>
            </div>

            {/* Name */}
            <h2 className="mt-3 text-xl font-semibold text-gray-900 text-center">
              {isAnonymous ? 'August User' : (displayName || 'August User')}
            </h2>

            {/* Contact info - show both email and phone if available */}
            {!isAnonymous && (
              <div className="text-sm text-gray-500 text-center">
                {primaryContact && <p>{primaryContact}</p>}
                {alternativeContact && <p>{alternativeContact}</p>}
              </div>
            )}

            {/* Edit profile / Login button */}
            {isAnonymous ? (
              <button
                type="button"
                onClick={() => {
                  track('login_tapped', { source: 'account_sheet' });
                  onLogin();
                }}
                className="mt-4 py-3 px-6 bg-[#206E55] rounded-full text-center text-base font-medium text-white hover:bg-[#185544] transition"
              >
                {t('common.login')}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEditProfile}
                className="mt-4 flex items-center gap-2 hover:bg-[#EDEBE5] transition"
                style={{
                  padding: '10px 12px',
                  borderRadius: 32,
                  border: '1px solid #767F7C',
                }}
              >
                <EditIcon />
                <span className="text-sm font-medium text-gray-900">
                  {t('account.updateProfile')}
                </span>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="mx-6 border-t border-gray-200" />

          {/* Account section */}
          <div className="px-6 pt-4">
            <h3 className="text-sm font-medium text-[#206E55] mb-3 uppercase tracking-wide">
              {t('account.section.account')}
            </h3>
            <div className="flex flex-col bg-white rounded-xl divide-y divide-gray-100">
              {/* Language selector */}
              <SectionRow
                icon={<LanguageIcon />}
                label={t('account.changeLanguagePreference')}
                onClick={() => {
                  const select = languageSelectRef.current;
                  if (select) {
                    try {
                      select.showPicker();
                    } catch {
                      select.focus();
                      select.click();
                    }
                  }
                }}
                rightContent={
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <select
                      ref={languageSelectRef}
                      value={i18n.language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="text-sm text-gray-500 bg-transparent border-none focus:outline-none cursor-pointer text-right appearance-none"
                    >
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {t(lang.labelKey)}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                }
              />
              <SectionRow
                icon={<PrivacyIcon />}
                label={t('account.PrivacyOptions')}
                onClick={handleAccountPrivacy}
                showExternalIcon
              />
              {!isAnonymous && (
                <>
                  <SectionRow
                    icon={<History className="h-5 w-5 text-gray-600" />}
                    label={t('account.clearChatHistory', {
                      defaultValue: 'Clear chat history',
                    })}
                    onClick={handleClearChatHistory}
                  />
                  <SectionRow
                    icon={<Trash2 className="h-5 w-5 text-gray-600" />}
                    label={t('account.requestDeleteAccount', {
                      defaultValue: 'Request to delete account',
                    })}
                    onClick={handleDeleteAccount}
                  />
                </>
              )}
              <SectionRow
                icon={<ShareIcon />}
                label={t('account.shareTheGoodness')}
                onClick={handleShareApp}
              />
              <SectionRow
                icon={<TermsIcon />}
                label={t('account.termsOfService')}
                onClick={handleTermsOfService}
                showExternalIcon
              />
              <SectionRow
                icon={<AboutIcon />}
                label={t('account.aboutAugust')}
                onClick={handleAboutUs}
                showExternalIcon
              />
            </div>
          </div>

          {/* Logout section - only for logged in users */}
          {!isAnonymous && (
            <div className="px-6 pt-6 pb-8">
              <div className="rounded-xl">
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="flex w-full items-center justify-between py-4 px-4 hover:bg-[#EDEBE5] rounded-xl transition"
                >
                  <div className="flex items-center gap-3">
                    <LogoutIcon />
                    <span className="text-[14px] sm:text-base text-gray-900">{t('account.logMeOut')}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          )}

          {/* Bottom padding for anonymous users */}
          {isAnonymous && <div className="pb-8" />}
          </div>
        </div>
      )}

      <EditProfileModal
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        initialName={displayName}
        isPhoneUser={isPhoneUser}
        primaryContact={primaryContact}
        initialAlternativeContact={alternativeContact}
        onSave={handleProfileSave}
      />

      <LogoutConfirmationModal
        open={isLogoutModalOpen}
        onOpenChange={setIsLogoutModalOpen}
        onConfirm={handleLogoutConfirm}
      />

      <ClearHistoryConfirmationModal
        open={isClearHistoryOpen}
        onOpenChange={setIsClearHistoryOpen}
        onCleared={() => onOpenChange(false)}
      />
    </>
  );
}

interface SectionRowProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  rightContent?: React.ReactNode;
  showExternalIcon?: boolean;
}

function SectionRow({ icon, label, onClick, rightContent, showExternalIcon }: SectionRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between py-4 px-4 hover:bg-[#EDEBE5] transition"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="shrink-0">{icon}</span>
        <span className="text-[14px] sm:text-base text-gray-900 text-left">{label}</span>
      </div>
      {rightContent ? (
        rightContent
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          {showExternalIcon && <ExternalLink className="h-4 w-4 text-gray-400" />}
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      )}
    </button>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 46 46" fill="none">
      <path d="M21.2132 22.6276L16.4992 17.9136C16.2988 17.7132 16.1987 17.4775 16.1989 17.2065C16.1989 16.9352 16.299 16.6995 16.4994 16.4991C16.6999 16.2986 16.9356 16.1985 17.2065 16.1988C17.4774 16.1988 17.713 16.299 17.9134 16.4994L22.6274 21.2134L27.3415 16.4994C27.5418 16.299 27.7775 16.1989 28.0486 16.1991C28.3198 16.1991 28.5556 16.2992 28.7559 16.4996C28.9564 16.7001 29.0565 16.9358 29.0562 17.2067C29.0562 17.4776 28.956 17.7132 28.7557 17.9136L24.0416 22.6276L28.7557 27.3417C28.956 27.542 29.0561 27.7777 29.056 28.0488C29.056 28.32 28.9558 28.5558 28.7554 28.7561C28.5549 28.9566 28.3192 29.0567 28.0483 29.0564C27.7774 29.0564 27.5418 28.9562 27.3415 28.7559L22.6274 24.0418L17.9134 28.7559C17.713 28.9562 17.4773 29.0563 17.2063 29.0562C16.935 29.0562 16.6993 28.956 16.4989 28.7556C16.2984 28.5551 16.1983 28.3194 16.1986 28.0485C16.1986 27.7776 16.2988 27.542 16.4992 27.3417L21.2132 22.6276Z" fill="#141515"/>
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 11.5V14H4.5L11.8733 6.62667L9.37333 4.12667L2 11.5ZM13.8067 4.69333C14.0667 4.43333 14.0667 4.01333 13.8067 3.75333L12.2467 2.19333C11.9867 1.93333 11.5667 1.93333 11.3067 2.19333L10.0867 3.41333L12.5867 5.91333L13.8067 4.69333Z" fill="#141515"/>
    </svg>
  );
}

function LanguageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 18.3333C8.84722 18.3333 7.76389 18.1146 6.75 17.6771C5.73611 17.2396 4.85417 16.6458 4.10417 15.8958C3.35417 15.1458 2.76042 14.2639 2.32292 13.25C1.88542 12.2361 1.66667 11.1528 1.66667 10C1.66667 8.84722 1.88542 7.76389 2.32292 6.75C2.76042 5.73611 3.35417 4.85417 4.10417 4.10417C4.85417 3.35417 5.73611 2.76042 6.75 2.32292C7.76389 1.88542 8.84722 1.66667 10 1.66667C11.1528 1.66667 12.2361 1.88542 13.25 2.32292C14.2639 2.76042 15.1458 3.35417 15.8958 4.10417C16.6458 4.85417 17.2396 5.73611 17.6771 6.75C18.1146 7.76389 18.3333 8.84722 18.3333 10C18.3333 11.1528 18.1146 12.2361 17.6771 13.25C17.2396 14.2639 16.6458 15.1458 15.8958 15.8958C15.1458 16.6458 14.2639 17.2396 13.25 17.6771C12.2361 18.1146 11.1528 18.3333 10 18.3333ZM10 16.5417C10.4028 16.0139 10.7431 15.4583 11.0208 14.875C11.2986 14.2917 11.5278 13.6667 11.7083 13H8.29167C8.47222 13.6667 8.70139 14.2917 8.97917 14.875C9.25694 15.4583 9.59722 16.0139 10 16.5417ZM7.75 16.2083C7.45833 15.7083 7.20833 15.1806 7 14.625C6.79167 14.0694 6.625 13.5 6.5 12.9167H4.04167C4.51389 13.6667 5.09722 14.3056 5.79167 14.8333C6.48611 15.3611 7.27778 15.8472 8.16667 16.2917L7.75 16.2083ZM12.25 16.2083L11.8333 16.2917C12.7222 15.8472 13.5139 15.3611 14.2083 14.8333C14.9028 14.3056 15.4861 13.6667 15.9583 12.9167H13.5C13.375 13.5 13.2083 14.0694 13 14.625C12.7917 15.1806 12.5417 15.7083 12.25 16.2083ZM3.41667 11.5833H6.20833C6.15278 11.2222 6.11111 10.8681 6.08333 10.5208C6.05556 10.1736 6.04167 10.0833 6.04167 10C6.04167 9.91667 6.05556 9.82639 6.08333 9.47917C6.11111 9.13194 6.15278 8.77778 6.20833 8.41667H3.41667C3.31944 8.77778 3.24653 9.13194 3.19792 9.47917C3.14931 9.82639 3.125 10.1667 3.125 10.5C3.125 10.8333 3.14931 10.1736 3.19792 10.5208C3.24653 10.8681 3.31944 11.2222 3.41667 11.5833ZM7.54167 11.5833H12.4583C12.5139 11.2222 12.5556 10.8681 12.5833 10.5208C12.6111 10.1736 12.625 9.83333 12.625 9.5C12.625 9.16667 12.6111 9.82639 12.5833 9.47917C12.5556 9.13194 12.5139 8.77778 12.4583 8.41667H7.54167C7.48611 8.77778 7.44444 9.13194 7.41667 9.47917C7.38889 9.82639 7.375 10.1667 7.375 10.5C7.375 10.8333 7.38889 10.1736 7.41667 10.5208C7.44444 10.8681 7.48611 11.2222 7.54167 11.5833ZM13.7917 11.5833H16.5833C16.6806 11.2222 16.7535 10.8681 16.8021 10.5208C16.8507 10.1736 16.875 9.83333 16.875 9.5C16.875 9.16667 16.8507 9.82639 16.8021 9.47917C16.7535 9.13194 16.6806 8.77778 16.5833 8.41667H13.7917C13.8472 8.77778 13.8889 9.13194 13.9167 9.47917C13.9444 9.82639 13.9583 10.1667 13.9583 10.5C13.9583 10.8333 13.9444 10.1736 13.9167 10.5208C13.8889 10.8681 13.8472 11.2222 13.7917 11.5833ZM13.5 7.08333H15.9583C15.4861 6.33333 14.9028 5.69444 14.2083 5.16667C13.5139 4.63889 12.7222 4.15278 11.8333 3.70833L12.25 3.79167C12.5417 4.29167 12.7917 4.81944 13 5.375C13.2083 5.93056 13.375 6.5 13.5 7.08333ZM8.29167 7.08333H11.7083C11.5278 6.41667 11.2986 5.79167 11.0208 5.20833C10.7431 4.625 10.4028 4.06944 10 3.54167C9.59722 4.06944 9.25694 4.625 8.97917 5.20833C8.70139 5.79167 8.47222 6.41667 8.29167 7.08333ZM4.04167 7.08333H6.5C6.625 6.5 6.79167 5.93056 7 5.375C7.20833 4.81944 7.45833 4.29167 7.75 3.79167L8.16667 3.70833C7.27778 4.15278 6.48611 4.63889 5.79167 5.16667C5.09722 5.69444 4.51389 6.33333 4.04167 7.08333Z" fill="#141515"/>
    </svg>
  );
}

function getInitials(name: string): string {
  if (!name) return 'AU';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 6.66667C16.3807 6.66667 17.5 5.54738 17.5 4.16667C17.5 2.78595 16.3807 1.66667 15 1.66667C13.6193 1.66667 12.5 2.78595 12.5 4.16667C12.5 5.54738 13.6193 6.66667 15 6.66667Z" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 12.5C6.38071 12.5 7.5 11.3807 7.5 10C7.5 8.61929 6.38071 7.5 5 7.5C3.61929 7.5 2.5 8.61929 2.5 10C2.5 11.3807 3.61929 12.5 5 12.5Z" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 18.3333C16.3807 18.3333 17.5 17.214 17.5 15.8333C17.5 14.4526 16.3807 13.3333 15 13.3333C13.6193 13.3333 12.5 14.4526 12.5 15.8333C12.5 17.214 13.6193 18.3333 15 18.3333Z" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.15833 11.2583L12.85 14.575" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.8417 5.425L7.15833 8.74167" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function AboutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 13.3333V10" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 6.66667H10.0083" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PrivacyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 18.3333C10 18.3333 16.6667 15 16.6667 10V4.16667L10 1.66667L3.33333 4.16667V10C3.33333 15 10 18.3333 10 18.3333Z" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function TermsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.6667 1.66667H5C4.55797 1.66667 4.13405 1.84226 3.82149 2.15482C3.50893 2.46738 3.33333 2.89131 3.33333 3.33334V16.6667C3.33333 17.1087 3.50893 17.5326 3.82149 17.8452C4.13405 18.1577 4.55797 18.3333 5 18.3333H15C15.442 18.3333 15.8659 18.1577 16.1785 17.8452C16.4911 17.5326 16.6667 17.1087 16.6667 16.6667V6.66667L11.6667 1.66667Z" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11.6667 1.66667V6.66667H16.6667" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.3333 10.8333H6.66667" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.3333 14.1667H6.66667" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.33333 7.5H7.5H6.66667" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.3333 14.1667L17.5 10L13.3333 5.83334" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.5 10H7.5" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
