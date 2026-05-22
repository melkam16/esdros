// app/apply/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply to Esdros Theological Seminary — Application Portal',
  description:
    'Submit your application to the Esdros Theological Seminary Studies or Geez Language program. Applications are open for the 2026 academic year.',
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
