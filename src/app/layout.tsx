import './globals.css';
import ClientLayout from './ClientLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LaunchDarkly Contentful App',
  description: 'LaunchDarkly integration for Contentful',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
} 