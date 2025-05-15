import React, { useState, useEffect } from 'react';
import { Card, Subheading, Stack, Text, Button, Box } from '@contentful/f36-components';
import { VariationContentSelector } from './VariationContentSelector';
import { EntryPreview } from './EntryPreview';
import { useEntryData } from '../hooks/useEntryData';
import { VariationContentMappingProps } from '../types';

export const VariationContentMapping: React.FC<VariationContentMappingProps> = ({
  variation,
  variationIndex,
  entryLink,
  onSelectContent,
  onEditEntry,
  onRemoveContent
}) => {
  const { entryData, loading } = useEntryData(entryLink);
  const [showSelector, setShowSelector] = useState(!entryLink);
  
  // Reset showSelector when entryLink changes
  useEffect(() => {
    if (!entryLink) {
      setShowSelector(true);
    }
  }, [entryLink, variationIndex]);
  
  // Force update on refresh trigger
  useEffect(() => {
    if (!entryLink) {
      setShowSelector(true);
    }
  }, [entryLink, variationIndex]);

  // When removing content, immediately show selector and prevent default
  const handleRemove = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    console.log('[VariationContentMapping] Removing content for variation:', variationIndex);
    setShowSelector(true);
    onRemoveContent();
  };

  // If no entry link, always show selector
  if (!entryLink || showSelector) {
    return (
      <Card padding="default">
        <Stack spacing="spacingM"
               alignItems="center"
               justifyContent="space-between"
               flexDirection="row"
               style={{ width: '100%' }}>
          <Box>
            <Subheading marginBottom="none">{variation.name}</Subheading>
            <Text fontColor="gray500" fontSize="fontSizeS" marginTop="spacing2Xs">
              LaunchDarkly Value: <span style={{ fontWeight: 'bold' }}>{typeof variation.value === 'string' ? variation.value : JSON.stringify(variation.value)}</span>
            </Text>
          </Box>
          <VariationContentSelector
            variationName={variation.name}
            variationIndex={variationIndex}
            onSelectContent={(idx, entry) => {
              setShowSelector(false);
              onSelectContent(idx, entry);
            }}
          />
        </Stack>
      </Card>
    );
  }
  
  // Loading state
  if (loading) {
    return (
      <Card padding="default">
        <Stack spacing="spacingM">
          <Subheading>{variation.name} ({JSON.stringify(variation.value)})</Subheading>
          <Text>Loading content...</Text>
        </Stack>
      </Card>
    );
  }

  // Otherwise show the preview
  return (
    <Card padding="default" marginBottom="spacingL">
      <Stack spacing="spacingS" flexDirection="column" alignItems="stretch">
        <Box paddingLeft="spacingM" style={{ marginTop: '8px' }}>
          <Subheading marginBottom="none">{variation.name}</Subheading>
          <Text fontColor="gray500" fontSize="fontSizeS" marginTop="spacing2Xs">
            LaunchDarkly Value: <span style={{ fontWeight: 'bold' }}>{typeof variation.value === 'string' ? variation.value : JSON.stringify(variation.value)}</span>
          </Text>
        </Box>
        {entryData && (
          <Stack spacing="spacingM" flexDirection="row" alignItems="flex-start" justifyContent="space-between">
            <EntryPreview
              entryId={entryLink.sys.id}
              onEdit={onEditEntry}
              onRemove={handleRemove}
            />
            <Box paddingTop="spacingM">
              <Button 
                onClick={handleRemove} 
                variant="negative"
                id={`remove-content-${variationIndex}`}
              >
                Remove Content
              </Button>
            </Box>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}; 