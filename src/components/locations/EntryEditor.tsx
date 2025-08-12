'use client';

import { EditorAppSDK } from '@contentful/app-sdk';
import { Button, Heading, Note, Flex, Text, Card, Box } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';

import { useState, useEffect } from 'react';

import { FlagDetailsSection } from '../EntryEditor/components/FlagDetailsSection';
import { ModeSelection } from '../EntryEditor/components/ModeSelection';

import { ErrorBoundary } from '../../components/ErrorBoundary/index';

import { useErrorState, useFlags, useUnsavedChanges, useFlagCreation } from '@/hooks';
import { extractSimpleContentMapping } from '@/utils/contentMapping';
import { validateFlagData } from '@/utils/validation';
import { EnhancedContentfulEntry, FlagFormState } from '../EntryEditor/types';
import { FlagMode, CreateFlagData } from '@/types/launchdarkly';

const FLAG_CONTENT_TYPE_ID = 'launchDarklyFeatureFlag';

const EntryEditor = () => {
  const sdk = useSDK<EditorAppSDK>();
  const { error, handleError, clearError } = useErrorState('EntryEditor');
  const [enhancedVariationContent, setEnhancedVariationContent] = useState<Record<number, EnhancedContentfulEntry>>({});
  
  // Add state to track if we have existing content mappings
  const [hasExistingMappings, setHasExistingMappings] = useState(false);
  
  // Basic form state with proper defaults for enhanced FlagFormState
  const [formState, setFormState] = useState<FlagFormState>({
    variations: [],
    contentMappings: {},
    name: '',
    key: '',
    description: '',
    projectKey: '',
    variationType: 'boolean',
    defaultVariation: 0,
    tags: [],
    temporary: false,
    mode: null,
    rolloutConfig: {
      percentage: 0,
      userSegments: [],
      startDate: '',
      endDate: ''
    },
    scheduledRelease: {
      enabled: false,
      releaseDate: '',
      environments: []
    },
    previewSettings: {
      enablePreviewFlags: false,
      previewEnvironment: 'production',
      autoCreatePreviewFlags: false
    },
    dependencies: []
  });
  // Loading state
  const [loading, setLoading] = useState({ entry: true, saving: false });
  // Track if initial load is complete
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  // Store configured project key and environment from app parameters
  const [configuredProjectKey, setConfiguredProjectKey] = useState<string>('');
  const [configuredEnvironment, setConfiguredEnvironment] = useState<string>('');
  // UI state
  const [search, setSearch] = useState('');
  const { flags: launchDarklyFlags, loading: flagsLoading } = useFlags(search);
  
  // Track unsaved changes
  const { hasUnsavedChanges, markAsSaved, resetLastSavedState } = useUnsavedChanges(formState);
  
  // Flag creation hook
  const { createFlag, loading: flagCreationLoading, error: flagCreationError } = useFlagCreation();
  
  // Combined loading state for UI
  const isSaving = loading.saving || flagCreationLoading;
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Only run the initial load once
    if (initialLoadComplete) return;
    
    const loadSavedEntryData = async () => {
      try {
        setLoading(prev => ({ ...prev, entry: true }));
        
        // Get configured project key and environment from app parameters (compatible with different SDK types)
        let projectKey = '';
        let environment = '';
        if ('app' in sdk && typeof (sdk as any).app?.getParameters === 'function') {
          const appParameters = await (sdk as any).app.getParameters();
          projectKey = appParameters?.launchDarklyProjectKey || '';
          environment = appParameters?.launchDarklyEnvironment || '';
        } else {
          projectKey = (sdk as any).parameters?.installation?.launchDarklyProjectKey || '';
          environment = (sdk as any).parameters?.installation?.launchDarklyEnvironment || '';
        }
        setConfiguredProjectKey(projectKey);
        setConfiguredEnvironment(environment);
        
        const fields = sdk.entry.fields;
        
        // Check if there are existing content mappings
        const existingContentMappings = fields.contentMappings?.getValue() || {};
        const hasMappings = Object.keys(existingContentMappings).length > 0;
        setHasExistingMappings(hasMappings);
  
        const savedState: FlagFormState = {
          variations: fields.variations?.getValue() || [],
          contentMappings: existingContentMappings,
          name: fields.name?.getValue() || '',
          key: fields.key?.getValue() || '',
          description: fields.description?.getValue() || '',
          projectKey: projectKey, // Use configured project key
          variationType: fields.variationType?.getValue() || 'boolean',
          defaultVariation: fields.defaultVariation?.getValue() || 0,
          tags: fields.tags?.getValue() || [],
          temporary: fields.temporary?.getValue() || false,
          // Auto-set mode to 'existing' if there are existing mappings, otherwise use saved mode or null
          mode: hasMappings ? 'existing' : (fields.mode?.getValue() || null),
          rolloutStrategy: fields.rolloutStrategy?.getValue(),
          rolloutConfig: fields.rolloutConfig?.getValue() || {
            percentage: 0,
            userSegments: [],
            startDate: '',
            endDate: ''
          },
          scheduledRelease: fields.scheduledRelease?.getValue() || {
            enabled: false,
            releaseDate: '',
            environments: []
          },
          previewSettings: fields.previewSettings?.getValue() || {
            enablePreviewFlags: false,
            previewEnvironment: 'production',
            autoCreatePreviewFlags: false
          },
          dependencies: fields.dependencies?.getValue() || []
        };
  
        const contentMappings = savedState.contentMappings || {};
        const enhancedContent: Record<number, EnhancedContentfulEntry> = {};
  
        await Promise.all(
          Object.entries(contentMappings).map(async ([index, entryIdOrObj]) => {
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
        setInitialLoadComplete(true); // Mark initial load as complete
      } catch (err) {
        handleError(err instanceof Error ? err : new Error('Failed to load entry data'));
      } finally {
        setLoading(prev => ({ ...prev, entry: false }));
      }
    };
    loadSavedEntryData();
  }, [sdk.entry, handleError, initialLoadComplete]);

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

  // Handle mode change
  const handleModeChange = (newMode: FlagMode) => {
    setFormState(prev => ({
      ...prev,
      mode: newMode
    }));
  };

  // Reset form to initial state
  const resetForm = (newMode?: FlagMode) => {
    // Use the provided newMode or fall back to current mode
    const modeToUse = newMode !== undefined ? newMode : formState.mode;
    
    const defaultState: FlagFormState = {
      variations: [],
      contentMappings: {},
      name: '',
      key: '',
      description: '',
      projectKey: formState.projectKey, // Keep project key
      variationType: 'boolean',
      defaultVariation: 0,
      tags: [],
      temporary: false,
      mode: modeToUse, // Use the correct mode
      rolloutConfig: {
        percentage: 0,
        userSegments: [],
        startDate: '',
        endDate: ''
      },
      scheduledRelease: {
        enabled: false,
        releaseDate: '',
        environments: []
      },
      previewSettings: {
        enablePreviewFlags: false,
        previewEnvironment: 'production',
        autoCreatePreviewFlags: false
      },
      dependencies: []
    };
    setFormState(defaultState);
    setEnhancedVariationContent({});
    resetLastSavedState(defaultState);
  };

  // Load existing flags when switching to 'existing' mode
  const loadExistingFlags = () => {
    // The useFlags hook already loads flags based on search
    // This function is for compatibility with ModeSelection
    console.log('Loading existing flags...');
  };

  // Handle form changes with validation
  const handleFormChange = (field: keyof FlagFormState, value: any) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
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
      existingFlagKey: item.key || '',
    }));
  };

  // Validate form before saving
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (formState.mode === 'new') {
      // Check if project key is configured in app settings
      if (!configuredProjectKey) {
        errors.general = 'No LaunchDarkly project configured. Please configure the app in Settings first.';
        setValidationErrors(errors);
        return false;
      }

      const flagData: CreateFlagData = {
        name: formState.name,
        key: formState.key,
        description: formState.description,
        kind: formState.variationType,
        variations: formState.variations,
        tags: formState.tags,
        temporary: formState.temporary
      };
      
      const validation = validateFlagData(flagData);
      Object.assign(errors, validation.errors);
    } else {
      // For existing flags, just check that we have a key
      if (!formState.key) {
        errors.key = 'Please select a flag';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle saving - now only for content mapping mode
  const handleSave = async () => {
    if (isSaving) return;
    
    // Only allow saving in existing/mapping mode
    if (formState.mode !== 'existing') {
      sdk.notifier.error('Saving is only available in content mapping mode.');
      return;
    }
    
    // Validate form before saving
    if (!validateForm()) {
      sdk.notifier.error('Please fix validation errors before saving');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, saving: true }));

      // Ensure we have a flag selected for content mapping
      if (!formState.key) {
        sdk.notifier.error('Please select a flag before saving content mapping.');
        return;
      }

      // Now save content mapping to Contentful
      const simpleMapping = extractSimpleContentMapping({
        ...formState,
        enhancedVariationContent,
      });

      console.log('Saving content mapping to Contentful:', {
        variations: formState.variations,
        contentMappings: simpleMapping,
        name: formState.name,
        key: formState.key,
        description: formState.description,
        mode: formState.mode
      });
      
      const fields = sdk.entry.fields;
      await fields.variations?.setValue(formState.variations);
      await fields.contentMappings?.setValue(simpleMapping);
      await fields.name?.setValue(formState.name);
      await fields.key?.setValue(formState.key);
      await fields.description?.setValue(formState.description);
      await fields.mode?.setValue(formState.mode);
      await fields.projectKey?.setValue(configuredProjectKey);
      await fields.existingFlagKey?.setValue(formState.existingFlagKey);
      await fields.variationType?.setValue(formState.variationType);
      await fields.tags?.setValue(formState.tags);
      await fields.temporary?.setValue(formState.temporary);
      
      await sdk.entry.save();
      
      // Success messaging
      sdk.notifier.success('Content mapping saved successfully!');
      
      markAsSaved(); // Mark changes as saved
      setValidationErrors({}); // Clear validation errors
      clearError();
    } catch (err) {
      console.error('Save failed:', err);
      handleError(err instanceof Error ? err : new Error('Failed to save changes'));
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  // Get the current entry's content type ID
  const contentTypeId = sdk.entry.getSys().contentType.sys.id;

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
      <div style={{ maxWidth: '100%', margin: '0 auto', padding: '16px', paddingBottom: '32px' }}>
        {error.message && (
          <Note variant="negative" style={{ marginBottom: '16px' }}>{error.message}</Note>
        )}
        
        {flagCreationError && (
          <Note variant="negative" style={{ marginBottom: '16px' }}>
            Flag Creation Error: {flagCreationError}
          </Note>
        )}
        
        {validationErrors.general && (
          <Note variant="negative" style={{ marginBottom: '16px' }}>
            {validationErrors.general}
          </Note>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <Card padding="default">
            <Box paddingLeft="spacingM" paddingRight="spacingM">
              <Heading marginBottom='spacing2Xs'>LaunchDarkly Flag Management</Heading>
              <Text fontColor="gray600">
                {hasExistingMappings 
                  ? 'Manage your existing content mappings for this entry.'
                  : 'Create a new feature flag or link an existing one to this entry.'
                }
              </Text>
              
              {!hasExistingMappings && (
                <Card padding="default" style={{ backgroundColor: '#f0f9ff', border: '2px solid #3b82f6', marginTop: '16px' }}>
                  <Text fontColor="gray700" fontSize="fontSizeS">
                    <strong>Note:</strong> Feature flags are the basis for <strong>Experimentation</strong> in LaunchDarkly. If you need more information about Experiments in LaunchDarkly, see our documentation here: <a href="https://docs.launchdarkly.com/docs/experiments" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>https://docs.launchdarkly.com/docs/experiments</a>
                  </Text>
                </Card>
              )}
            </Box>
          </Card>

          {/* Mode Selection - only show if no existing mappings */}
          {!hasExistingMappings && (
            <ModeSelection
              flagMode={formState.mode}
              onModeChange={handleModeChange}
              onLoadExistingFlags={loadExistingFlags}
              hasUnsavedChanges={hasUnsavedChanges}
              onResetForm={resetForm}
            />
          )}

          {/* Show flag details if mode is selected OR if we have existing mappings */}
          {(formState.mode || hasExistingMappings) && (
            <FlagDetailsSection
              formState={formState}
              launchDarklyFlags={launchDarklyFlags || []}
              flagsLoading={flagsLoading}
              search={search}
              onSearchChange={setSearch}
              onFlagSelect={handleFlagSelect}
              onFormChange={handleFormChange}
              onVariationsChange={(newVariations) => 
                setFormState(prev => ({ ...prev, variations: newVariations }))
              }
              flagStatus={{ isLive: false, isExperiment: false }}
              enhancedVariationContent={enhancedVariationContent}
              setEnhancedVariationContent={setEnhancedVariationContent}
              validationErrors={validationErrors}
              configuredProjectKey={configuredProjectKey}
              configuredEnvironment={configuredEnvironment}
              createFlag={createFlag}
              flagCreationLoading={flagCreationLoading}
              onFlagCreated={(flag) => {
                // Clear validation errors when flag is created successfully
                setValidationErrors({});
              }}
            />
          )}

          {/* Save button - always show but disable when not ready */}
          {formState.mode === 'existing' && (
            <Flex justifyContent="flex-end" marginTop="spacingL">
              <Button
                variant="primary"
                onClick={handleSave}
                isDisabled={loading.saving || !formState.key || Object.keys(enhancedVariationContent).length === 0}
                isLoading={loading.saving}
              >
                {loading.saving 
                  ? 'Saving Content Mapping...' 
                  : 'Save Content Mapping'
                }
              </Button>
            </Flex>
          )}

          {/* FlagControls removed for security - users should only create flags, not modify them */}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default EntryEditor;

