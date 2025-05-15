import React, { useCallback, useEffect } from 'react';
import { Card, Heading, Stack, Text, Autocomplete, Box } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { EditorAppSDK } from '@contentful/app-sdk';
import { FlagFormState, EnhancedContentfulEntry } from '../types';
import { FlagStatus } from '../hooks/useFlagData';
import { VariationContentSection } from './VariationContentSection';

interface FlagDetailsSectionProps {
  formState: FlagFormState;
  launchDarklyFlags: any[];
  flagsLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onFlagSelect: (item: any) => void;
  onVariationsChange: (variations: any[]) => void;
  flagStatus: FlagStatus;
  enhancedVariationContent: Record<number, EnhancedContentfulEntry>;
  setEnhancedVariationContent: React.Dispatch<React.SetStateAction<Record<number, EnhancedContentfulEntry>>>;
}

export const FlagDetailsSection: React.FC<FlagDetailsSectionProps> = ({
  formState,
  launchDarklyFlags,
  flagsLoading,
  search,
  enhancedVariationContent,
  onSearchChange,
  onFlagSelect,
  setEnhancedVariationContent, 
}) => {
  const sdk = useSDK<EditorAppSDK>();

  useEffect(() => {
    if (launchDarklyFlags.length && formState.key) {
      const selectedFlag = launchDarklyFlags.find(flag => flag.key === formState.key);
      if (selectedFlag) {
        onSearchChange(`${selectedFlag.name} (${selectedFlag.key})`);
      }
    }
  }, [launchDarklyFlags, formState.key, onSearchChange]);

  const handleSelectVariationContent = useCallback((variationIndex: number, entryLink: EnhancedContentfulEntry) => {
    setEnhancedVariationContent(prev => ({
      ...prev,
      [variationIndex]: entryLink,
    }));
  }, [setEnhancedVariationContent]);

  const handleRemoveVariationContent = useCallback((variationIndex: number) => {
    setEnhancedVariationContent(prev => {
      const newContent = { ...prev };
      delete newContent[variationIndex];
      return newContent;
    });
  }, [setEnhancedVariationContent]);

  // Handler for editing an entry
  const handleEditEntry = useCallback(async (entryId: string) => {
    try {
      await sdk.navigator.openEntry(entryId, { slideIn: { waitForClose: true } });
    } catch (error) {
      sdk.notifier.error('Failed to open entry');
    }
  }, [sdk]);

  return (
    <Card padding="default">
      <Box paddingLeft="spacingM" paddingRight="spacingM">
        <Heading marginBottom="spacingL">Flag Details</Heading>

        <Autocomplete
          id="flag-autocomplete"
          items={launchDarklyFlags}
          onInputValueChange={onSearchChange}
          onSelectItem={onFlagSelect}
          itemToString={(item) => (item ? `${item.name} (${item.key})` : '')}
          isLoading={flagsLoading}
          renderItem={(item) => item ? (
            <Stack spacing="spacingXs">
              <Text fontWeight="fontWeightMedium">{item.name}</Text>
              <Text fontColor="gray600" fontSize="fontSizeS">({item.key})</Text>
            </Stack>
          ) : null}
          inputValue={search}
          selectedItem={launchDarklyFlags.find(flag => flag.key === formState.key) || null}
        />
      </Box>

      {formState.key && (
        <div style={{ marginTop: '12px' }}>
          {/* Variation Content Mapping Section */}
          <VariationContentSection
            variations={formState.variations}
            flagDetails={formState.flagDetails}
            enhancedVariationContent={enhancedVariationContent}
            onSelectContent={handleSelectVariationContent}
            onEditEntry={handleEditEntry}
            onRemoveContent={handleRemoveVariationContent}
          />
        </div>
      )}
    </Card>
  );
}; 