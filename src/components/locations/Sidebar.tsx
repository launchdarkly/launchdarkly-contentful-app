'use client';

import React, { useEffect, useState } from 'react';
import { SidebarAppSDK } from '@contentful/app-sdk';
import { Note, Spinner, Text, Stack, Box, Flex } from '@contentful/f36-components';
import { useSDK, useCMA } from '@contentful/react-apps-toolkit';
import { LAUNCHDARKLY_FEATURE_FLAG_CONTENT_TYPE } from '../../utils/constants';

interface FlagReference {
  flagKey: string;
  flagName: string;
  variationIndex: number;
  variationName: string;
  entryId: string;
  entryTitle: string;
}

const Sidebar = () => {
  const sdk = useSDK<SidebarAppSDK>();
  const cma = useCMA();
  const [flagReferences, setFlagReferences] = useState<FlagReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentEntryId = sdk.entry.getSys().id;
  
  // Debug logging
  console.log('[Sidebar] Component loaded for entry:', currentEntryId);
  console.log('[Sidebar] Entry content type:', sdk.entry.getSys().contentType.sys.id);

  useEffect(() => {
    const checkForFlagReferences = async () => {
      try {
        setLoading(true);
        setError(null);

        // Query for all LaunchDarkly flag entries
        const flagEntries = await cma.entry.getMany({
          'content_type': LAUNCHDARKLY_FEATURE_FLAG_CONTENT_TYPE,
          limit: 100, // Get all flag entries
        } as any);

        const references: FlagReference[] = [];

        // Process each flag entry to check if it references our current entry
        for (const flagEntry of flagEntries.items) {
          try {
            const flagName = flagEntry.fields.name?.[sdk.locales.default] || 'Unnamed Flag';
            const flagKey = flagEntry.fields.key?.[sdk.locales.default] || 'unknown';
            const variations = flagEntry.fields.variations?.[sdk.locales.default] || [];
            const contentMappings = flagEntry.fields.contentMappings?.[sdk.locales.default];

            // Check which variation(s) this entry is used in
            if (contentMappings && typeof contentMappings === 'object') {
              Object.entries(contentMappings).forEach(([variationIndex, entryReference]) => {
                let entryId = entryReference;
                
                // Handle both string IDs and object references
                if (typeof entryReference === 'object' && entryReference !== null) {
                  if ('sys' in entryReference && typeof (entryReference as any).sys === 'object') {
                    entryId = (entryReference as any).sys.id;
                  }
                }
                
                // Check if this variation references our current entry
                if (typeof entryId === 'string' && entryId === currentEntryId) {
                  const variation = variations[parseInt(variationIndex)];
                  references.push({
                    flagKey,
                    flagName,
                    variationIndex: parseInt(variationIndex),
                    variationName: variation?.name || `Variation ${parseInt(variationIndex) + 1}`,
                    entryId: flagEntry.sys.id,
                    entryTitle: flagName
                  });
                }
              });
            }
          } catch (entryError) {
            console.warn('Failed to process flag entry:', flagEntry.sys.id, entryError);
          }
        }

        setFlagReferences(references);
      } catch (err) {
        console.error('Failed to check flag references:', err);
        setError(err instanceof Error ? err.message : 'Failed to check flag references');
      } finally {
        setLoading(false);
      }
    };

    checkForFlagReferences();
  }, [sdk, cma, currentEntryId]);

  const openLaunchDarklyEntry = (entryId: string) => {
    sdk.navigator.openEntry(entryId, { slideIn: true });
  };

  if (loading) {
    return (
      <Box padding="spacingS">
        <Flex alignItems="center" gap="spacingXs">
          <Spinner size="small" />
          <Text fontSize="fontSizeS">Checking flags...</Text>
        </Flex>
      </Box>
    );
  }

  if (error) {
    return (
      <Box padding="spacingS">
        <Note variant="negative">
          <Text fontSize="fontSizeS">
            Error checking flags
          </Text>
        </Note>
      </Box>
    );
  }

  if (flagReferences.length === 0) {
    return (
      <Box padding="spacingS">
        <Note variant="positive">
          <Text fontSize="fontSizeS">
            ✅ No flag dependencies
          </Text>
        </Note>
      </Box>
    );
  }

  return (
    <Box padding="spacingS">
      <Note variant="warning">
        <Stack spacing="spacing2Xs" marginTop="spacingXs" flexDirection="column" alignItems="flex-start">
          <Text fontSize="fontSizeM" fontWeight="fontWeightDemiBold" fontColor="gray900">
            LaunchDarkly Warning!
          </Text>
          <Text fontSize="fontSizeS" fontWeight="fontWeightMedium">
            This entry is associated with {flagReferences.length} flag{flagReferences.length > 1 ? 's' : ''}
          </Text>
          <Text fontSize="fontSizeS" fontColor="gray600">
            Changes may affect experiments or other experiences.
          </Text>
        </Stack>
        <Stack spacing="spacing2Xs" marginTop="spacingXs" flexDirection="column" alignItems="flex-start">
          <Text fontSize="fontSizeS" fontWeight="fontWeightMedium">Flag Entry References:</Text>
          {flagReferences.map((ref, index) => (
            <Text 
              key={index} 
              fontSize="fontSizeS" 
              fontColor="blue600"
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => openLaunchDarklyEntry(ref.entryId)}
            >
              {ref.flagName} ({ref.variationName})
            </Text>
          ))}
        </Stack>
      </Note>
    </Box>
  );
};

export default Sidebar; 