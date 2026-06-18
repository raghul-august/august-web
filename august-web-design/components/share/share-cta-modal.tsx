'use client';

import { useState } from 'react';
import Image from 'next/image';
import { track } from '@/services/analytics-service';
import { trackClevertap } from '@/utils/clevertap';
import { SignUpModal } from '@/components/auth/signup-modal';
import { useI18n } from '@/components/providers';
import { useAuthStore } from '@/stores/auth-store';

interface ShareCtaModalProps {
  onClose?: () => void;
}

export function ShareCtaModal({ onClose }: ShareCtaModalProps) {
  const { t } = useI18n();
  const { user } = useAuthStore();
  // Any user who has been through session init (anon or named) → standard URL.
  // Truly uninit visitors (no user yet) → anon variant.
  const hasSession = !!user;
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const handleSignUp = () => {
    track('share_cta_signup_clicked');
    trackClevertap('Modal Primary CTA Clicked', { name: 'share-app', button_copy: 'Sign Up' });
    setShowSignUpModal(true);
  };

  const handleDownloadApp = () => {
    track('download_tapped', { source: 'share_cta_modal' });
    trackClevertap('Download App Clicked', { source: 'share_cta_modal' });
    const downloadUrl = hasSession
      ? 'https://join.meetaugust.ai/?c=web_app'
      : 'https://join.meetaugust.ai/?c=web_app_anon';
    window.open(downloadUrl, '_blank');
  };

  if (showSignUpModal) {
    return <SignUpModal />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 md:p-8 pointer-events-none">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 pointer-events-auto"
        onClick={onClose}
        style={{
          backgroundColor: '#D9D9D94D',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
        }}
      />

      {/* Modal */}
      <div
        className="relative w-full bg-white shadow-2xl overflow-hidden pointer-events-auto"
        style={{ borderRadius: '24px', maxWidth: '500px' }}
      >
        {/* Image Section */}
        <div
          className="relative w-full"
          style={{
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            overflow: 'hidden',
            paddingBottom: '55%'
          }}
        >
          <Image
            src="/assets/modal-signup.png"
            alt={t('share.cta.imageAlt', 'Ask your own health questions')}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content Section */}
        <div className="space-y-6" style={{ padding: '5%', paddingBottom: '8%' }}>
          {/* Description Text */}
          <p
            style={{
              fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              fontWeight: 400,
              fontSize: '17px',
              lineHeight: '22px',
              letterSpacing: '-0.01em',
              textAlign: 'center',
              color: '#8A9390',
            }}
          >
            {t('auth.signup.description')}<br />{t('auth.signup.trusted')}
          </p>

          {/* Buttons */}
          <div className="space-y-3 flex flex-col items-center w-full">
            {/* Download App button - Primary */}
            <button
              onClick={handleDownloadApp}
              className="flex justify-center items-center text-sm font-bold transition-colors hover:bg-[#1a5a46]"
              style={{
                width: '100%',
                padding: '3.5% 2%',
                borderRadius: '60px',
                background: '#206E55',
                color: 'white',
              }}
            >
              {t('share.cta.downloadApp', 'Download App')}
            </button>

            {/* OR Divider */}
            <div className="flex items-center w-full gap-3">
              <div className="flex-1 h-px bg-[#E5E5E5]" />
              <span className="text-sm text-[#8A9390]">{t('common.or')}</span>
              <div className="flex-1 h-px bg-[#E5E5E5]" />
            </div>

            {/* Login button - Secondary */}
            <button
              onClick={handleSignUp}
              className="flex justify-center items-center text-sm font-bold hover:bg-gray-50 transition-colors"
              style={{
                width: '100%',
                padding: '3.5% 2%',
                borderRadius: '60px',
                border: '1px solid #CACECD',
                background: '#FFF',
              }}
            >
              {t('common.login')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
