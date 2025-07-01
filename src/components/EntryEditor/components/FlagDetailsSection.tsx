import React, { useCallback, useEffect, useState } from 'react';
import { Card, Heading, Stack, Text, Autocomplete, Box, Form, FormControl, TextInput, Textarea, Flex, Tooltip, Switch, Note, Button } from '@contentful/f36-components';
import { InfoCircleIcon } from '@contentful/f36-icons';
import { useSDK } from '@contentful/react-apps-toolkit';
import { EditorAppSDK } from '@contentful/app-sdk';
import { FlagFormState, EnhancedContentfulEntry } from '../types';
import { FlagStatus } from '../hooks/useFlagData';
import { VariationContentSection } from './VariationContentSection';
import { VariationsForm } from './VariationsForm';
import { validateFlagData } from '@/utils/validation';
import { sanitizeFlagKey } from '@/utils/validation';
import { CreateFlagData } from '@/types/launchdarkly';

interface FlagDetailsSectionProps {
  formState: FlagFormState;
  launchDarklyFlags: any[];
  flagsLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onFlagSelect: (item: any) => void;
  onVariationsChange: (variations: any[]) => void;
  onFormChange: (field: keyof FlagFormState, value: any) => void;
  flagStatus: FlagStatus;
  enhancedVariationContent: Record<number, EnhancedContentfulEntry>;
  setEnhancedVariationContent: React.Dispatch<React.SetStateAction<Record<number, EnhancedContentfulEntry>>>;
  validationErrors?: Record<string, string>;
  configuredProjectKey: string;
  createFlag: (projectKey: string, flagData: CreateFlagData) => Promise<any>;
  flagCreationLoading: boolean;
  onFlagCreated?: (flag: any) => void;
}

