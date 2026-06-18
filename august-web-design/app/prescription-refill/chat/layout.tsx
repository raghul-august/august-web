import type { Metadata, Viewport } from 'next';
import { ChatAppProviders } from '@/app/components/chat-app-providers';
import '@/app/chat-app.css';

export const metadata: Metadata = {
  title: 'Prescription Refill Chat',
  description: 'Private prescription refill support with August',
};

export const viewport: Viewport = {
  themeColor: '#206E55',
  viewportFit: 'cover',
};

export default function PrescriptionRefillChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ChatAppProviders>{children}</ChatAppProviders>;
}
