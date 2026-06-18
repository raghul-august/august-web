import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'August AI — #1 Health AI in the World',
  description: 'Scored 100% on the US Medical Licensing Exam. Trusted by over 6 million people. Free, HIPAA secure, and built by doctors.',
  openGraph: {
    title: 'August AI — #1 Health AI in the World',
    description: 'Scored 100% on the US Medical Licensing Exam. Trusted by over 6 million people. Free, HIPAA secure, and built by doctors.',
    url: 'https://www.meetaugust.ai/share',
    siteName: 'August AI',
    images: [
      {
        url: 'https://assets.getbeyondhealth.com/share-og.png',
        width: 1200,
        height: 630,
        alt: 'August AI - Your AI Health Companion',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'August AI — #1 Health AI in the World',
    description: 'Scored 100% on the US Medical Licensing Exam. Trusted by over 6 million people. Free, HIPAA secure, and built by doctors.',
    images: ['https://assets.getbeyondhealth.com/share-og.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}