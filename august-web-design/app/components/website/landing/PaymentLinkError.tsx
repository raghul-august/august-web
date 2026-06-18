'use client';

type Reason =
    | 'checkout_link_not_found'
    | 'checkout_link_expired'
    | 'checkout_link_completed'
    | 'checkout_link_lookup_failed'
    | 'network_error';

const COPY: Record<Reason, { title: string; body: string }> = {
    checkout_link_not_found: {
        title: "We couldn't find this link",
        body: 'The payment link is invalid or may have been mistyped. Please request a fresh link from your August chat.',
    },
    checkout_link_expired: {
        title: 'This link has expired',
        body: 'For your security, payment links are only valid for a short window. Please request a new one from your August chat.',
    },
    checkout_link_completed: {
        title: 'This link has already been used',
        body: 'This payment link has been used to complete a checkout. If you need to make another change, please request a fresh link from your August chat.',
    },
    checkout_link_lookup_failed: {
        title: 'Something went wrong',
        body: "We couldn't verify this payment link right now. Please try again in a moment, or reach out to support if this keeps happening.",
    },
    network_error: {
        title: 'Connection issue',
        body: "We couldn't reach our servers. Please check your connection and try again.",
    },
};

export default function PaymentLinkError({ reason }: { reason: Reason }) {
    const { title, body } = COPY[reason];

    return (
        <main className="relative h-full w-full" style={{ background: '#FAF9F5' }}>
            <div className="mx-auto flex h-full max-w-[640px] flex-col justify-center px-6 py-16 sm:px-10">
                <div
                    style={{
                        fontFamily: "'Geist', ui-monospace, monospace",
                        fontSize: '10px',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: 'rgba(28, 25, 23, 0.52)',
                        marginBottom: '18px',
                    }}
                >
                    <span style={{ color: '#206E55', fontWeight: 600 }}>Payment link</span>
                </div>

                <h1
                    style={{
                        fontFamily: "'Inter Display', sans-serif",
                        fontSize: 'clamp(28px, 3.6vw, 38px)',
                        fontWeight: 300,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.15,
                        color: '#1C1917',
                        marginBottom: '12px',
                    }}
                >
                    {title}
                </h1>
                <p
                    style={{
                        fontSize: 'clamp(15px, 1.3vw, 17px)',
                        fontWeight: 300,
                        lineHeight: 1.6,
                        color: 'rgba(28, 25, 23, 0.72)',
                        marginBottom: '28px',
                    }}
                >
                    {body}
                </p>

                <p
                    style={{
                        fontSize: '14px',
                        fontWeight: 400,
                        color: 'rgba(28, 25, 23, 0.72)',
                    }}
                >
                    Still stuck? Email{' '}
                    <a href="mailto:support@meetaugust.ai" style={{ color: '#206E55', textDecoration: 'underline' }}>
                        support@meetaugust.ai
                    </a>
                    .
                </p>
            </div>
        </main>
    );
}
