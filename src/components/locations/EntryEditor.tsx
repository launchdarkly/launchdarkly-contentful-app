'use client';

import { EditorAppSDK } from '@contentful/app-sdk';
import { Button, Heading, Note, Flex, Text, Card, Box } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';

import { useState, useEffect } from 'react';

import { FlagDetailsSection } from '../EntryEditor/components/FlagDetailsSection';
import { ErrorBoundary } from '../../components/ErrorBoundary/index';

import { useErrorState, useFlags } from '@/hooks';
import { extractSimpleContentMapping } from '@/utils/contentMapping';
import { EnhancedContentfulEntry, FlagFormState } from '../EntryEditor/types';

const EntryEditor = () => {
  const sdk = useSDK<EditorAppSDK>();
  const { error, handleError, clearError } = useErrorState('EntryEditor');
  const [enhancedVariationContent, setEnhancedVariationContent] = useState<Record<number, EnhancedContentfulEntry>>({});
  
  // Basic form state
  const [formState, setFormState] = useState<FlagFormState>({
    variations: [],
    flagDetails: {},
    name: '',
    key: '',
    description: ''
  });
  // Loading state
  const [loading, setLoading] = useState({ entry: true, saving: false });
  // UI state
  const [search, setSearch] = useState('');
  const { flags: launchDarklyFlags, loading: flagsLoading } = useFlags(search);

  useEffect(() => {
    const loadSavedEntryData = async () => {
      try {
        setLoading(prev => ({ ...prev, entry: true }));
        const fields = sdk.entry.fields;
  
        const savedState = {
          variations: fields.variations?.getValue() || [],
          flagDetails: fields.flagDetails?.getValue() || {},
          name: fields.name?.getValue() || '',
          key: fields.key?.getValue() || '',
          description: fields.description?.getValue() || ''
        };
  
        const flagDetails = savedState.flagDetails || {};
        const enhancedContent: Record<number, EnhancedContentfulEntry> = {};
  
        await Promise.all(
          Object.entries(flagDetails).map(async ([index, entryIdOrObj]) => {
            let entryId = entryIdOrObj;
            if (
              typeof entryIdOrObj === 'object' &&
              entryIdOrObj !== null &&
              'sys' in entryIdOrObj &&
              typeof (entryIdOrObj as any).sys.id === 'string'
            ) {
              entryId = (entryIdOrObj as any).sys.id;
            }
            if (entryId) {
              const enhanced = await fetchEnhancedEntry(String(entryId), sdk);
              if (enhanced) {
                enhancedContent[Number(index)] = enhanced;
              }
            }
          })
        );
  
        setFormState(savedState);
        setEnhancedVariationContent(enhancedContent);
      } catch (err) {
        handleError(err instanceof Error ? err : new Error('Failed to load entry data'));
      } finally {
        setLoading(prev => ({ ...prev, entry: false }));
      }
    };
    loadSavedEntryData();
  }, [sdk.entry, handleError]);

  const fetchEnhancedEntry = async (entryId: string, sdk: EditorAppSDK) => {
    try {
      const entry = await sdk.cma.entry.get({ entryId });
      const contentType = await sdk.cma.contentType.get({ contentTypeId: entry.sys.contentType.sys.id });
      return {
        sys: {
          id: entryId,
          type: 'Link',
          linkType: 'Entry'
        },
        metadata: {
          entryTitle: entry.fields[contentType.displayField]?.[sdk.locales.default] || 'Untitled',
          contentTypeName: contentType.name,
          contentTypeId: contentType.sys.id
        }
      };
    } catch (err) {
      console.error('Failed to fetch entry for id', entryId, err);
      return undefined;
    }
  };

  // Handle flag selection
  const handleFlagSelect = (item: any) => {
    if (!item) return;
    
    setFormState(prev => ({
      ...prev,
      variations: item.variations || [],
      name: item.name || '',
      key: item.key || '',
      description: item.description || '',
    }));
  };

  // Handle saving
  const handleSave = async () => {
    if (loading.saving) return;
    
    try {
      setLoading(prev => ({ ...prev, saving: true }));

      const simpleMapping = extractSimpleContentMapping({
        ...formState,
        enhancedVariationContent,
      });

         // Log the data that will be saved
      console.log('Saving the following data:', {

        variations: formState.variations,
        flagDetails: simpleMapping,
        name: formState.name,
        key: formState.key,
        description: formState.description
      });
      
      const fields = sdk.entry.fields;
      await fields.variations?.setValue(formState.variations);
      await fields.flagDetails?.setValue(simpleMapping);
      await fields.name?.setValue(formState.name);
      await fields.key?.setValue(formState.key);
      await fields.description?.setValue(formState.description);
      
      await sdk.entry.save();
      sdk.notifier.success('Flag mapping saved.');
      clearError();
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Failed to save changes'));
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  if (loading.entry || (flagsLoading && !launchDarklyFlags)) {
    return (
      <ErrorBoundary componentName="EntryEditor" onError={handleError}>
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '16px' }}>
          <Text>Loading entry data...</Text>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary componentName="EntryEditor" onError={handleError}>
      <div style={{ maxWidth: '100%', margin: '0 auto', padding: '16px' }}>
        {error.message && (
          <Note variant="negative" style={{ marginBottom: '16px' }}>{error.message}</Note>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <Card padding="default">
            <Box paddingLeft="spacingM" paddingRight="spacingM">
              <Heading marginBottom='spacing2Xs'>Link a LaunchDarkly Flag</Heading>
              <Text fontColor="gray600">
                Select a feature flag to link to this entry. Then, assign content to each variation.
              </Text>
            </Box>
          </Card>

          <FlagDetailsSection
            formState={formState}
            launchDarklyFlags={launchDarklyFlags || []}
            flagsLoading={flagsLoading}
            search={search}
            onSearchChange={setSearch}
            onFlagSelect={handleFlagSelect}
            onVariationsChange={(newVariations) => 
              setFormState(prev => ({ ...prev, variations: newVariations }))
            }
            flagStatus={{ isLive: false, isExperiment: false }}
            enhancedVariationContent={enhancedVariationContent}
            setEnhancedVariationContent={setEnhancedVariationContent}
          />

          <Flex justifyContent="flex-end" marginTop="spacingL">
            <Button
              variant="primary"
              onClick={handleSave}
              isDisabled={!formState.key}
              isLoading={loading.saving}
            >
              Save Entry & Link Flag
            </Button>
          </Flex>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default EntryEditor;
