'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { requestOtp, verifyOtp } from '@/services/auth-service';
import { updateUserDisplayName } from '@/services/user-service';
import logger from '@/utils/logger';
import { serializeError } from '@/services/error-reporter';

type ModalStep = 'form' | 'otp';

interface ToolLoginModalProps {
    title: string;
    description: string;
    onSuccess: () => void;
}

export function ToolLoginModal({ title, description, onSuccess }: ToolLoginModalProps) {
    const [step, setStep] = useState<ModalStep>('form');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [requestId, setRequestId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resendTimer, setResendTimer] = useState(0);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleSendOtp = async () => {
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await requestOtp({ method: 'email', email });
            if (response.requestId) {
                setRequestId(response.requestId);
                setStep('otp');
                setResendTimer(30);
                setTimeout(() => otpRefs.current[0]?.focus(), 100);
            } else {
                setError('Failed to send code. Try again.');
            }
        } catch (err) {
            logger.error('Tool login request OTP error', serializeError(err));
            setError('Failed to send code. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            setError('Enter the 6-digit code');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await verifyOtp({
                method: 'email',
                requestId,
                otp: otpValue,
                email,
            });

            if (response.accessToken) {

                try {
                    await updateUserDisplayName(name.trim());
                } catch (err) {
                    logger.error('Failed to update display name after tool login', serializeError(err));
                }

                onSuccess();
            } else {
                setError('Invalid code. Please try again.');
            }
        } catch (err) {
            logger.error('Tool login verify OTP error', serializeError(err));
            setError('Invalid code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            const digits = value.replace(/\D/g, '').slice(0, 6).split('');
            const newOtp = [...otp];
            digits.forEach((digit, i) => {
                if (index + i < 6) newOtp[index + i] = digit;
            });
            setOtp(newOtp);
            const nextIndex = Math.min(index + digits.length, 5);
            otpRefs.current[nextIndex]?.focus();
        } else {
            const newOtp = [...otp];
            newOtp[index] = value.replace(/\D/g, '');
            setOtp(newOtp);
            if (value && index < 5) otpRefs.current[index + 1]?.focus();
        }
        setError(null);
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleResend = () => {
        if (resendTimer > 0) return;
        handleSendOtp();
    };

    const handleEditEmail = () => {
        setOtp(['', '', '', '', '', '']);
        setStep('form');
    };

    const isOtpComplete = otp.every((d) => d !== '');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
            <div
                className="absolute inset-0"
                style={{
                    backgroundColor: 'rgba(42, 42, 36, 0.25)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                }}
            />
            <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                role="dialog"
                aria-modal="true"
                className="relative w-full max-w-sm rounded-3xl p-8"
                style={{
                    background: 'rgba(255, 255, 255, 0.96)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 12px 40px rgba(42, 42, 36, 0.12)',
                }}
            >
                <div className="text-center mb-5">
                    <div
                        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                        style={{ background: 'linear-gradient(180deg, #F1FFF7 0%, #D8F5E5 100%)' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#4d8b77" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-medium tracking-tight text-[#302e28]">{title}</h2>
                    <p className="text-sm text-[#6b6860] mt-1">{description}</p>
                </div>

                {step === 'form' && (
                    <div className="space-y-3">
                        <Input
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError(null); }}
                            className="h-12 text-base border-gray-200 rounded-xl"
                            autoFocus
                        />
                        <Input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(null); }}
                            className="h-12 text-base border-gray-200 rounded-xl"
                        />
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        <Button
                            onClick={handleSendOtp}
                            disabled={isLoading || !name.trim() || !email.trim()}
                            className="w-full h-12 rounded-full bg-[#4d8b77] hover:bg-[#3d7a67] active:scale-[0.97] text-base font-medium transition-transform"
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Continue'}
                        </Button>
                    </div>
                )}

                {step === 'otp' && (
                    <div className="space-y-4">
                        <p className="text-sm text-[#6b6860] text-center">
                            We sent a 6-digit code to
                            <br />
                            <span className="text-[#302e28] font-medium">{email}</span>
                            <button
                                type="button"
                                onClick={handleEditEmail}
                                className="ml-2 text-[#4d8b77] hover:underline text-sm"
                            >
                                Edit
                            </button>
                        </p>

                        <div className="flex justify-center gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { otpRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    className="w-10 h-12 text-center text-lg font-semibold border-2 border-gray-200 rounded-xl focus:border-[#4d8b77] focus:ring-0 focus:outline-none transition-colors"
                                />
                            ))}
                        </div>

                        <div className="text-center">
                            {resendTimer > 0 ? (
                                <p className="text-sm text-gray-400">Resend in {resendTimer}s</p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={isLoading}
                                    className="text-sm text-[#4d8b77] hover:underline"
                                >
                                    Resend code
                                </button>
                            )}
                        </div>

                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                        <Button
                            onClick={handleVerifyOtp}
                            disabled={isLoading || !isOtpComplete}
                            className="w-full h-12 rounded-full bg-[#4d8b77] hover:bg-[#3d7a67] active:scale-[0.97] text-base font-medium transition-transform"
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify and continue'}
                        </Button>
                    </div>
                )}

                <p className="text-xs text-center text-gray-400 mt-4">
                    By continuing you agree to our{' '}
                    <a href="https://www.meetaugust.ai/terms" target="_blank" rel="noopener noreferrer" className="underline">Terms</a>
                    {' '}and{' '}
                    <a href="https://www.meetaugust.ai/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacy</a>
                </p>
            </motion.div>
        </div>
    );
}
