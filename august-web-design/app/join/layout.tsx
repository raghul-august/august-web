import { ChatAppProviders } from '@/app/components/chat-app-providers';
import '@/app/chat-app.css';

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <ChatAppProviders>{children}</ChatAppProviders>;
}
