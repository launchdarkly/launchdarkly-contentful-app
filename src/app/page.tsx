'use client';

import React from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import { locations } from '@contentful/app-sdk';
import ConfigScreen from '../components/locations/ConfigScreen';
import PageComponent from '../components/locations/Page';
import EntryEditor from '../components/locations/EntryEditor';
import Sidebar from '../components/locations/Sidebar';

const Page = () => {
  try {
    console.log('Page component: Starting initialization');
    const sdk = useSDK();
    
    console.log('Page component: SDK initialized, current location:', sdk.location);

    const ComponentLocationMap = {
      [locations.LOCATION_APP_CONFIG]: ConfigScreen,
      [locations.LOCATION_ENTRY_EDITOR]: EntryEditor, // Add your editor component here
      [locations.LOCATION_ENTRY_SIDEBAR]: Sidebar, // Add your sidebar component here
      [locations.LOCATION_PAGE]: PageComponent, // Add your page component here
    };

    // Get the component for the current location
    const Component = Object.entries(ComponentLocationMap).find(([location]) =>
      sdk.location.is(location)
    )?.[1] || (() => {
      console.log('Page component: No matching location found');
      return null;
    });

    console.log('Page component: Rendering component for location');
    return <Component />;
  } catch (error) {
    console.error('Page component: Error during initialization:', error);
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        Error initializing app. Please check the console for details.
      </div>
    );
  }
};

export default Page;