export const FlagDetailsSection: React.FC<FlagDetailsSectionProps> = ({
  formState,
  launchDarklyFlags,
  flagsLoading,
  search,
  enhancedVariationContent,
  onSearchChange,
  onFlagSelect,
  onFormChange,
  setEnhancedVariationContent,
  validationErrors = {},
  configuredProjectKey,
  createFlag,
  flagCreationLoading,
  onFlagCreated
}) => {
  const sdk = useSDK<EditorAppSDK>();
  const [flagCreated, setFlagCreated] = useState(false);

  useEffect(() => {
    if (launchDarklyFlags.length && formState.key) {
      const selectedFlag = launchDarklyFlags.find(flag => flag.key === formState.key);
      if (selectedFlag) {
        onSearchChange(`${selectedFlag.name} (${selectedFlag.key})`);
      }
    }
  }, [launchDarklyFlags, formState.key, onSearchChange]);

  // Auto-generate key from name for new flags
  const handleNameChange = (value: string) => {
    onFormChange('name', value);
    if (formState.mode === 'new' && value && !formState.key) {
      const generatedKey = sanitizeFlagKey(value);
      onFormChange('key', generatedKey);
    }
  };

  // Handle existing flag selection and loading details
  const handleExistingFlagSelect = async (flag: { key: string; name: string }) => {
    if (!flag) return;
    
    onFormChange('existingFlagKey', flag.key);
    
    // Load the full flag details
    try {
      // This would be implemented to load flag details from LaunchDarkly
      onFlagSelect(flag);
    } catch (error) {
      sdk.notifier.error('Failed to load flag details');
    }
  };

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

  // Handle flag creation
  const handleCreateFlag = async () => {
    if (!configuredProjectKey) {
      sdk.notifier.error('No LaunchDarkly project configured. Please configure the app first.');
      return;
    }

    // Validate form before creating
    const validationResult = validateFlagData({
      name: formState.name,
      key: formState.key,
      description: formState.description,
      variations: formState.variations,
      kind: formState.variationType
    });

    if (!validationResult.isValid) {
      sdk.notifier.error('Please fix validation errors before creating the flag.');
      return;
    }

    const flagData: CreateFlagData = {
      name: formState.name,
      key: formState.key,
      description: formState.description,
      kind: formState.variationType,
      variations: formState.variations,
      tags: formState.tags || [],
      temporary: formState.temporary || false
    };

    try {
      sdk.notifier.success('Creating flag in LaunchDarkly...');
      const createdFlag = await createFlag(configuredProjectKey, flagData);
      console.log('Flag created successfully:', createdFlag);
      
      // Update form state with created flag data
      onFormChange('name', createdFlag.name || formState.name);
      onFormChange('key', createdFlag.key || formState.key);
      onFormChange('description', createdFlag.description || formState.description);
      onFormChange('variations', createdFlag.variations || formState.variations);
      
      setFlagCreated(true);
      
      // Notify parent that flag was created
      if (onFlagCreated) {
        onFlagCreated(createdFlag);
      }
      
      sdk.notifier.success(`Flag "${formState.name}" created successfully!`);
      
    } catch (flagCreationErr) {
      console.error('Flag creation failed:', flagCreationErr);
      sdk.notifier.error(`Failed to create flag: ${flagCreationErr instanceof Error ? flagCreationErr.message : 'Unknown error'}`);
    }
  };

  return (
    <Card padding="default">
      <Box paddingLeft="spacingM" paddingRight="spacingM">
        <Heading marginBottom="spacingL">
          Step 2: {formState.mode === 'new' ? 'Create Flag Details' : 'Select Existing Flag'}
        </Heading>

        {/* Existing Flag Mode */}
        {formState.mode === 'existing' && (
          <Form>
            <FormControl>
              <Flex alignItems="center" gap="spacingXs">
                <FormControl.Label>Search Existing Flags</FormControl.Label>
                <Tooltip content="Search and choose an existing LaunchDarkly feature flag to link">
                  <InfoCircleIcon variant="secondary" size="tiny" />
                </Tooltip>
              </Flex>
              <Autocomplete
                id="flag-autocomplete"
                items={launchDarklyFlags}
                onInputValueChange={onSearchChange}
                onSelectItem={handleExistingFlagSelect}
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
                placeholder="Search by name or key..."
              />
            </FormControl>
          </Form>
        )}

        {/* New Flag Mode */}
        {formState.mode === 'new' && (
          <Form>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '24px',
              width: '100%'
            }}>
              {formState.projectKey && (
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#f8f9fa', 
                  border: '1px solid #e9ecef', 
                  borderRadius: '4px'
                }}>
                  <Text fontSize="fontSizeS" fontColor="gray600">
                    Creating flag in project: <strong>{formState.projectKey}</strong> (configured in app settings)
                  </Text>
                </div>
              )}
              
              <div style={{ width: '100%' }}>
                <FormControl isRequired isInvalid={!!validationErrors.name}>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px',
                    width: '100%'
                  }}>
                    <Flex alignItems="center" gap="spacingXs">
                      <FormControl.Label>Flag Name</FormControl.Label>
                      <Tooltip content="The human-readable name of your feature flag as it will appear in LaunchDarkly">
                        <InfoCircleIcon variant="secondary" size="tiny" />
                      </Tooltip>
                    </Flex>
                    <TextInput
                      value={formState.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="My New Feature"
                      style={{ width: '100%' }}
                    />
                    {validationErrors.name && (
                      <FormControl.ValidationMessage>{validationErrors.name}</FormControl.ValidationMessage>
                    )}
                  </div>
                </FormControl>
              </div>

              <div style={{ width: '100%' }}>
                <FormControl isRequired isInvalid={!!validationErrors.key}>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px',
                    width: '100%'
                  }}>
                    <Flex alignItems="center" gap="spacingXs">
                      <FormControl.Label>Flag Key</FormControl.Label>
                      <Tooltip content="The unique identifier for this flag in your code">
                        <InfoCircleIcon variant="secondary" size="tiny" />
                      </Tooltip>
                    </Flex>
                    <TextInput
                      value={formState.key}
                      onChange={(e) => onFormChange('key', e.target.value)}
                      placeholder="my-new-feature"
                      style={{ width: '100%' }}
                    />
                    {validationErrors.key && (
                      <FormControl.ValidationMessage>{validationErrors.key}</FormControl.ValidationMessage>
                    )}
                  </div>
                </FormControl>
              </div>

              <div style={{ width: '100%' }}>
                <FormControl>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px',
                    width: '100%'
                  }}>
                    <Flex alignItems="center" gap="spacingXs">
                      <FormControl.Label>Description</FormControl.Label>
                      <Tooltip content="A detailed explanation of what this feature flag controls">
                        <InfoCircleIcon variant="secondary" size="tiny" />
                      </Tooltip>
                    </Flex>
                    <Textarea
                      value={formState.description}
                      onChange={(e) => onFormChange('description', e.target.value)}
                      rows={3}
                      placeholder="Describe what this flag controls..."
                      style={{ width: '100%' }}
                    />
                    {validationErrors.description && (
                      <FormControl.ValidationMessage>{validationErrors.description}</FormControl.ValidationMessage>
                    )}
                  </div>
                </FormControl>
              </div>

              {/* Variations Form for create mode */}
              {formState.name && formState.key && !flagCreated && (
                <div style={{ width: '100%' }}>
                  <Heading as="h3" marginBottom="spacingM">Flag Variations</Heading>
                  <VariationsForm
                    formState={formState}
                    onFormChange={onFormChange}
                    validationErrors={validationErrors}
                    isEditingEnabled={!flagCreationLoading}
                  />
                </div>
              )}

              {/* Create Flag Button */}
              {formState.name && formState.key && formState.variations.length >= 2 && !flagCreated && (
                <Flex justifyContent="flex-end" marginTop="spacingL">
                  <Button
                    variant="primary"
                    onClick={handleCreateFlag}
                    isLoading={flagCreationLoading}
                    isDisabled={flagCreationLoading}
                  >
                    {flagCreationLoading ? 'Creating Flag...' : 'Create Flag in LaunchDarkly'}
                  </Button>
                </Flex>
              )}

              {/* Flag created success message */}
              {flagCreated && (
                <Note variant="positive" style={{ marginTop: '16px' }}>
                  Flag successfully created in LaunchDarkly! You can now proceed to map content.
                </Note>
              )}
            </div>
          </Form>
        )}
      </Box>

      {/* Show content mapping only after flag exists (either selected existing or created new) */}
      {formState.key && (
        (formState.mode === 'existing' || (formState.mode === 'new' && flagCreated))
      ) && (
        <div style={{ marginTop: '24px', borderTop: '1px solid #e5e8ed', paddingTop: '24px' }}>
          <Heading as="h3" marginBottom="spacingM">Step 3: Map Content to Variations</Heading>
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