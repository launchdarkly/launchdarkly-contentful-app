'use client';

import { GlobalStyles } from '@contentful/f36-components';
import { SDKProvider } from '@contentful/react-apps-toolkit';
import { ContentTypesProvider } from '@/components/EntryEditor/contexts/ContentTypesContext';
import { useSDK } from '@contentful/react-apps-toolkit';
import { locations } from '@contentful/app-sdk';

// Wrapper component that only renders ContentTypesProvider when needed
const ContentTypesWrapper = ({ children }: { children: React.ReactNode }) => {
  try {
    const sdk = useSDK();
    // Only use ContentTypesProvider for entry editor/sidebar locations
    if (sdk.location.is(locations.LOCATION_ENTRY_EDITOR) || 
        sdk.location.is(locations.LOCATION_ENTRY_SIDEBAR)) {
      return <ContentTypesProvider>{children}</ContentTypesProvider>;
    }
  } catch (error) {
    console.error('Error in ContentTypesWrapper:', error);
  }
  return <>{children}</>;
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SDKProvider>
      <GlobalStyles />
      <ContentTypesWrapper>
        {children}
      </ContentTypesWrapper>
    </SDKProvider>
  );
} 