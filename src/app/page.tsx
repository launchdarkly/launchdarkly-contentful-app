'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { init, locations, ConfigAppSDK } from '@contentful/app-sdk';
import { GlobalStyles } from '@contentful/f36-components';
import { SDKProvider } from '@contentful/react-apps-toolkit';

import ConfigScreen from '@/components/locations/ConfigScreen';
import EntryEditor from '@/components/locations/EntryEditor';
import PageComponent from '@/components/locations/Page';

const ComponentLocationSettings = {
  [locations.LOCATION_APP_CONFIG]: ConfigScreen,
  [locations.LOCATION_ENTRY_EDITOR]: EntryEditor,
  [locations.LOCATION_PAGE]: PageComponent,
};

// Add timeout constant
const INITIALIZATION_TIMEOUT = 5000; // 5 seconds

export default function Page() {
  const [sdk, setSdk] = useState<any>(null);

  useEffect(() => {
    init((sdk) => {
      // Initialize the SDK with app context
      const initializedSdk = sdk as any;
      if (!initializedSdk.app) {
        initializedSdk.app = {
          action: {
            call: async (action: string, params: any) => {
              console.log(`Action called: ${action}`, params);
              // Add timeout to LaunchDarkly initialization
              if (action === 'waitForInitialization') {
                return new Promise((resolve) => {
                  setTimeout(() => {
                    resolve({ body: { initialized: true } });
                  }, INITIALIZATION_TIMEOUT);
                });
              }
              // Mock responses for LaunchDarkly actions
              switch (action) {
                case 'getFlags':
                  return Promise.resolve({
                    body: {
                      items: [],
                      total: 0
                    }
                  });
                case 'getEnvironments':
                  return Promise.resolve({
                    body: {
                      items: [
                        { key: 'production', name: 'Production' },
                        { key: 'development', name: 'Development' }
                      ]
                    }
                  });
                default:
                  return Promise.resolve({ body: {} });
              }
            }
          }
        };
      }
      setSdk(initializedSdk);
    });
  }, []);

  const Component = useMemo(() => {
    if (!sdk) return null;
    for (const [location, component] of Object.entries(ComponentLocationSettings)) {
      if (sdk.location.is(location)) {
        return { component, location };
      }
    }
    return null;
  }, [sdk]);

  if (!sdk || !Component) return null;

  if (Component.location === locations.LOCATION_APP_CONFIG) {
    const ConfigScreenComp = Component.component;
    return (
      <>
        <GlobalStyles />
        <SDKProvider>
          <ConfigScreenComp sdk={sdk as ConfigAppSDK} />
        </SDKProvider>
      </>
    );
  }

  const RenderComp = Component.component;
  return (
    <>
      <GlobalStyles />
      <SDKProvider>
        <RenderComp sdk={sdk as ConfigAppSDK} />
      </SDKProvider>
    </>
  );
}
