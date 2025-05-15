'use client';

import { GlobalStyles } from '@contentful/f36-components';
import { SDKProvider } from '@contentful/react-apps-toolkit';
import { ContentTypesProvider } from '@/components/EntryEditor/contexts/ContentTypesContext';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SDKProvider>
      <ContentTypesProvider>
        <GlobalStyles />
        {children}
      </ContentTypesProvider>
    </SDKProvider>
  );
} 