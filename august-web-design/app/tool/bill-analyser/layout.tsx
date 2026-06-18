import type { Metadata } from 'next';
import { ChatAppProviders } from '@/app/components/chat-app-providers';
import { BillAnalyserShell } from './shell';
import '@/app/chat-app.css';

export const metadata: Metadata = {
    metadataBase: new URL('https://www.meetaugust.ai'),
    title: 'Bill Analyser - Understand Your Medical Bills',
    description: 'Upload your medical bill and get a clear breakdown of charges, potential savings, and next steps in minutes.',
    openGraph: {
        title: 'Bill Analyser - Understand Your Medical Bills',
        description: 'Upload your medical bill and get a clear breakdown of charges, potential savings, and next steps in minutes.',
        url: 'https://www.meetaugust.ai/tool/bill-analyser',
        type: 'website',
        siteName: 'August',
        images: [{ url: 'https://assets.getbeyondhealth.com/og/bill-analyser.png', width: 1200, height: 630, alt: 'Bill Analyser' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Bill Analyser - Understand Your Medical Bills',
        description: 'Upload your medical bill and get a clear breakdown of charges, potential savings, and next steps in minutes.',
        images: ['https://assets.getbeyondhealth.com/og/bill-analyser.png'],
    },
};

export default function BillAnalyserLayout({ children }: { children: React.ReactNode }) {
    return (
        <ChatAppProviders>
            <>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
                <style>{`
                    html, body { background: #f5f1eb !important; }
                    .bill-analyser-layout header { background: transparent !important; border-bottom: none !important; }
                    .bill-analyser-layout { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif; }
                    .bill-analyser-layout * { font-family: inherit; }
                    .bill-analyser-layout { touch-action: pan-x pan-y; }
                `}</style>
                <BillAnalyserShell>{children}</BillAnalyserShell>
            </>
        </ChatAppProviders>
    );
}
