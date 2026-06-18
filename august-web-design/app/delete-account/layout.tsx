import { ChatAppProviders } from '@/app/components/chat-app-providers';
import '@/app/chat-app.css';

export default function DeleteAccountLayout({ children }: { children: React.ReactNode }) {
  return <ChatAppProviders>{children}</ChatAppProviders>;
}
