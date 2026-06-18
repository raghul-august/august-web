import type { Metadata } from 'next';
import { ChatAppProviders } from '@/app/components/chat-app-providers';
import { AppealAssistantShell } from './shell';
import '@/app/chat-app.css';

export const metadata: Metadata = {
    metadataBase: new URL('https://www.meetaugust.ai'),
    title: 'Appeal Assistant - Fight Your Insurance Denial',
    description: 'Upload your denial letter and get a personalized appeal drafted in minutes.',
    openGraph: {
        title: 'Appeal Assistant - Fight Your Insurance Denial',
        description: 'Upload your denial letter and get a personalized appeal drafted in minutes.',
        url: 'https://www.meetaugust.ai/tool/appeal-assistant',
        type: 'website',
        siteName: 'August',
        images: [{ url: 'https://assets.getbeyondhealth.com/og/appeal-assistant.png', width: 1200, height: 630, alt: 'Appeal Assistant' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Appeal Assistant - Fight Your Insurance Denial',
        description: 'Upload your denial letter and get a personalized appeal drafted in minutes.',
        images: ['https://assets.getbeyondhealth.com/og/appeal-assistant.png'],
    },
};

export default function AppealAssistantLayout({ children }: { children: React.ReactNode }) {
    return (
        <ChatAppProviders>
            <>
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
                <style>{`
                    html, body { background: #FAEEEF !important; }
                    .appeal-layout header { background: transparent !important; border-bottom: none !important; }
                    .appeal-layout { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif; }
                    .appeal-layout * { font-family: inherit; }
                `}</style>
                <AppealAssistantShell>{children}</AppealAssistantShell>
            </>
        </ChatAppProviders>
    );
}
