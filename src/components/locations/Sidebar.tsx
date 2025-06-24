'use client';

import React, { useEffect, useState } from 'react';
import { SidebarAppSDK } from '@contentful/app-sdk';
import { Note, Spinner } from '@contentful/f36-components';
import { useSDK, useCMA } from '@contentful/react-apps-toolkit';
import { LAUNCHDARKLY_FEATURE_FLAG_CONTENT_TYPE } from '../../utils/constants';

const Sidebar = () => {
  const sdk = useSDK<SidebarAppSDK>();
  const cma = useCMA();
  const [isFlagged, setIsFlagged] = useState<boolean | null>(null);

  useEffect(() => {
    const checkReferences = async () => {
      const entryId = sdk.entry.getSys().id;
      // Query for entries of the LaunchDarkly flag type that reference this entry
      const referencing = await cma.entry.getMany({
        'links_to_entry': entryId,
        'content_type': LAUNCHDARKLY_FEATURE_FLAG_CONTENT_TYPE,
        limit: 1,
      } as any);
      setIsFlagged(referencing.items.length > 0);
    };
    checkReferences();
  }, [sdk, cma]);

  if (isFlagged === null) return <Spinner />;
  if (isFlagged) {
    return (
      <Note variant="warning">
        This entry is associated with a LaunchDarkly Feature Flag. Please do not edit it while the experiment is running.
      </Note>
    );
  }
  return null;
};

export default Sidebar; 