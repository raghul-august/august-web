'use client';

import { useEffect, useState, useCallback } from 'react';

declare global {
    interface Window {
        Razorpay: new (options: RazorpayCheckoutOptions) => {
            open(): void;
            close(): void;
            on(event: string, handler: (...args: unknown[]) => void): void;
        };
    }
}

export interface RazorpayCheckoutOptions {
    key: string;
    name: string;
    description?: string;
    order_id?: string;
    subscription_id?: string;
    amount?: number;
    currency?: string;
    handler: (response: {
        razorpay_order_id?: string;
        razorpay_subscription_id?: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }) => void;
    prefill?: {
        name?: string;
        contact?: string;
        email?: string;
    };
    readonly?: {
        email?: boolean;
        contact?: boolean;
        name?: boolean;
    };
    theme?: { color?: string };
    modal?: {
        ondismiss?: () => void;
        escape?: boolean;
    };
    notes?: Record<string, string>;
}

const CHECKOUT_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export function useRazorpay() {
    const [isLoaded, setIsLoaded] = useState(
        () => typeof window !== 'undefined' && !!window.Razorpay
    );

    useEffect(() => {
        if (typeof window === 'undefined' || isLoaded) return;

        const existing = document.querySelector(`script[src="${CHECKOUT_SCRIPT_URL}"]`);
        if (existing) {
            existing.addEventListener('load', () => setIsLoaded(true));
            return;
        }

        const script = document.createElement('script');
        script.src = CHECKOUT_SCRIPT_URL;
        script.async = true;
        script.onload = () => setIsLoaded(true);
        script.onerror = () => console.error('Failed to load Razorpay checkout script');
        document.body.appendChild(script);
    }, [isLoaded]);

    const openCheckout = useCallback(
        (options: RazorpayCheckoutOptions) => {
            if (!isLoaded || !window.Razorpay) {
                throw new Error('Razorpay SDK not loaded');
            }
            const rzp = new window.Razorpay(options);
            rzp.open();
        },
        [isLoaded]
    );

    return { isLoaded, openCheckout };
}
