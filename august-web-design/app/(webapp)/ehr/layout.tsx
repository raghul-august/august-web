import type { Metadata } from 'next';
import { EhrShell } from './shell';

export const metadata: Metadata = {
  title: 'Health Records — August',
};

export default function EhrLayout({ children }: { children: React.ReactNode }) {
  return <EhrShell>{children}</EhrShell>;
}
