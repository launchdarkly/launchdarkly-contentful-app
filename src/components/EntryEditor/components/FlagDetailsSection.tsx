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
  configuredEnvironment: string;
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
  configuredEnvironment,
  createFlag,
  flagCreationLoading,
  onFlagCreated
}) => {
  const sdk = useSDK<EditorAppSDK>();
  const [flagCreated, setFlagCreated] = useState(false);
  const [keyManuallyEdited, setKeyManuallyEdited] = useState(false);

  useEffect(() => {
    if (launchDarklyFlags.length && formState.key) {
      const selectedFlag = launchDarklyFlags.find(flag => flag.key === formState.key);
      if (selectedFlag) {
        onSearchChange(`${selectedFlag.name} (${selectedFlag.key})`);
      }
    }
  }, [launchDarklyFlags, formState.key, onSearchChange]);

  // Reset manual edit tracking when mode changes or flag is created
  useEffect(() => {
    if (formState.mode === 'new' && !flagCreated) {
      setKeyManuallyEdited(false);
    }
  }, [formState.mode, flagCreated]);

  // Auto-generate key from name for new flags
  const handleNameChange = (value: string) => {
    onFormChange('name', value);
    // Only auto-generate key if user hasn't manually edited it and we're in create mode
    if (formState.mode === 'new' && value && !keyManuallyEdited && !flagCreated) {
      const generatedKey = sanitizeFlagKey(value);
      onFormChange('key', generatedKey);
    }
  };

  // Handle manual key changes
  const handleKeyChange = (value: string) => {
    setKeyManuallyEdited(true);
    onFormChange('key', value);
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

  // Handle transition to content mapping mode
  const handleStartContentMapping = () => {
    // Switch to existing flag mode to start content mapping
    onFormChange('mode', 'existing');
    sdk.notifier.success('Switched to content mapping mode!');
  };

  return (
    <Card padding="default">
      <Box paddingLeft="spacingM" paddingRight="spacingM">
        <Heading marginBottom="spacingL">
          {formState.mode === 'new' ? 'Create Flag Details' : 'Select Existing Flag'}
        </Heading>

        {/* Existing Flag Mode / Content Mapping Mode */}
        {formState.mode === 'existing' && (
          <div>
            {/* Existing flag selection */}
            <div style={{ marginBottom: '24px' }}>
              <FormControl>
                <Flex alignItems="center" gap="spacingXs">
                  <FormControl.Label>Select Flag</FormControl.Label>
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
            </div>

            {/* Show content mapping only after flag is selected */}
            {formState.key && (
              <div style={{ marginTop: '24px', borderTop: '1px solid #e5e8ed', paddingTop: '24px' }}>
                <Heading as="h3" marginBottom="spacingM">Map Content to Variations</Heading>
                <VariationContentSection
                  variations={formState.variations}
                  contentMappings={formState.contentMappings}
                  enhancedVariationContent={enhancedVariationContent}
                  onSelectContent={handleSelectVariationContent}
                  onEditEntry={handleEditEntry}
                  onRemoveContent={handleRemoveVariationContent}
                />
              </div>
            )}
          </div>
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
                    <Tooltip 
                      content={flagCreated ? "Flag name cannot be changed after creation. You can modify it in LaunchDarkly directly." : "The human-readable name of your feature flag as it will appear in LaunchDarkly"}
                      isVisible={flagCreated}
                    >
                      <TextInput
                        value={formState.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="My New Feature"
                        style={{ width: '100%' }}
                        isDisabled={flagCreated}
                      />
                    </Tooltip>
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
                    <Tooltip 
                      content={flagCreated ? "Flag key cannot be changed after creation. You can modify it in LaunchDarkly directly." : "The unique identifier for this flag in your code"}
                      isVisible={flagCreated}
                    >
                      <TextInput
                        value={formState.key}
                        onChange={(e) => handleKeyChange(e.target.value)}
                        placeholder="my-new-feature"
                        style={{ width: '100%' }}
                        isDisabled={flagCreated}
                      />
                    </Tooltip>
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
                    <Tooltip 
                      content={flagCreated ? "Flag description cannot be changed after creation. You can modify it in LaunchDarkly directly." : "A detailed explanation of what this feature flag controls"}
                      isVisible={flagCreated}
                    >
                      <Textarea
                        value={formState.description}
                        onChange={(e) => onFormChange('description', e.target.value)}
                        rows={3}
                        placeholder="Describe what this flag controls..."
                        style={{ width: '100%' }}
                        isDisabled={flagCreated}
                      />
                    </Tooltip>
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

              {/* Flag created success message with next steps */}
              {flagCreated && (
                <Card padding="default" style={{ backgroundColor: '#f0f9ff', border: '2px solid #3b82f6' }}>
                  <Stack spacing="spacingL" flexDirection="column" alignItems="flex-start" marginBottom="spacingS">
                    <Stack spacing="spacingS" alignItems="flex-start" flexDirection="column" marginBottom="spacingS">
                      <Note variant="positive">
                        🎉 Flag &quot;{formState.name}&quot; created successfully in LaunchDarkly!
                      </Note>
                      
                      <Text>
                        Your flag is now live in LaunchDarkly but <strong>turned off by default</strong> in all environments. 
                        To use this flag with Contentful, you can now map content to its variations. You can change the flag name and key <strong>in LaunchDarkly</strong> if needed.
                      </Text>
                    </Stack>
                    
                    <Stack spacing="spacingM">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          // Use the configured environment, fallback to production if not set
                          const envKey = configuredEnvironment || 'production';
                          const flagUrl = `https://app.launchdarkly.com/projects/${configuredProjectKey}/flags/${formState.key}/targeting?env=${envKey}&selected-env=${envKey}`;
                          window.open(flagUrl, '_blank');
                        }}
                      >
                        View in LaunchDarkly
                      </Button>
                      
                      <Button
                        variant="primary"
                        onClick={handleStartContentMapping}
                      >
                        Start Content Mapping →
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              )}
            </div>
          </Form>
        )}
      </Box>


    </Card>
  );
}; 