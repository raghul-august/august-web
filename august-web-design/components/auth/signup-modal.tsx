'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useLoginModalStore } from '@/stores/login-modal-store';
import { Loader2, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { requestOtp, verifyOtp } from '@/services/auth-service';
import { OAuthButtons } from '@/components/auth';
import { AuthSDKLoader } from './auth-sdk-loader';
import { countryCodes } from '@/lib/country-codes';
import { track } from '@/services/analytics-service';
import { getTelehealthBaseParams } from '@/services/telehealth-analytics';
import { trackClevertap } from '@/utils/clevertap';
import Image from 'next/image';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';
import { useI18n } from '@/components/providers';
import { usePhoneOtpAvailability } from '@/lib/phone-otp';
import { getLocationInfo } from '@/services/location-service';
import Cookies from 'js-cookie';
import { Phone, EnvelopeSimple } from '@phosphor-icons/react';

type ModalStep = 'welcome' | 'phone' | 'email' | 'otp';
type OtpMethod = 'phone' | 'email';
const MEMORY_STORAGE_KEY = 'health_memory_transfer';
const COUNTRY_CODE_COOKIE = 'august_country_code';
const CLEVERTAP_DENIED_ROUTES = [/^\/tool\//];
const isClevertapAllowed = () =>
  typeof window !== 'undefined' &&
  !CLEVERTAP_DENIED_ROUTES.some(r => r.test(window.location.pathname));

function getInitialCountry() {
  if (typeof window !== 'undefined') {
    const cookieCode = Cookies.get(COUNTRY_CODE_COOKIE)?.trim().toUpperCase();
    if (cookieCode) {
      const match = countryCodes.find(c => c.code === cookieCode);
      if (match) return match;
    }
  }
  return countryCodes.find(c => c.code === 'IN') || countryCodes[0]!;
}

interface CountryCodeType {
  name: string;
  dial_code: string;
  code: string;
  flag: string;
}

interface SignUpModalProps {
  /** Whether tapping the backdrop dismisses the modal. Falls to false when
   *  the modal is acting as a forced-login gate (e.g. /chat without anon). */
  dismissible?: boolean;
  /** Called when the user dismisses via backdrop tap. */
  onDismiss?: () => void;
}

export function SignUpModal({ dismissible = false, onDismiss }: SignUpModalProps = {}) {
  const router = useRouter();
  const [step, setStep] = useState<ModalStep>('welcome');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otpMethod, setOtpMethod] = useState<OtpMethod>('phone');
  const [selectedCountry, setSelectedCountry] = useState(getInitialCountry);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [requestId, setRequestId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [isMemoryTransfer, setIsMemoryTransfer] = useState(false);
  const isPhoneOtpAllowed = usePhoneOtpAvailability();

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { t } = useI18n();

  useEffect(() => {
    try {
      const memoryValue = sessionStorage.getItem(MEMORY_STORAGE_KEY);
      setIsMemoryTransfer(!!memoryValue);
    } catch {
    }
  }, []);
  useEffect(() => {
    const cookieCode = Cookies.get(COUNTRY_CODE_COOKIE)?.trim().toUpperCase();
    const countryCode = cookieCode || getLocationInfo()?.countryCode;
    if (countryCode) {
      const detectedCountry = countryCodes.find(c => c.code === countryCode);
      if (detectedCountry) {
        setSelectedCountry(detectedCountry);
        return;
      }
    }
  }, []);

  useEffect(() => {
    track('login_modal_seen', getTelehealthBaseParams());
    isClevertapAllowed() && trackClevertap('Modal Displayed', { name: 'login' });
  }, []);

  useEffect(() => {
    if (!isPhoneOtpAllowed && step !== 'welcome') {
      setStep('welcome');
      setError(null);
    }
  }, [isPhoneOtpAllowed, step]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handlePhoneBack = () => {
    track('phone_otp_cancel', { login_type: 'phone' });
    isClevertapAllowed() && trackClevertap('Back Button Clicked', { page: 'Request OTP' });
    setStep('welcome');
  };

  const handleEmailBack = () => {
    track('phone_otp_cancel', { login_type: 'email' });
    isClevertapAllowed() && trackClevertap('Back Button Clicked', { page: 'Request OTP' });
    setStep('welcome');
  };

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      setError(t('auth.errors.enterPhone'));
      return;
    }

    const formattedPhone = `${selectedCountry.dial_code}${phoneNumber.replace(/^0+/, '')}`;

    track('phone_otp_continue', {
      login_type: 'phone',
      country_code: selectedCountry.code,
    });
    isClevertapAllowed() && trackClevertap('Login Button Clicked', { type: 'request-otp' });

    setIsLoading(true);
    setError(null);

    try {
      const response = await requestOtp({ phoneNumber: formattedPhone });

      if (response.requestId) {
        setRequestId(response.requestId);
        setOtpMethod('phone');
        setStep('otp');
        setResendTimer(30);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setError(t('auth.errors.sendOtp'));
      }
    } catch (err) {
      logger.error('Request OTP error', serializeError(err));
      setError(t('auth.errors.sendOtpInvalid'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!email.trim()) {
      setError(t('auth.errors.enterEmail'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('auth.errors.invalidEmail'));
      return;
    }

    track('email_otp_continue', { login_type: 'email' });
    isClevertapAllowed() && trackClevertap('Login Button Clicked', { type: 'request-otp' });

    setIsLoading(true);
    setError(null);

    try {
      const response = await requestOtp({ method: 'email', email });

      if (response.requestId) {
        setRequestId(response.requestId);
        setOtpMethod('email');
        setStep('otp');
        setResendTimer(30);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setError(t('auth.errors.sendOtp'));
      }
    } catch (err) {
      logger.error('Request Email OTP error', serializeError(err));
      setError(t('auth.errors.sendOtp'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError(t('auth.errors.enterOtp'));
      return;
    }

    track(`${otpMethod}_otp_verify`, {
      login_type: otpMethod,
      otp_length: otpValue.length,
    });
    isClevertapAllowed() && trackClevertap('Login Button Clicked', { type: 'verify-otp' });

    setIsLoading(true);
    setError(null);

    try {
      let response;
      if (otpMethod === 'email') {
        response = await verifyOtp({
          method: 'email',
          requestId,
          otp: otpValue,
          email,
        });
      } else {
        const formattedPhone = `${selectedCountry.dial_code}${phoneNumber.replace(/^0+/, '')}`;
        response = await verifyOtp({
          requestId,
          otp: otpValue,
          phone: formattedPhone,
        });
      }

      if (response.accessToken) {
        track('login_completed', { ...getTelehealthBaseParams(), login_type: otpMethod });
        isClevertapAllowed() && trackClevertap('Login Completed', { type: otpMethod === 'email' ? 'Email' : 'Phone' });
        // Close the modal — auth state flipped, LoginModalWatcher will hide
        // the modal automatically and the underlying page re-renders signed in.
        useLoginModalStore.getState().close();
        router.refresh();
      } else {
        setError(t('auth.errors.invalidOtp'));
      }
    } catch (err) {
      logger.error('Verify OTP error', serializeError(err));
      setError(t('auth.errors.invalidOtp'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value.replace(/\D/g, '');
      setOtp(newOtp);
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
    setError(null);
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOAuthSuccess = () => {
    useLoginModalStore.getState().close();
    router.refresh();
  };

  const handleOAuthError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handlePhoneClick = () => {
    track('login_button_clicked', { login_type: 'phone' });
    isClevertapAllowed() && trackClevertap('Login Button Clicked', { type: 'request-otp' });
    setStep('phone');
  };

  const handleEmailClick = () => {
    track('login_button_clicked', { login_type: 'email' });
    isClevertapAllowed() && trackClevertap('Login Button Clicked', { type: 'email' });
    setStep('email');
  };

  const handleResendOtp = () => {
    if (otpMethod === 'email') {
      handleSendEmailOtp();
    } else {
      handleSendOtp();
    }
  };

  const handleOtpEdit = () => {
    setOtp(['', '', '', '', '', '']);
    setStep(otpMethod === 'email' ? 'email' : 'phone');
  };

  const displayPhoneNumber = `${selectedCountry.dial_code} ${phoneNumber}`;

  return (
    <AuthSDKLoader>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 md:p-8 pointer-events-none">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 pointer-events-auto"
        onClick={() => {
          if (dismissible) onDismiss?.();
        }}
        style={{
          backgroundColor: '#D9D9D94D',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
        }}
      />

      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        async
        defer
      />
      {/* Modal */}
      <div role="dialog" aria-modal="true" className="relative w-full bg-[#FAF9F5] shadow-2xl overflow-hidden pointer-events-auto" style={{ borderRadius: '24px', maxWidth: '500px' }}>
        {/* Image Section */}
        <div className="relative w-full" style={{ borderTopLeftRadius: '24px', borderTopRightRadius: '24px', overflow: 'hidden', paddingBottom: '55%' }}>
          <Image
            src="/assets/modal-signup.png"
            alt={t('auth.heroAlt')}
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-cover"
            priority
          />
        </div>

        {/* Content Section */}
        <div className="space-y-6" style={{ padding: '5%', paddingBottom: '8%' }}>
          {step === 'welcome' && (
            <>
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
                {isMemoryTransfer ? t('auth.signup.memoryTransfer') : t('auth.signup.description')}
              </p>

              {/* OAuth Buttons */}
              <div className="space-y-3 flex flex-col items-center w-full">
                <OAuthButtons onSuccess={handleOAuthSuccess} onError={handleOAuthError} />

                {/* OR Divider */}
                <div className="flex items-center w-full gap-3 py-1">
                  <svg className="flex-1 h-px" viewBox="0 0 159 1" fill="none" preserveAspectRatio="none">
                    <path d="M159 0.25L0 0.25" stroke="url(#orLineLeft)" strokeWidth="0.5"/>
                    <defs>
                      <linearGradient id="orLineLeft" x1="0" y1="-0.25" x2="159" y2="-0.25" gradientUnits="userSpaceOnUse">
                        <stop stopOpacity="0"/>
                        <stop offset="1" stopColor="#000"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="text-xs text-gray-400 font-medium">{t('common.or')}</span>
                  <svg className="flex-1 h-px" viewBox="0 0 159 1" fill="none" preserveAspectRatio="none">
                    <path d="M0 0.25L159 0.25" stroke="url(#orLineRight)" strokeWidth="0.5"/>
                    <defs>
                      <linearGradient id="orLineRight" x1="159" y1="-0.25" x2="0" y2="-0.25" gradientUnits="userSpaceOnUse">
                        <stop stopOpacity="0"/>
                        <stop offset="1" stopColor="#000"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Email and Phone Buttons - Side by Side */}
                <div className="flex gap-3 w-full">
                  {/* Email Button */}
                  <button
                    onClick={handleEmailClick}
                    className="flex-1 flex justify-center items-center hover:bg-[#EDEBE5] transition-colors"
                    style={{
                      padding: '3.5% 2%',
                      gap: '2%',
                      borderRadius: '60px',
                      border: '1px solid #CACECD',
                    }}
                  >
                    <EmailIcon />
                    <span className="text-sm font-medium">{t('auth.email')}</span>
                  </button>

                  {/* Phone Button */}
                  {isPhoneOtpAllowed && (
                    <button
                      onClick={handlePhoneClick}
                      className="flex-1 flex justify-center items-center hover:bg-[#EDEBE5] transition-colors"
                      style={{
                        padding: '3.5% 2%',
                        gap: '2%',
                        borderRadius: '60px',
                        border: '1px solid #CACECD',
                      }}
                    >
                      <PhoneIcon />
                      <span className="text-sm font-medium">{t('auth.phone')}</span>
                    </button>
                  )}
                </div>

                <div className="flex justify-center w-full">
                  <div
                    className="cf-turnstile"
                    data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                    data-theme="light"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
            </>
          )}

          {step === 'phone' && isPhoneOtpAllowed && (
            <PhoneStep
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              onSubmit={handleSendOtp}
              onBack={handlePhoneBack}
              isLoading={isLoading}
              error={error}
            />
          )}

          {step === 'email' && (
            <EmailStep
              email={email}
              setEmail={setEmail}
              onSubmit={handleSendEmailOtp}
              onBack={handleEmailBack}
              isLoading={isLoading}
              error={error}
            />
          )}

          {step === 'otp' && (
            <OtpStep
              otp={otp}
              otpRefs={otpRefs}
              onOtpChange={handleOtpChange}
              onOtpKeyDown={handleOtpKeyDown}
              identifier={otpMethod === 'email' ? email : displayPhoneNumber}
              identifierType={otpMethod}
              onSubmit={handleVerifyOtp}
              onResend={handleResendOtp}
              onEdit={handleOtpEdit}
              isLoading={isLoading}
              error={error}
              resendTimer={resendTimer}
            />
          )}
        <p className="text-xs text-center text-gray-400">
          {t('common.legalPrefix')}{' '}
          <a
            href="https://www.meetaugust.ai/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400] font-semibold"
          >
            {t('common.termsShort')}
          </a>{' '}
          {t('common.and')}{' '}
          <a
            href="https://www.meetaugust.ai/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 font-semibold"
          >
            {t('common.privacyShort')}
          </a>
        </p>
      </div>
      </div>
    </div>
    </AuthSDKLoader>
  );
}

function PhoneIcon() {
  return <Phone size={20} />;
}

function EmailIcon() {
  return <EnvelopeSimple size={20} weight="light" />;
}

interface PhoneStepProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  selectedCountry: CountryCodeType;
  setSelectedCountry: (country: CountryCodeType) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

function PhoneStep({
  phoneNumber,
  setPhoneNumber,
  selectedCountry,
  setSelectedCountry,
  onSubmit,
  onBack,
  isLoading,
  error,
}: PhoneStepProps) {
  const [countrySearch, setCountrySearch] = useState('');
  const [countryPopoverOpen, setCountryPopoverOpen] = useState(false);
  const hasTrackedInputFocusRef = useRef(false);
  const { t } = useI18n();

  const filteredCountries = countryCodes.filter(
    (country) =>
      country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      country.dial_code.includes(countrySearch)
  );

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">{t('auth.phoneStep.title')}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {t('auth.phoneStep.subtitle')}
        </p>
      </div>

      <div className="flex gap-2">
        {/* Country Code Selector */}
        <Popover open={countryPopoverOpen} onOpenChange={setCountryPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-12 px-3 flex items-center gap-1.5 shrink-0 border-gray-200 min-w-0"
            >
              <span className="text-xl leading-none">{selectedCountry.flag}</span>
              <span className="text-sm text-gray-700">{selectedCountry.dial_code}</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('auth.phoneStep.searchPlaceholder')}
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    setSelectedCountry(country);
                    setCountryPopoverOpen(false);
                    setCountrySearch('');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#EDEBE5] text-left"
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="flex-1 text-sm">{country.name}</span>
                  <span className="text-sm text-gray-400">
                    {country.dial_code}
                  </span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Phone Number Input */}
        <Input
          type="tel"
          placeholder={t('auth.phoneStep.phonePlaceholder')}
          value={phoneNumber}
          onFocus={() => {
            if (!hasTrackedInputFocusRef.current) {
              track('phone_otp_input_focus', { login_type: 'phone' });
              isClevertapAllowed() && trackClevertap('Started Typing Phone Number', {});
              hasTrackedInputFocusRef.current = true;
            }
          }}
          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
          className="h-12 text-base flex-1 border-gray-200"
          autoFocus
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      <Button
        onClick={onSubmit}
        disabled={isLoading || !phoneNumber.trim()}
        className="w-full h-12 rounded-full bg-[#206E55] hover:bg-[#1a5a46] text-base font-medium"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          t('common.continue')
        )}
      </Button>
      <button
        type="button"
        onClick={onBack}
        className="w-full text-sm text-gray-500 hover:text-gray-700 underline-offset-4 hover:underline"
      >
        {t('auth.tryOtherOptions')}
      </button>
    </div>
  );
}

interface EmailStepProps {
  email: string;
  setEmail: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

function EmailStep({
  email,
  setEmail,
  onSubmit,
  onBack,
  isLoading,
  error,
}: EmailStepProps) {
  const hasTrackedInputFocusRef = useRef(false);
  const { t } = useI18n();

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">{t('auth.emailStep.title')}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {t('auth.emailStep.subtitle')}
        </p>
      </div>

      <Input
        type="email"
        placeholder={t('auth.emailStep.emailPlaceholder')}
        value={email}
        onFocus={() => {
          if (!hasTrackedInputFocusRef.current) {
            hasTrackedInputFocusRef.current = true;
          }
        }}
        onChange={(e) => setEmail(e.target.value)}
        className="h-12 text-base border-gray-200"
        autoFocus
      />

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      <Button
        onClick={onSubmit}
        disabled={isLoading || !email.trim()}
        className="w-full h-12 rounded-full bg-[#206E55] hover:bg-[#1a5a46] text-base font-medium"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          t('common.continue')
        )}
      </Button>
      <button
        type="button"
        onClick={onBack}
        className="w-full text-sm text-gray-500 hover:text-gray-700 underline-offset-4 hover:underline"
      >
        {t('auth.tryOtherOptions')}
      </button>
    </div>
  );
}

interface OtpStepProps {
  otp: string[];
  otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onOtpChange: (index: number, value: string) => void;
  onOtpKeyDown: (index: number, e: React.KeyboardEvent) => void;
  identifier: string;
  identifierType: 'phone' | 'email';
  onSubmit: () => void;
  onResend: () => void;
  onEdit: () => void;
  isLoading: boolean;
  error: string | null;
  resendTimer: number;
}

function OtpStep({
  otp,
  otpRefs,
  onOtpChange,
  onOtpKeyDown,
  identifier,
  identifierType,
  onSubmit,
  onResend,
  onEdit,
  isLoading,
  error,
  resendTimer,
}: OtpStepProps) {
  const isComplete = otp.every(digit => digit !== '');
  const handleResendClick = () => {
    track(`${identifierType}_otp_resend`, { ...getTelehealthBaseParams(), login_type: identifierType });
    isClevertapAllowed() && trackClevertap('Login Button Clicked', { type: 'resend-otp' });
    onResend();
  };
  const { t } = useI18n();

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">{t('auth.otpStep.title')}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {identifierType === 'email' ? t('auth.otpStep.subtitleEmail') : t('auth.otpStep.subtitle')}
        </p>
        <p className="text-sm text-gray-700 font-medium mt-1">
          {identifier}
          <button
            onClick={onEdit}
            className="ml-2 text-[#206E55] hover:underline"
          >
            {t('common.edit')}
          </button>
        </p>
      </div>

      {/* OTP Input Boxes */}
      <div className="flex justify-center gap-2 px-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { otpRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={digit}
            onChange={(e) => onOtpChange(index, e.target.value)}
            onKeyDown={(e) => onOtpKeyDown(index, e)}
            className="w-10 h-12 text-center text-lg font-semibold border-2 border-gray-200 rounded-xl focus:border-[#206E55] focus:ring-0 focus:outline-none transition-colors"
          />
        ))}
      </div>

      {/* Resend */}
      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-sm text-gray-400">
            {t('auth.otpStep.resendWithTimer', { seconds: resendTimer })}
          </p>
        ) : (
          <button
            onClick={handleResendClick}
            disabled={isLoading}
            className="text-sm text-[#206E55] hover:underline"
          >
            {t('auth.otpStep.resend')}
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      <Button
        onClick={onSubmit}
        disabled={isLoading || !isComplete}
        className="w-full h-12 rounded-full bg-[#206E55] hover:bg-[#1a5a46] text-base font-medium"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          t('common.continue')
        )}
      </Button>
    </div>
  );
}
