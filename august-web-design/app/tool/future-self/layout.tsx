import type { Metadata } from 'next';
import { ChatAppProviders } from '@/app/components/chat-app-providers';
import { BASE_URL } from '@/app/utils/tools/tool-metadata';
import { FutureSelfShell } from './shell';
import '@/app/chat-app.css';

const OG_IMAGE = "https://assets.getbeyondhealth.com/og/tools-future-self.png";

export const metadata: Metadata = {
    metadataBase: new URL('https://www.meetaugust.ai'),
    title: 'Future Self — See How Your Habits Shape You',
    description: 'Upload a photo, answer 10 quick questions about your daily habits, and see a realistic projection of your face 10 years from now.',
    openGraph: {
        title: 'Future Self — See How Your Habits Shape You',
        description: 'Upload a photo, answer 10 quick questions about your daily habits, and see a realistic projection of your face 10 years from now.',
        url: 'https://www.meetaugust.ai/tool/future-self',
        type: 'website',
        siteName: 'August',
        images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Future Self — August' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Future Self — See How Your Habits Shape You',
        description: 'Upload a photo, answer 10 quick questions about your daily habits, and see a realistic projection of your face 10 years from now.',
        images: [OG_IMAGE],
    },
};

export default function FutureSelfLayout({ children }: { children: React.ReactNode }) {
    return (
        <ChatAppProviders>
            <>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
                <style>{`
                    html, body { background: #f5f1eb !important; }
                    .future-self-layout header { background: transparent !important; border-bottom: none !important; }
                    .future-self-layout { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif; }
                    .future-self-layout * { font-family: inherit; }
                    .future-self-layout { touch-action: pan-x pan-y; }
                `}</style>
                <FutureSelfShell>{children}</FutureSelfShell>
            </>
        </ChatAppProviders>
    );
}
