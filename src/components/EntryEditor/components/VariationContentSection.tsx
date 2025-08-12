import React from 'react';
import { Card, Box, Heading, Stack } from '@contentful/f36-components';
import { VariationContentMapping } from './VariationContentMapping';
import { EnhancedContentfulEntry } from '../types';

interface VariationContentSectionProps {
  variations: Array<{ name: string; value: any }>;
  contentMappings: Record<string, any>;
  enhancedVariationContent: Record<number, EnhancedContentfulEntry>;
  onSelectContent: (index: number, entry: EnhancedContentfulEntry) => void;
  onEditEntry: (entryId: string) => void;
  onRemoveContent: (index: number) => void;
}

export const VariationContentSection: React.FC<VariationContentSectionProps> = ({
  variations,
  contentMappings,
  enhancedVariationContent,
  onSelectContent,
  onEditEntry,
  onRemoveContent
}) => {
  // Early return if no variations
  if (!variations?.length) {
    return null;
  }

  return (
    <Box padding="spacingM">
      <Heading marginBottom="spacingL">Variations</Heading>
      <Stack spacing="spacingL" flexDirection="column" alignItems="stretch">
        {variations.map((variation, index) => (
          <VariationContentMapping
            key={index}
            variation={variation}
            variationIndex={index}
            entryLink={enhancedVariationContent[index]}
            onSelectContent={onSelectContent}
            onEditEntry={onEditEntry}
            onRemoveContent={() => onRemoveContent(index)}
          />
        ))}
      </Stack>
    </Box>
  );
}; 