"use client";

import React from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import { locations } from "@contentful/app-sdk";
import ConfigScreen from "../components/locations/ConfigScreen";
import PageComponent from "../components/locations/Page";
import EntryEditor from "../components/locations/EntryEditor";
import Sidebar from "../components/locations/Sidebar";

const Page = () => {
  const sdk = useSDK();

  let Component: React.ComponentType<any> | null = null;
  try {
    const ComponentLocationMap = {
      [locations.LOCATION_APP_CONFIG]: ConfigScreen,
      [locations.LOCATION_ENTRY_EDITOR]: EntryEditor,
      [locations.LOCATION_ENTRY_SIDEBAR]: Sidebar,
      [locations.LOCATION_PAGE]: PageComponent,
    };

    Component = Object.entries(ComponentLocationMap).find(([location]) =>
      sdk.location.is(location)
    )?.[1] || null;
  } catch (error) {
    console.error("Page component: Error during initialization:", error);
    return (
      <div style={{ padding: "2rem", color: "red" }}>
        Error initializing app. Please check the console for details.
      </div>
    );
  }

  if (!Component) {
    console.log("Page component: No matching location found");
    return null;
  }

  return <Component />;
};

export default Page;
